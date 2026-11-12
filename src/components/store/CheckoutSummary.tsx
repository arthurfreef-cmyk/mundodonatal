import { Lock, ShieldCheck } from "lucide-react";
import { img } from "@/lib/catalog";
import { useCart } from "@/lib/cart";
import { formatBRL } from "@/lib/promo";

export interface CheckoutSummaryProps {
  savings: number;
  shipping: number;
  total: number;
  hasShipping: boolean;
}

export function CheckoutSummary({ savings, shipping, total, hasShipping }: CheckoutSummaryProps) {
  const { lines, subtotal } = useCart();
  return (
    <aside className="order-first h-fit min-w-0 space-y-4 rounded-lg border bg-card p-4 md:order-last md:sticky md:top-28 md:space-y-5 md:rounded-none md:border-0 md:border-l md:bg-transparent md:py-0 md:pl-8 md:pr-0">
      <div className="flex items-center justify-between gap-3"><h2 className="text-2xl">Seu pedido</h2><span className="text-xs text-muted-foreground">{lines.reduce((sum, line) => sum + line.qty, 0)} itens</span></div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-1 md:gap-5">
        {lines.map((line) => (
          <div key={line.variantId} className="flex items-start gap-3 text-sm">
            <div className="relative shrink-0">
              <img src={img(line.variant.img ?? line.product.images[0]?.src, 160)} alt={line.product.title} className="h-16 w-14 rounded-md border bg-muted object-cover md:h-20 md:w-16" />
              <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[10px] text-primary-foreground">{line.qty}</span>
            </div>
            <div className="min-w-0 flex-1"><p className="text-xs font-medium leading-relaxed">{line.product.title}</p>{line.variant.t !== "Default Title" && <p className="mt-1 text-xs text-muted-foreground">{line.variant.t}</p>}<p className="mt-2 font-semibold">{formatBRL(line.unit * line.qty)}</p></div>
          </div>
        ))}
      </div>
      <div className="space-y-3 border-t pt-4 text-sm">
        <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatBRL(subtotal)}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Frete</span><span>{hasShipping ? (shipping ? formatBRL(shipping) : "Grátis") : "Informe o CEP"}</span></div>
        {savings > 0 && <div className="flex justify-between text-secondary"><span>Você economiza</span><span className="font-semibold">{formatBRL(savings)}</span></div>}
        <div className="flex items-center justify-between border-t pt-4"><span className="font-semibold">Total</span><span className="text-2xl font-bold text-primary">{formatBRL(total)}</span></div>
      </div>
      <div className="space-y-2 border-t pt-4 text-xs text-muted-foreground">
        <p className="flex items-center gap-2"><Lock className="h-4 w-4 shrink-0" /> Pagamento via Pix</p>
        <p className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 shrink-0" /> Processado pela InvictusPay</p>
      </div>
    </aside>
  );
}