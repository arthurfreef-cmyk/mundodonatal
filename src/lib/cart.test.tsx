import { act, cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CartProvider, useCart } from "./cart";
import { products } from "./catalog";

vi.mock("./meta-pixel", () => ({ trackMetaEvent: vi.fn() }));
afterEach(() => { cleanup(); localStorage.clear(); vi.restoreAllMocks(); });

function CartProbe() {
  const { count } = useCart();
  return <output aria-label="Quantidade">{count}</output>;
}

describe("Cart persistence", () => {
  it("ignores malformed saved cart entries without crashing", () => {
    localStorage.setItem("mdn-cart-v1", JSON.stringify([null, { qty: -1 }, "bad"]));
    const view = render(<CartProvider><CartProbe /></CartProvider>);
    expect(view.getByLabelText("Quantidade")).toHaveTextContent("0");
  });
  it("continues working when browser storage is blocked", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("Storage blocked"); });
    expect(() => render(<CartProvider><CartProbe /></CartProvider>)).not.toThrow();
  });
  it("preserves a saved cart on reload", async () => {
    const product = products.find((p) => p.variants.some((v) => v.a));
    const variant = product?.variants.find((v) => v.a);
    if (!product || !variant) throw new Error("Available product required");
    const saved = [{ handle: product.handle, variantId: variant.id, qty: 2 }];
    localStorage.setItem("mdn-cart-v1", JSON.stringify(saved));
    render(<CartProvider><CartProbe /></CartProvider>);
    await waitFor(() => expect(JSON.parse(localStorage.getItem("mdn-cart-v1") ?? "[]")).toEqual(saved));
  });
});