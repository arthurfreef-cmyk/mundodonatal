import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const OrderSchema = z.object({
  items: z.array(z.object({ handle: z.string().max(200), variantId: z.number(), qty: z.number().int().min(1).max(50) })).min(1).max(50),
  customer: z.object({
    name: z.string().trim().min(3).max(120),
    email: z.string().trim().email().max(200),
    document: z.string().regex(/^\d{11}$|^\d{14}$/),
    phone: z.string().regex(/^\d{10,11}$/),
  }),
  cep: z.string().max(9),
  shipping: z.enum(["free", "sedex"]),
});

type PixResult =
  | { ok: false; error: string }
  | { ok: true; id: string; amount: number; code: string | null; image: string | null };

// Fail closed until Fruitfy's creation, lookup and webhook contracts are verified.
// No legacy provider fallback and no synthetic Pix or paid status are allowed.
export const createPixPayment = createServerFn({ method: "POST" })
  .inputValidator((data) => OrderSchema.parse(data))
  .handler(async (): Promise<PixResult> => ({
    ok: false,
    error: "Pagamento Pix temporariamente indisponível. Tente novamente mais tarde.",
  }));

export const getPaymentStatus = createServerFn({ method: "GET" })
  .inputValidator((data) => z.object({ id: z.string().regex(/^[A-Za-z0-9_-]{6,64}$/) }).parse(data))
  .handler(async () => ({ status: "unavailable" as const }));