import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { ProductGrid } from "@/components/store/ProductCard";
import { searchProducts } from "@/lib/catalog";

export const Route = createFileRoute("/search")({
  validateSearch: z.object({ q: z.string().optional().default("") }),
  head: () => ({ meta: [{ title: "Busca | Mundo do Natal" }, { name: "description", content: "Busque decorações de Natal." }, { property: "og:title", content: "Busca | Mundo do Natal" }, { property: "og:description", content: "Busque decorações de Natal." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: () => {
    const { q } = Route.useSearch();
    const items = searchProducts(q);
    return (
      <main className="mx-auto max-w-7xl px-4 py-10 md:px-8">
        <h1 className="mb-6 text-4xl">Resultados para “{q}”</h1>
        {items.length ? <ProductGrid items={items} cols={4} layout="grid" /> : <p className="text-sm text-muted-foreground">Nenhum produto encontrado.</p>}
      </main>
    );
  },
});
