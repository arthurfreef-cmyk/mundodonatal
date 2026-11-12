import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getProduct, variantPrice } from "./catalog";
import { cleanCep, shippingOptions } from "./shipping";
import { createCharge, fetchOrderStatus, readCredentials, type ChargeResult, type OrderStatus } from "./fruitfy";

const utmValue = z.string().trim().max(200).optional();
const OrderSchema = z.object({
  items: z.array(z.object({ handle: z.string().max(200), variantId: z.number(), qty: z.number().int().min(1).max(50) })).min(1).max(50),
  customer: z.object({
    name: z.string().trim().min(3).max(120),
    email: z.string().trim().email().max(200),
    document: z.string().regex(/^\d{11}$/),
    phone: z.string().regex(/^\d{10,11}$/),
  }),
  cep: z.string().max(9),
  shipping: z.enum(["free", "sedex"]),
  utm: z.object({ utm_source: utmValue, utm_medium: utmValue, utm_campaign: utmValue, utm_content: utmValue, utm_term: utmValue }).optional(),
});
export type OrderInput = z.infer<typeof OrderSchema>;

/** Order total in cents, recalculated from the catalog and shipping rules (never trusted from the browser). */
export function orderTotalCents(data: OrderInput): number | null {
  let cents = 0;
  for (const i of data.items) {
    const v = getProduct(i.handle)?.variants.find((x) => x.id === i.variantId);
    if (!v) return null;
    cents += Math.round(variantPrice(v).price * 100) * i.qty;
  }
  const cep = cleanCep(data.cep);
  if (!cep) return null;
  const ship = shippingOptions(cep, data.customer.document).find((o) => o.id === data.shipping);
  if (!ship) return null;
  return cents + Math.round(ship.price * 100);
}

export type PixResult = { ok: false; error: string } | { ok: true; id: string; amount: number; code: string; image: string | null };

export const createPixPayment = createServerFn({ method: "POST" })
  .inputValidator((data) => OrderSchema.parse(data))
  .handler(async ({ data }): Promise<PixResult> => {
    const creds = readCredentials(process.env);
    if (!creds) {
      console.error("Fruitfy credentials missing");
      return { ok: false, error: "Pagamento Pix temporariamente indisponível. Tente novamente mais tarde." };
    }
    const amountCents = orderTotalCents(data);
    if (amountCents === null) return { ok: false, error: "Algum produto ou o CEP não está disponível. Revise seu pedido." };
    const utm = Object.fromEntries(Object.entries(data.utm ?? {}).filter(([, v]) => v));
    const r: ChargeResult = await createCharge(creds, {
      name: data.customer.name, email: data.customer.email, phone: data.customer.phone, cpf: data.customer.document, amountCents, utm,
    });
    if (!r.ok) return r;
    return { ok: true, id: r.orderId, amount: r.amount, code: r.code, image: r.image };
  });

export const getPaymentStatus = createServerFn({ method: "GET" })
  .inputValidator((data) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data }): Promise<OrderStatus> => {
    const creds = readCredentials(process.env);
    if (!creds) return { status: "unavailable" };
    return fetchOrderStatus(creds, data.id);
  });
