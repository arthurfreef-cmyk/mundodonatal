import { ArrowRight, CheckCircle2, Minus, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { StoreDrawer } from "./StoreDrawer";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { img } from "@/lib/catalog";
import { useCart } from "@/lib/cart";
import { formatBRL } from "@/lib/promo";

export function CartDrawer() {
  const { open, setOpen, lines, subtotal, setQty, remove } = useCart();
  return (
    <StoreDrawer open={open} onOpenChange={setOpen} title={`Seu carrinho (${count})`}>
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
          {lines.length === 0 && <div className="flex flex-1 flex-col items-center justify-center px-6 text-center"><p className="text-lg font-semibold">Seu carrinho está vazio</p><p className="mt-2 text-sm text-muted-foreground">Explore nossos produtos e encontre a decoração ideal para o seu Natal.</p><Button type="button" variant="commerce" className="mt-5" onClick={() => setOpen(false)}>Continuar comprando</Button></div>}
          {lines.map((l) => (
            <div key={l.variantId} className="flex gap-3">
              <img src={img(l.variant.img ?? l.product.images[0]?.src, 200)} srcSet={[120, 200, 300].map((width) => img(l.variant.img ?? l.product.images[0]?.src, width) + " " + width + "w").join(", ")} sizes="80px" alt={l.product.title} loading="lazy" decoding="async" width={80} height={80} className="h-20 w-20 rounded-md border bg-muted object-cover" />
              <div className="min-w-0 flex-1 text-xs">
                <p className="font-medium">{l.product.title}</p>
                {l.variant.t !== "Default Title" && <p className="text-muted-foreground">{l.variant.t}</p>}
                <div className="mt-2 flex items-center gap-2">
                  <Button variant="outline" size="icon" aria-label="Diminuir" onClick={() => setQty(l.variantId, l.qty - 1)} className="h-8 w-8"><Minus className="h-3 w-3" /></Button>
                  <span>{l.qty}</span>
                  <Button variant="outline" size="icon" aria-label="Aumentar" disabled={l.qty >= 99} onClick={() => setQty(l.variantId, Math.min(99, l.qty + 1))} className="h-8 w-8"><Plus className="h-3 w-3" /></Button>
                  <Button variant="ghost" size="icon" aria-label="Remover" onClick={() => remove(l.variantId)} className="ml-auto h-8 w-8 text-muted-foreground"><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
              <p className="shrink-0 text-xs font-bold text-primary">{formatBRL(l.unit * l.qty)}</p>
            </div>
          ))}
        </div>
        {lines.length > 0 && (
          <div className="border-t bg-background p-5">
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><b className="text-base">{formatBRL(subtotal)}</b></div>
            <p className="mt-1 text-[11px] text-muted-foreground">Frete e prazo calculados na próxima etapa.</p>
            <Button asChild variant="commerce" size="lg" className="mt-4 h-12 w-full text-sm font-bold"><Link to="/checkout" onClick={() => setOpen(false)}>FINALIZAR COMPRA <ArrowRight /></Link></Button>
            <Button type="button" variant="ghost" className="mt-2 w-full" onClick={() => setOpen(false)}>Continuar comprando</Button>
            <div className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-2 border-t pt-3 text-[10px] text-muted-foreground">
              <span className="inline-flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-emerald-600" /> Frete grátis disponível</span>
              <span className="inline-flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> Checkout seguro</span>
            </div>
          </div>
        )}
    </StoreDrawer>
  );
}
