import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductSection } from "@/components/store/ProductCard";
import { Countdown } from "@/components/store/Countdown";
import { ASSET, collectionProducts, collections, getProduct, img } from "@/lib/catalog";
import { BLACK_FRIDAY } from "@/lib/promo";

/** Próximo dia de Natal (25/12) como ISO, para o contador do hero. */
function nextChristmasTarget(): string {
  const now = new Date();
  const y = now.getFullYear();
  const christmas = new Date(y, 11, 25, 23, 59, 59);
  return (now.getTime() > christmas.getTime() ? new Date(y + 1, 11, 25, 23, 59, 59) : christmas).toISOString();
}

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
  const christmasTarget = nextChristmasTarget();
  return (
    <main>
      <section className="relative h-[340px] overflow-hidden md:h-[380px]">
        <video autoPlay muted loop playsInline poster={ASSET("hero-video-poster-mobile.webp")} aria-label="Árvore de Natal decorada do Mundo do Natal" className="absolute inset-0 h-full w-full object-cover object-[center_60%]" src="https://mundodonatal.com/cdn/shop/videos/c/vp/7dae404430564ab8b9ec66556a69b1c0/7dae404430564ab8b9ec66556a69b1c0.HD-720p-2.1Mbps-94990453.mp4?v=0" />
        <div className="hero-overlay absolute inset-0" />
        <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-center px-6 text-primary-foreground md:px-8">
          <p className="text-xs font-medium">Coleção Natal 2026</p>
          <h1 className="mt-2 max-w-md text-3xl leading-tight md:text-5xl">Mundo do Natal</h1>
          {BLACK_FRIDAY.active && (
            <Link to="/black-friday" className="mt-3 flex w-fit items-center gap-2 bg-promo px-3 py-1.5 text-xs font-bold text-promo-foreground">
              Black Friday · {BLACK_FRIDAY.percent}% OFF em todo o site <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <span className="text-xs font-medium md:text-sm">Faltam para o Natal:</span>
            <Countdown target={christmasTarget} compact tone="dark" />
          </div>
          <Button asChild size="lg" variant="secondary" className="mt-4 w-fit"><Link to="/collections/$handle" params={{ handle: "arvores-de-natal" }}>Ver árvores de Natal <ArrowRight /></Link></Button>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-10" aria-label="Categorias">
        <h2 className="mb-5 text-2xl md:text-3xl">Compre por categoria</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
          {collections.map((c) => {
            const cover = c.products.map((h) => getProduct(h)).find((p) => p?.images[0])?.images[0];
            return (
              <Link key={c.handle} to="/collections/$handle" params={{ handle: c.handle }} className="group overflow-hidden rounded-md border bg-card text-center">
                {cover && <img src={img(cover.src, 240)} alt={cover.alt || c.title} loading="lazy" decoding="async" width={240} height={240} className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-105" />}
                <h3 className="px-2 py-2.5 font-sans text-xs font-medium leading-tight md:text-sm">{c.title}</h3>
              </Link>
            );
          })}
        </div>
      </section>
      <ProductSection title="Árvores de Natal mais Desejadas" to="/collections/arvores-de-natal" items={collectionProducts("arvores-de-natal").slice(0, 12)} prioritizeFirstRow />
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
