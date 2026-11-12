import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@tanstack/react-start", () => ({
  createServerFn: () => ({
    inputValidator: () => ({ handler: (handler: () => Promise<unknown>) => handler }),
  }),
}));

import { createPixPayment, getPaymentStatus } from "./payments.functions";

afterEach(() => vi.unstubAllGlobals());

describe("payment provider removal", () => {
  it("does not create a charge or call an external provider while Fruitfy is incomplete", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    const result = await createPixPayment({ data: {
      items: [{ handle: "test", variantId: 1, qty: 1 }],
      customer: { name: "Test User", email: "test@example.com", document: "12345678900", phone: "11999999999" },
      cep: "01310100", shipping: "free",
    } });
    expect(result.ok).toBe(false);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("never confirms payment without provider verification", async () => {
    const result = await getPaymentStatus({ data: { id: "order-123" } });
    expect(result.status).toBe("unavailable");
  });
});