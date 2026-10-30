import { describe, expect, it } from "vitest";
import { expressPrice, shippingOptions } from "./shipping";

describe("frete", () => {
  it("expresso fica sempre entre R$ 7 e R$ 12", () => {
    for (let i = 0; i < 2000; i++) {
      const cep = String(1000000 + i * 4999).padStart(8, "0");
      const p = expressPrice(cep);
      expect(p).toBeGreaterThanOrEqual(7);
      expect(p).toBeLessThanOrEqual(12);
    }
  });
  it("frete grátis sempre é oferecido com valor zero", () => {
    expect(shippingOptions("01310-100").find((o) => o.id === "free")?.price).toBe(0);
  });
  it("mesmo CEP gera o mesmo valor", () => {
    expect(expressPrice("01310-100")).toBe(expressPrice("01310100"));
  });
});
