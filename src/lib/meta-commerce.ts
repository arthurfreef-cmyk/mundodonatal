import type { Product, Variant } from "./catalog";
import { variantPrice } from "./catalog";

export interface MetaCartItem {
  variantId: number;
  qty: number;
  unit: number;
}

export function cartEventParameters(lines: MetaCartItem[], value?: number) {
  return {
    content_type: "product",
    content_ids: lines.map((line) => String(line.variantId)),
    contents: lines.map((line) => ({ id: String(line.variantId), quantity: line.qty, item_price: line.unit })),
    num_items: lines.reduce((sum, line) => sum + line.qty, 0),
    value: value ?? Math.round(lines.reduce((sum, line) => sum + line.unit * line.qty, 0) * 100) / 100,
    currency: "BRL",
  };
}

export function productEventParameters(product: Product, variant: Variant, qty = 1) {
  return { ...cartEventParameters([{ variantId: variant.id, qty, unit: variantPrice(variant).price }]), content_name: product.title };
}