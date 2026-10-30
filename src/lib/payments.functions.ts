import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getProduct, variantPrice } from "./catalog";
import { cleanCep, shippingOptions } from "./shipping";

const BASE = "https://api.invictuspayv2.com.br/api/v1";

const OrderSchema = z.object({
  items: z.array(z.object({ handle: z.string().max(200), variantId: z.number(), qty: z.number().int().min(1).max(50) })).min(1).max(50),
  customer: z.object({
    name: z.string().trim().min(3).max(120),
    email: z.string().trim().email().max(200),
    document: z.string().regex(/^\d{11}$|^\d{14}$/),
    phone: z.string().regex(/^\d{10,11}$/),
  }),
  cep: z.string().max(9),
  shipping: z.enum(["free", "express"]),
});

function apiKey(): string {
  const k = process.env["INVICTUSPAY_API_KEY"];
  if (!k) throw new Error("Pagamento indisponível no momento.");
  return k;
}

/** Procura o primeiro campo de texto com um dos nomes, em qualquer nível. */
function deepFind(obj: unknown, keys: string[]): string | null {
  if (!obj || typeof obj !== "object") return null;
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    if (keys.includes(k) && typeof v === "string" && v) return v;
  }
  for (const v of Object.values(obj as Record<string, unknown>)) {
    const r = deepFind(v, keys);
    if (r) return r;
  }
  return null;
}

export const createPixPayment = createServerFn({ method: "POST" })
  .inputValidator((d) => OrderSchema.parse(d))
  .handler(async ({ data }) => {
    // Preços recalculados no servidor a partir do catálogo (nunca confiar no navegador).
    const items = data.items.map((i) => {
      const p = getProduct(i.handle);
      const v = p?.variants.find((x) => x.id === i.variantId);
      if (!p || !v) throw new Error("Produto indisponível.");
      const unit = Math.round(variantPrice(v).price * 100);
      const title = v.t !== "Default Title" ? `${p.title} (${v.t})` : p.title;
      return { description: title.slice(0, 120), quantity: i.qty, amount: unit * i.qty };
    });
    const cep = cleanCep(data.cep);
    if (!cep) throw new Error("CEP inválido.");
    const ship = shippingOptions(cep).find((o) => o.id === data.shipping);
    if (ship && ship.price > 0) items.push({ description: `Frete - ${ship.label}`, quantity: 1, amount: Math.round(ship.price * 100) });
    const amount = items.reduce((s, i) => s + i.amount, 0);

    const res = await fetch(`${BASE}/transactions`, {
      method: "POST",
      headers: { accept: "application/json", "content-type": "application/json", "X-Api-Key": apiKey() },
      body: JSON.stringify({ amount, paymentMethod: "pix", customer: data.customer, items, pix: { expirationInSeconds: 1800 } }),
    });
    const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    if (!res.ok) {
      console.error("InvictusPay create error", res.status, JSON.stringify(json));
      return { ok: false as const, error: (json["message"] as string) || "Não foi possível gerar o Pix. Confira seus dados." };
    }
    const tx = (json["data"] as Record<string, unknown>) ?? json;
    return {
      ok: true as const,
      id: String(tx["id"] ?? deepFind(json, ["id"]) ?? ""),
      amount,
      code: deepFind(json, ["qr_code", "qrcode", "qrCode", "copy_paste", "copyPaste", "emv", "payload", "brcode", "pix_code"]),
      image: deepFind(json, ["qr_code_base64", "qrCodeBase64", "qr_code_image", "qrCodeImage", "image", "qr_code_url"]),
    };
  });

export const getPaymentStatus = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ id: z.string().regex(/^[A-Za-z0-9_-]{6,64}$/) }).parse(d))
  .handler(async ({ data }) => {
    const res = await fetch(`${BASE}/transactions/${data.id}`, { headers: { accept: "application/json", "X-Api-Key": apiKey() } });
    const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    return { status: deepFind(json, ["status"]) ?? "pending" };
  });
