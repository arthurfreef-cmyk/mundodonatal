/**
 * Fruitfy Pix contract, verified against the live API on 12/11/2026:
 * - POST /api/pix/charge  (Bearer token + Store-Id header)
 *   body: { name, email, phone, cpf, items: [{ id: productUuid, value: cents (> 500), quantity }], utm? }
 *   201 → { success, data: { order_id, status, amount, pix: { code, expires_at, qr_code_base64 } } }
 *   Repeating the same product id in items is rejected, so the order is sent as one item.
 * - GET /api/order/{uuid} → { success, data: { uuid, status, total_gross_amount, total_paid_amount, paid_at, canceled_at, refunded_at } }
 * Server-only: never import from browser code paths other than *.functions.ts handlers.
 */
export const FRUITFY_BASE = "https://api.fruitfy.io";
export const FRUITFY_MIN_CENTS = 501;

export interface FruitfyCredentials { token: string; storeId: string; productId: string }

export type UtmParams = Partial<Record<"utm_source" | "utm_medium" | "utm_campaign" | "utm_content" | "utm_term", string>>;

export interface ChargeInput {
  name: string; email: string; phone: string; cpf: string; amountCents: number; utm?: UtmParams;
}

export type ChargeResult =
  | { ok: true; orderId: string; amount: number; code: string; image: string | null; expiresAt: string | null }
  | { ok: false; error: string };

export type OrderStatus = { status: "paid"; amount: number } | { status: "pending" | "canceled" | "unavailable" };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isUuid = (v: unknown): v is string => typeof v === "string" && UUID.test(v);

export function readCredentials(env: Record<string, string | undefined>): FruitfyCredentials | null {
  const token = env["FRUITFY_API_TOKEN"]?.trim();
  const storeId = env["FRUITFY_STORE_ID"]?.trim();
  const productId = env["FRUITFY_PRODUCT_ID"]?.trim();
  if (!token || !storeId || !isUuid(productId)) return null;
  return { token, storeId, productId };
}

function headers(c: FruitfyCredentials): HeadersInit {
  return { Authorization: `Bearer ${c.token}`, "Store-Id": c.storeId, Accept: "application/json", "Content-Type": "application/json" };
}

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null;

/** Brazilian phone in the 55DDDNUMBER format used by Fruitfy's examples. */
export const toFruitfyPhone = (digits: string) => (digits.startsWith("55") && digits.length >= 12 ? digits : `55${digits}`);

export async function createCharge(c: FruitfyCredentials, input: ChargeInput, fetchImpl: typeof fetch = fetch): Promise<ChargeResult> {
  if (!Number.isSafeInteger(input.amountCents) || input.amountCents < FRUITFY_MIN_CENTS) {
    return { ok: false, error: "O valor mínimo para pagamento via Pix é R$ 5,01." };
  }
  const body: Record<string, unknown> = {
    name: input.name, email: input.email, phone: toFruitfyPhone(input.phone), cpf: input.cpf,
    items: [{ id: c.productId, value: input.amountCents, quantity: 1 }],
  };
  if (input.utm && Object.keys(input.utm).length) body["utm"] = input.utm;

  let res: Response;
  try {
    res = await fetchImpl(`${FRUITFY_BASE}/api/pix/charge`, { method: "POST", headers: headers(c), body: JSON.stringify(body), signal: AbortSignal.timeout(20000) });
  } catch {
    return { ok: false, error: "Não foi possível gerar o Pix agora. Tente novamente em instantes." };
  }
  const json: unknown = await res.json().catch(() => null);
  if (res.status === 401 || res.status === 403) {
    console.error("Fruitfy auth error", res.status);
    return { ok: false, error: "Pagamento Pix temporariamente indisponível. Tente novamente mais tarde." };
  }
  if (res.status === 422 && isObj(json) && isObj(json["errors"])) {
    const first = Object.values(json["errors"]).flat().find((m) => typeof m === "string");
    if (typeof first === "string" && /cpf/i.test(first)) return { ok: false, error: "Confira o CPF informado." };
    if (typeof first === "string" && /e-?mail/i.test(first)) return { ok: false, error: "Confira o e-mail informado." };
    if (typeof first === "string" && /telefone|phone/i.test(first)) return { ok: false, error: "Confira o telefone informado." };
    console.error("Fruitfy validation error", JSON.stringify(Object.keys(json["errors"])));
    return { ok: false, error: "Confira seus dados e tente novamente." };
  }
  const data = isObj(json) && json["success"] === true && isObj(json["data"]) ? json["data"] : null;
  const pix = data && isObj(data["pix"]) ? data["pix"] : null;
  if (!res.ok || !data || !pix || !isUuid(data["order_id"]) || typeof pix["code"] !== "string" || !pix["code"]) {
    console.error("Fruitfy charge error", res.status, isObj(json) ? String(json["message"] ?? "") : "");
    return { ok: false, error: "Não foi possível gerar o Pix agora. Tente novamente em instantes." };
  }
  const amount = typeof data["amount"] === "number" ? data["amount"] : input.amountCents;
  if (amount !== input.amountCents) console.error("Fruitfy amount mismatch", amount, input.amountCents);
  return {
    ok: true,
    orderId: data["order_id"],
    amount,
    code: pix["code"],
    image: typeof pix["qr_code_base64"] === "string" && pix["qr_code_base64"] ? pix["qr_code_base64"] : null,
    expiresAt: typeof pix["expires_at"] === "string" ? pix["expires_at"] : null,
  };
}

/**
 * Paid only when Fruitfy reports a settlement date and the paid amount covers the order,
 * with no cancellation or refund. Anything unexpected stays "pending" (fail closed).
 */
export function interpretOrder(orderId: string, json: unknown): OrderStatus {
  const d = isObj(json) && json["success"] === true && isObj(json["data"]) ? json["data"] : null;
  if (!d || d["uuid"] !== orderId) return { status: "unavailable" };
  if (d["canceled_at"] || d["refunded_at"]) return { status: "canceled" };
  const paid = d["total_paid_amount"], gross = d["total_gross_amount"];
  if (typeof d["paid_at"] === "string" && d["paid_at"] && typeof paid === "number" && typeof gross === "number" && gross > 0 && paid >= gross) {
    return { status: "paid", amount: paid };
  }
  return { status: "pending" };
}

export async function fetchOrderStatus(c: FruitfyCredentials, orderId: string, fetchImpl: typeof fetch = fetch): Promise<OrderStatus> {
  if (!isUuid(orderId)) return { status: "unavailable" };
  try {
    const res = await fetchImpl(`${FRUITFY_BASE}/api/order/${orderId}`, { headers: headers(c), signal: AbortSignal.timeout(15000) });
    if (!res.ok) { if (res.status === 401) console.error("Fruitfy auth error", 401); return { status: "unavailable" }; }
    return interpretOrder(orderId, await res.json().catch(() => null));
  } catch {
    return { status: "unavailable" };
  }
}
