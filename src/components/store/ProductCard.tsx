import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { img, isAvailable, productPrice, type Product } from "@/lib/catalog";
import { discountPercent, formatBRL } from "@/lib/promo";

export function ProductCard({ product, eager = false, cols = 6 }: { product: Product; eager?: boolean; cols?: 4 | 6 }) {
  const [showAlternate, setShowAlternate] = useState(false);
  const pp = productPrice(product);
  const off = discountPercent(pp);
  const [a, b] = product.images;
  const sizes = cols === 6 ? "(min-width: 1280px) 230px, (min-width: 768px) 220px, 72vw" : "(min-width: 1280px) 288px, (min-width: 1024px) 24vw, 72vw";
  const sources = (src: string) => [400, 640, 800, 1200].map((width) => `${img(src, width)} ${width}w`).join(", ");

  return (
    <article onMouseEnter={() => setShowAlternate(true)} onFocus={() => setShowAlternate(true)} className="group flex h-full w-[min(76vw,250px)] shrink-0 snap-start flex-col overflow-hidden rounded-md border bg-card sm:w-[230px] lg:w-[240px]">
      <Link to="/products/$handle" params={{ handle: product.handle }} className="relative block aspect-[4/5] overflow-hidden bg-muted">
        {a && (
          <img
            src={img(a.src, 800)}
            srcSet={sources(a.src)}
            sizes={sizes}
            alt={a.alt || product.title}
            loading={eager ? "eager" : "lazy"}
            decoding="async"
            width={800}
            height={1000}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.025]"
          />
        )}
        {b && showAlternate && (
          <img
            src={img(b.src, 800)}
            srcSet={sources(b.src)}
            sizes={sizes}
            alt={b.alt || product.title}
            loading="eager"
            decoding="async"
            width={800}
            height={1000}
            className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-within:opacity-100"
          />
        )}
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
        <Button asChild variant="outline" className="mt-4 w-full justify-between px-3 text-xs"><Link to="/products/$handle" params={{ handle: product.handle }}>Ver detalhes <ArrowRight /></Link></Button>
      </div>
    </article>
  );
}

export function ProductGrid({ items, cols = 6, prioritizeFirstRow = false, trackRef }: { items: Product[]; cols?: 4 | 6; prioritizeFirstRow?: boolean; trackRef?: React.RefObject<HTMLDivElement | null> }) {
  return (
    <div ref={trackRef} className="scrollbar-none flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain pb-2 scroll-smooth md:gap-4">
      {items.map((p, index) => <ProductCard key={p.handle} product={p} cols={cols} eager={prioritizeFirstRow && index < 3} />)}
    </div>
  );
}

export function ProductSection({ title, to, items, prioritizeFirstRow = false }: { title: string; to: string; items: Product[]; prioritizeFirstRow?: boolean }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const scroll = (direction: -1 | 1) => {
    trackRef.current?.scrollBy({ left: direction * Math.max(trackRef.current.clientWidth * 0.82, 260), behavior: "smooth" });
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-10">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <h2 className="text-2xl md:text-3xl">{title}</h2>
        <div className="flex items-center gap-3">
          <Button asChild variant="link" className="h-9 px-0 text-xs"><Link to={to}>Ver todos <ArrowRight /></Link></Button>
          <div className="hidden items-center gap-2 sm:flex">
            <Button type="button" variant="outline" size="icon" aria-label={`Voltar em ${title}`} onClick={() => scroll(-1)} className="h-9 w-9 rounded-full"><ArrowLeft className="h-4 w-4" /></Button>
            <Button type="button" variant="outline" size="icon" aria-label={`Avançar em ${title}`} onClick={() => scroll(1)} className="h-9 w-9 rounded-full"><ArrowRight className="h-4 w-4" /></Button>
          </div>
        </div>
      </div>
      <ProductGrid items={items} prioritizeFirstRow={prioritizeFirstRow} trackRef={trackRef} />
      <p className="mt-2 text-[11px] text-muted-foreground sm:hidden">Deslize para o lado para ver mais produtos</p>
    </section>
  );
}
