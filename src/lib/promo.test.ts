import { describe, expect, it } from "vitest";
import { applyPromo, discountPercent } from "./promo";

describe("Black Friday 60%", () => {
  it("cobra 40% do preço original e risca o preço original", () => {
    expect(applyPromo(399.9, null, { active: true, percent: 60 })).toEqual({ price: 159.96, compareAt: 399.9 });
  });

  it("mostra -60% no selo", () => {
    expect(discountPercent(applyPromo(549.9, null, { active: true, percent: 60 }))).toBe(60);
  });

  it("volta ao preço normal quando a campanha está desligada", () => {
    expect(applyPromo(399.9, null, { active: false, percent: 60 })).toEqual({ price: 399.9, compareAt: null });
  });
});
