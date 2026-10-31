import { ArrowRight, Minus, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { img } from "@/lib/catalog";
import { useCart } from "@/lib/cart";
import { formatBRL, installment } from "@/lib/promo";

export function CartDrawer() {
  const { open, setOpen, lines, subtotal, setQty, remove } = useCart();
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-ink/50" onClick={() => setOpen(false)}>
      <aside role="dialog" aria-label="Carrinho" className="ml-auto flex h-full w-full max-w-md flex-col bg-background" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b p-5">
          <h2 className="text-2xl">Seu carrinho</h2>
          <Button variant="ghost" size="icon" aria-label="Fechar carrinho" onClick={() => setOpen(false)}><X className="h-5 w-5" /></Button>
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
                  <Button variant="outline" size="icon" aria-label="Diminuir" onClick={() => setQty(l.variantId, l.qty - 1)} className="h-8 w-8"><Minus className="h-3 w-3" /></Button>
                  <span>{l.qty}</span>
                  <Button variant="outline" size="icon" aria-label="Aumentar" onClick={() => setQty(l.variantId, l.qty + 1)} className="h-8 w-8"><Plus className="h-3 w-3" /></Button>
                  <Button variant="ghost" size="icon" aria-label="Remover" onClick={() => remove(l.variantId)} className="ml-auto h-8 w-8 text-muted-foreground"><Trash2 className="h-4 w-4" /></Button>
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
            <Button asChild variant="commerce" size="lg" className="mt-4 w-full"><Link to="/checkout" onClick={() => setOpen(false)}>COMPRAR AGORA <ArrowRight /></Link></Button>
            <p className="mt-2 text-center text-[11px] text-muted-foreground">Frete grátis disponível para todo o Brasil</p>
          </div>
        )}
      </aside>
    </div>
  );
}
