import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductSection } from "@/components/store/ProductCard";
import { ASSET, collectionProducts } from "@/lib/catalog";
import { BLACK_FRIDAY } from "@/lib/promo";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Mundo do Natal | Árvores e Decoração de Natal" }, { name: "description", content: `Árvores realistas e decorações de Natal. Black Friday com ${BLACK_FRIDAY.percent}% OFF em todo o site.` }, { property: "og:title", content: "Mundo do Natal" }, { property: "og:description", content: `Black Friday ${BLACK_FRIDAY.percent}% OFF em árvores e decoração de Natal.` }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }, { property: "og:image", content: ASSET("hero-video-poster-mobile.webp") }, { name: "twitter:image", content: ASSET("hero-video-poster-mobile.webp") }] }),
  component: Index,
});

const cats = [
  { img: "category-trees.webp", k: "Conheça", t: "Nossas árvores", to: "/collections/arvores-de-natal" },
  { img: "category-figures.webp", k: "Descubra", t: "Decorações de Natal", to: "/collections/imagens-natalinas" },
  { img: "category-lights.webp", k: "Explore", t: "Luzes", to: "/collections/luzes" },
];

function Index() {
  return (
    <main>
      <section className="relative h-[280px] overflow-hidden md:h-[310px]">
        <img src={ASSET("hero-video-poster-mobile.webp")} alt="Árvore de Natal decorada do Mundo do Natal" fetchPriority="high" className="absolute inset-0 h-full w-full object-cover object-[center_60%]" />
        <div className="hero-overlay absolute inset-0" />
        <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-center px-6 text-primary-foreground md:px-8">
          <p className="text-xs font-medium">Coleção Natal 2026</p>
          <h1 className="mt-3 max-w-md text-4xl leading-tight md:text-5xl">Mundo do Natal</h1>
          <p className="mt-3 max-w-sm text-sm">Árvores realistas e decorações escolhidas para transformar a sua casa em um cenário inesquecível.</p>
          <Button asChild size="lg" variant="secondary" className="mt-5 w-fit"><Link to="/collections/$handle" params={{ handle: "arvores-de-natal" }}>Ver árvores de Natal <ArrowRight /></Link></Button>
        </div>
      </section>
      <ProductSection title="Árvores de Natal mais Desejadas" to="/collections/arvores-de-natal" items={collectionProducts("arvores-de-natal").slice(0, 12)} />
      <section className="border-y bg-muted px-4 py-8 md:py-10">
        <h2 className="text-center text-3xl">Decore cada detalhe</h2>
        <div className="mx-auto mt-6 grid max-w-6xl grid-cols-3 gap-3 md:gap-6">
          {cats.map((c) => (
            <Link key={c.t} to={c.to} className="bg-card text-center">
              <img src={ASSET(c.img)} alt={c.t} className="aspect-[4/3] w-full object-cover" loading="lazy" />
              <h3 className="px-2 py-3 font-sans text-xs font-medium md:text-base">{c.t}</h3>
            </Link>
          ))}
        </div>
      </section>
      <ProductSection title="Enfeites Natalinos" to="/collections/enfeites" items={collectionProducts("enfeites").slice(0, 6)} />
      <ProductSection title="Saias de Árvores" to="/collections/saias-de-arvores" items={collectionProducts("saias-de-arvores").slice(0, 6)} />
      <ProductSection title="Guirlandas em destaque" to="/collections/guirlandas-natalinas" items={collectionProducts("guirlandas-natalinas").slice(0, 6)} />
      <ProductSection title="Figuras Natalinas" to="/collections/imagens-natalinas" items={collectionProducts("imagens-natalinas").slice(0, 6)} />
    </main>
  );
}
