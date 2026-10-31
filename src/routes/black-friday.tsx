import { createFileRoute } from "@tanstack/react-router";
import { Countdown } from "@/components/store/Countdown";
import { ProductGrid } from "@/components/store/ProductCard";
import { products } from "@/lib/catalog";
import { BLACK_FRIDAY } from "@/lib/promo";

export const Route = createFileRoute("/black-friday")({
  head: () => ({ meta: [{ title: `Black Friday ${BLACK_FRIDAY.percent}% OFF | Mundo do Natal` }, { name: "description", content: `Todo o site com ${BLACK_FRIDAY.percent}% OFF na Black Friday do Mundo do Natal.` }, { property: "og:title", content: `Black Friday ${BLACK_FRIDAY.percent}% OFF | Mundo do Natal` }, { property: "og:description", content: `Árvores, guirlandas e enfeites com ${BLACK_FRIDAY.percent}% OFF.` }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: () => (
    <main>
      <section className="promo-shine px-4 py-16 text-center text-promo-foreground">
        <p className="eyebrow">Mundo do Natal</p>
        <h1 className="mt-3 text-6xl md:text-8xl">Black Friday</h1>
        <p className="mt-3 text-2xl font-bold">{BLACK_FRIDAY.percent}% OFF em todo o site</p>
        <div className="mt-8 flex justify-center"><Countdown target={BLACK_FRIDAY.endsAt} tone="promo" /></div>
      </section>
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-8"><ProductGrid items={products} /></div>
    </main>
  ),
});
