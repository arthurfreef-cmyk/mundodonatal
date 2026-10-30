import { createFileRoute, notFound } from "@tanstack/react-router";
import { ProductGrid } from "@/components/store/ProductCard";
import { collectionProducts, getCollection } from "@/lib/catalog";

export const Route = createFileRoute("/collections/$handle")({
  loader: ({ params }) => {
    const c = params.handle === "all" ? { title: "Toda a coleção", description: "" } : getCollection(params.handle);
    if (!c) throw notFound();
    return { title: c.title, description: c.description, items: collectionProducts(params.handle) };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.title ?? "Coleção"} | Mundo do Natal` },
      { name: "description", content: loaderData?.description || "Decoração de Natal com 60% OFF." },
      { property: "og:title", content: loaderData?.title ?? "Mundo do Natal" },
      { property: "og:description", content: "Black Friday 60% OFF no Mundo do Natal." },
    ],
  }),
  component: () => {
    const d = Route.useLoaderData();
    return (
      <main className="mx-auto max-w-7xl px-4 py-10 md:px-8">
        <section className="mb-8 bg-secondary p-10 text-secondary-foreground">
          <p className="eyebrow text-accent">Nossa curadoria</p>
          <h1 className="mt-2 text-5xl">{d.title}</h1>
          <p className="mt-4 max-w-xl text-sm opacity-90">{d.description}</p>
        </section>
        <p className="mb-4 text-sm"><b>{d.items.length} produtos</b> selecionados para você</p>
        <ProductGrid items={d.items} cols={4} />
      </main>
    );
  },
});
