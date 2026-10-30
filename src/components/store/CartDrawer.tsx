import { Minus, Plus, Trash2, X } from "lucide-react";
import { img } from "@/lib/catalog";
import { useCart } from "@/lib/cart";
import { formatBRL, installment } from "@/lib/promo";

export function CartDrawer() {
  const { open, setOpen, lines, subtotal, setQty, remove, checkoutUrl } = useCart();
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-ink/50" onClick={() => setOpen(false)}>
      <aside role="dialog" aria-label="Carrinho" className="ml-auto flex h-full w-full max-w-md flex-col bg-background" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b p-5">
          <h2 className="text-2xl">Seu carrinho</h2>
          <button aria-label="Fechar carrinho" onClick={() => setOpen(false)}><X className="h-5 w-5" /></button>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {lines.length === 0 && <p className="text-sm text-muted-foreground">Seu carrinho está vazio.</p>}
          {lines.map((l) => (
            <div key={l.variantId} className="flex gap-3">
              <img src={img(l.variant.img ?? l.product.images[0]?.src, 200)} alt="" className="h-20 w-20 object-cover" />
              <div className="flex-1 text-xs">
                <p className="font-medium">{l.product.title}</p>
                {l.variant.t !== "Default Title" && <p className="text-muted-foreground">{l.variant.t}</p>}
                <div className="mt-2 flex items-center gap-2">
                  <button aria-label="Diminuir" onClick={() => setQty(l.variantId, l.qty - 1)} className="border p-1"><Minus className="h-3 w-3" /></button>
                  <span>{l.qty}</span>
                  <button aria-label="Aumentar" onClick={() => setQty(l.variantId, l.qty + 1)} className="border p-1"><Plus className="h-3 w-3" /></button>
                  <button aria-label="Remover" onClick={() => remove(l.variantId)} className="ml-auto text-muted-foreground"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
              <p className="text-xs font-bold text-primary">{formatBRL(l.unit * l.qty)}</p>
            </div>
          ))}
        </div>
        {lines.length > 0 && (
          <div className="border-t p-5">
            <div className="flex justify-between text-sm"><span>Subtotal</span><b>{formatBRL(subtotal)}</b></div>
            <p className="mt-1 text-[11px] text-muted-foreground">ou 3x de {formatBRL(installment(subtotal))} sem juros</p>
            <a href={checkoutUrl} target="_blank" rel="noreferrer" className="mt-4 block bg-primary py-3 text-center text-sm font-semibold text-primary-foreground">
              Finalizar pedido pelo WhatsApp
            </a>
          </div>
        )}
      </aside>
    </div>
  );
}
