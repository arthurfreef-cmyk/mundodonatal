import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getProduct, variantPrice, type Product, type Variant } from "./catalog";
import { formatBRL } from "./promo";
import { WHATSAPP } from "./catalog";

export interface CartLine {
  handle: string;
  variantId: number;
  qty: number;
}
interface ResolvedLine extends CartLine {
  product: Product;
  variant: Variant;
  unit: number;
}
interface CartCtx {
  lines: ResolvedLine[];
  count: number;
  subtotal: number;
  open: boolean;
  setOpen: (o: boolean) => void;
  add: (handle: string, variantId: number, qty?: number) => void;
  setQty: (variantId: number, qty: number) => void;
  remove: (variantId: number) => void;
  clear: () => void;
  checkoutUrl: string;
}

const Ctx = createContext<CartCtx | null>(null);
const KEY = "mdn-cart-v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [raw, setRaw] = useState<CartLine[]>([]);
  const [open, setOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Carrega o carrinho salvo somente após hidratar (evita divergência SSR).
  useEffect(() => {
    try {
      const saved: unknown = JSON.parse(localStorage.getItem(KEY) ?? "[]");
      if (Array.isArray(saved)) setRaw(saved.filter((line): line is CartLine => {
        if (!line || typeof line !== "object") return false;
        const entry = line as Partial<CartLine>;
        return typeof entry.handle === "string" && typeof entry.variantId === "number" &&
          typeof entry.qty === "number" && Number.isSafeInteger(entry.qty) && entry.qty > 0 &&
          Boolean(getProduct(entry.handle)?.variants.some((v) => v.id === entry.variantId && v.a));
      }));
    } catch {
      /* carrinho corrompido: ignora */
    }
    setHydrated(true);
  }, []);
  useEffect(() => {
    if (!hydrated) return;
    try { localStorage.setItem(KEY, JSON.stringify(raw)); } catch { /* Storage can be unavailable; the current cart still works. */ }
  }, [raw, hydrated]);

  const add = useCallback((handle: string, variantId: number, qty = 1) => {
    const product = getProduct(handle);
    const variant = product?.variants.find((item) => item.id === variantId);
    if (!product || !variant?.a || !Number.isSafeInteger(qty) || qty <= 0) return;
    setRaw((r) => {
      const ex = r.find((l) => l.handle === handle && l.variantId === variantId);
      if (ex) return r.map((l) => (l.handle === handle && l.variantId === variantId ? { ...l, qty: Math.min(99, l.qty + qty) } : l));
      return [...r, { handle, variantId, qty: Math.min(99, qty) }];
    });
    setOpen(true);
  }, []);
  const setQty = useCallback((variantId: number, qty: number) => {
    if (!Number.isSafeInteger(qty)) return;
    setRaw((r) => (qty <= 0
      ? r.filter((l) => l.variantId !== variantId)
      : r.map((l) => (l.variantId === variantId ? { ...l, qty: Math.min(99, qty) } : l))));
  }, []);
  const clear = useCallback(() => setRaw([]), []);
  const remove = useCallback((variantId: number) => setRaw((r) => r.filter((l) => l.variantId !== variantId)), []);

  const lines = useMemo<ResolvedLine[]>(
    () =>
      raw.flatMap((l) => {
        const product = getProduct(l.handle);
        const variant = product?.variants.find((v) => v.id === l.variantId);
        if (!product || !variant) return [];
        return [{ ...l, product, variant, unit: variantPrice(variant).price }];
      }),
    [raw],
  );
  const count = lines.reduce((s, l) => s + l.qty, 0);
  const subtotal = lines.reduce((s, l) => s + l.qty * l.unit, 0);

  const checkoutUrl = useMemo(() => {
    const items = lines
      .map((l) => `• ${l.qty}x ${l.product.title}${l.variant.t !== "Default Title" ? ` (${l.variant.t})` : ""} — ${formatBRL(l.unit * l.qty)}`)
      .join("\n");
    const msg = `Olá! Quero finalizar meu pedido da Black Friday no Mundo do Natal:\n\n${items}\n\nTotal: ${formatBRL(subtotal)}`;
    return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;
  }, [lines, subtotal]);

  return (
    <Ctx.Provider value={{ lines, count, subtotal, open, setOpen, add, setQty, remove, clear, checkoutUrl }}>{children}</Ctx.Provider>
  );
}

export function useCart(): CartCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart deve ser usado dentro de CartProvider");
  return c;
}
