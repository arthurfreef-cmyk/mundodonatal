import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { img, isAvailable, productPrice, type Product } from "@/lib/catalog";
import { discountPercent, formatBRL, installment } from "@/lib/promo";

export function ProductCard({ product }: { product: Product }) {
  const pp = productPrice(product);
  const off = discountPercent(pp);
  const [a, b] = product.images;
  return (
    <article className="group flex flex-col overflow-hidden rounded-md border bg-card">
      <Link to="/products/$handle" params={{ handle: product.handle }} className="relative block aspect-[4/5] overflow-hidden bg-muted">
        {a && <img src={img(a.src, 600)} alt={a.alt} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-opacity duration-500" />}
        {b && <img src={img(b.src, 600)} alt={b.alt} loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100" />}
        {off > 0 && <span className="absolute left-2 top-2 bg-promo px-2 py-1 text-[10px] font-bold text-promo-foreground">-{off}%</span>}
        {!isAvailable(product) && <span className="absolute right-2 top-2 bg-background px-2 py-1 text-[10px]">Esgotado</span>}
      </Link>
      <div className="flex flex-1 flex-col p-3">
        <h3 className="line-clamp-3 min-h-[3.9em] font-sans text-sm leading-snug">
          <Link to="/products/$handle" params={{ handle: product.handle }}>{product.title}</Link>
        </h3>
        <div className="mt-3 flex flex-wrap items-baseline gap-2">
          <span className="text-sm font-bold text-primary">{formatBRL(pp.price)}</span>
          {pp.compareAt && <s className="text-[11px] text-muted-foreground">{formatBRL(pp.compareAt)}</s>}
        </div>
        <p className="mt-1 text-[10px] text-muted-foreground">
          ou <b className="text-foreground">3x de {formatBRL(installment(pp.price))}</b> sem juros
        </p>
        <Button asChild variant="outline" className="mt-4 w-full justify-between px-3 text-xs"><Link to="/products/$handle" params={{ handle: product.handle }}>Ver detalhes <ArrowRight /></Link></Button>
      </div>
    </article>
  );
}

export function ProductGrid({ items, cols = 6 }: { items: Product[]; cols?: 4 | 6 }) {
  return (
    <div className={cols === 6 ? "grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6" : "grid grid-cols-2 gap-4 lg:grid-cols-4"}>
      {items.map((p) => <ProductCard key={p.handle} product={p} />)}
    </div>
  );
}

export function ProductSection({ title, to, items }: { title: string; to: string; items: Product[] }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-10">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl md:text-3xl">{title}</h2>
        <Button asChild variant="link" className="h-9 px-0 text-xs"><Link to={to}>Ver todos <ArrowRight /></Link></Button>
      </div>
      <ProductGrid items={items} />
    </section>
  );
}
