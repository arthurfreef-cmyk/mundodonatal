import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@tanstack/react-start", () => ({
  createServerFn: () => ({
    inputValidator: () => ({ handler: (handler: unknown) => handler }),
  }),
}));

import { orderTotalCents } from "./payments.functions";
import { createCharge, interpretOrder, FRUITFY_BASE } from "./fruitfy";
import { products, variantPrice } from "./catalog";
import { sedexPrice } from "./shipping";

const creds = { token: "tok", storeId: "store-1", productId: "a335fce2-9eb3-48c4-9743-9a4220296ce6" };
const order = "a336073e-53dd-4f72-81d4-23c16386e137";
const json = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

afterEach(() => vi.restoreAllMocks());

describe("order total in cents", () => {
  const [p1, p2] = products;
  const v1 = p1!.variants[0]!, v2 = p2!.variants[0]!;
  const base = { customer: { name: "Ana Souza", email: "a@b.com", document: "52998224725", phone: "11999999999" }, cep: "01310-100" };

  it("sums two products at the 75% promo price with free shipping", () => {
    const total = orderTotalCents({ ...base, shipping: "free", items: [{ handle: p1!.handle, variantId: v1.id, qty: 1 }, { handle: p2!.handle, variantId: v2.id, qty: 2 }] });
    expect(total).toBe(Math.round(variantPrice(v1).price * 100) + 2 * Math.round(variantPrice(v2).price * 100));
  });

  it("adds the customer's Sedex price", () => {
    const total = orderTotalCents({ ...base, shipping: "sedex", items: [{ handle: p1!.handle, variantId: v1.id, qty: 1 }] });
    expect(total).toBe(Math.round(variantPrice(v1).price * 100) + Math.round(sedexPrice("01310100", "52998224725") * 100));
  });

  it("rejects unknown products", () => {
    expect(orderTotalCents({ ...base, shipping: "free", items: [{ handle: "nope", variantId: 1, qty: 1 }] })).toBeNull();
  });
});

describe("Fruitfy charge", () => {
  const input = { name: "Ana Souza", email: "a@b.com", phone: "11999999999", cpf: "52998224725", amountCents: 12345, utm: { utm_source: "meta" } };

  it("sends one item with the store product id, cents value and auth headers", async () => {
    const f = vi.fn().mockResolvedValue(json(201, { success: true, data: { order_id: order, status: "waiting_payment", amount: 12345, pix: { code: "000201", qr_code_base64: "iVBOR", expires_at: "x" } } }));
    const r = await createCharge(creds, input, f);
    expect(r).toMatchObject({ ok: true, orderId: order, amount: 12345, code: "000201" });
    const [url, init] = f.mock.calls[0]!;
    expect(url).toBe(`${FRUITFY_BASE}/api/pix/charge`);
    expect(init.headers).toMatchObject({ Authorization: "Bearer tok", "Store-Id": "store-1" });
    const body = JSON.parse(init.body);
    expect(body.items).toEqual([{ id: creds.productId, value: 12345, quantity: 1 }]);
    expect(body.phone).toBe("5511999999999");
    expect(body.utm).toEqual({ utm_source: "meta" });
  });

  it("refuses amounts at or below R$ 5,00 without calling Fruitfy", async () => {
    const f = vi.fn();
    expect((await createCharge(creds, { ...input, amountCents: 500 }, f)).ok).toBe(false);
    expect(f).not.toHaveBeenCalled();
  });

  it("does not return a Pix when credentials are rejected", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const r = await createCharge(creds, input, vi.fn().mockResolvedValue(json(401, { message: "Unauthenticated." })));
    expect(r.ok).toBe(false);
  });
});

describe("payment confirmation", () => {
  const data = { uuid: order, status: "waiting_payment", total_gross_amount: 1300, total_paid_amount: 0, paid_at: null, canceled_at: null, refunded_at: null };

  it("keeps a waiting Pix pending", () => {
    expect(interpretOrder(order, { success: true, data })).toEqual({ status: "pending" });
  });

  it("confirms only with paid date and full paid amount", () => {
    expect(interpretOrder(order, { success: true, data: { ...data, status: "paid", paid_at: "2026-11-12", total_paid_amount: 1300 } })).toEqual({ status: "paid", amount: 1300 });
    expect(interpretOrder(order, { success: true, data: { ...data, status: "paid", paid_at: null, total_paid_amount: 1300 } })).toEqual({ status: "pending" });
    expect(interpretOrder(order, { success: true, data: { ...data, paid_at: "2026-11-12", total_paid_amount: 900 } })).toEqual({ status: "pending" });
  });

  it("ignores responses for a different order", () => {
    expect(interpretOrder(order, { success: true, data: { ...data, uuid: "other" } })).toEqual({ status: "unavailable" });
  });
});
