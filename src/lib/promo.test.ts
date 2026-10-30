import { describe, expect, it } from "vitest";
import { applyPromo, discountPercent } from "./promo";

describe("Black Friday 75%", () => {
  it("cobra 25% do preço original e risca o preço original", () => {
    expect(applyPromo(399.9, null, { active: true, percent: 75 })).toEqual({ price: 99.98, compareAt: 399.9 });
  });

  it("mostra -75% no selo", () => {
    expect(discountPercent(applyPromo(549.9, null, { active: true, percent: 75 }))).toBe(75);
  });

  it("volta ao preço normal quando a campanha está desligada", () => {
    expect(applyPromo(399.9, null, { active: false, percent: 75 })).toEqual({ price: 399.9, compareAt: null });
  });
});
