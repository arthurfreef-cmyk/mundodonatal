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

// Categorias de maior procura aparecem primeiro; as demais mantêm sua ordem original.
const featuredCategoryOrder = [
  "arvores-de-natal",
  "enfeites",
  "guirlandas-natalinas",
  "imagens-natalinas",
  "luzes",
  "mini-arvores",
  "festao-natalino",
  "saias-de-arvores",
  "topo-de-arvores",
];

const cats = [
  { img: "category-trees.webp", k: "Conheça", t: "Nossas árvores", to: "/collections/arvores-de-natal" },
  { img: "category-figures.webp", k: "Descubra", t: "Decorações de Natal", to: "/collections/imagens-natalinas" },
  { img: "category-lights.webp", k: "Explore", t: "Luzes", to: "/collections/luzes" },
];

function Index() {
  const christmasTarget = nextChristmasTarget();
  const orderedCollections = [...collections].sort((a, b) => {
    const aIndex = featuredCategoryOrder.indexOf(a.handle);
    const bIndex = featuredCategoryOrder.indexOf(b.handle);
    return (aIndex === -1 ? Number.MAX_SAFE_INTEGER : aIndex) - (bIndex === -1 ? Number.MAX_SAFE_INTEGER : bIndex);
  });

  return (
    <main>
      <section className="relative h-[420px] overflow-hidden md:h-[440px]">
        <video autoPlay muted loop playsInline poster={ASSET("hero-video-poster-mobile.webp")} aria-label="Árvore de Natal decorada do Mundo do Natal" className="absolute inset-0 h-full w-full object-cover object-[center_60%]" src="https://mundodonatal.com/cdn/shop/videos/c/vp/7dae404430564ab8b9ec66556a69b1c0/7dae404430564ab8b9ec66556a69b1c0.HD-720p-2.1Mbps-94990453.mp4?v=0" />
        <div className="hero-overlay absolute inset-0" />
        <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-center px-6 text-primary-foreground md:px-8">
          <p className="text-xs font-medium">Coleção Natal 2026</p>
          <h1 className="mt-2 max-w-md text-3xl leading-tight md:text-5xl">Mundo do Natal</h1>
          {BLACK_FRIDAY.active && (
            <Link to="/black-friday" className="mt-3 flex w-fit items-center gap-2 rounded-md bg-amber-300 px-3 py-1.5 text-xs font-bold text-emerald-950 shadow-sm transition-colors hover:bg-amber-200">
              Black Friday · {BLACK_FRIDAY.percent}% OFF em todo o site <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <span className="text-xs font-medium md:text-sm">Faltam para o Natal:</span>
            <Countdown target={christmasTarget} compact tone="dark" />
          </div>
          <div className="mt-4 flex flex-col items-start gap-2.5">
            <Button asChild size="lg" className="w-fit border-0 bg-amber-300 text-emerald-950 shadow-lg hover:bg-amber-200">
              <Link to="/collections/$handle" params={{ handle: "arvores-de-natal" }}>Ver árvores de Natal <ArrowRight /></Link>
            </Button>
            <div className="flex max-w-full flex-wrap gap-2">
              <Link to="/collections/$handle" params={{ handle: "enfeites" }} className="inline-flex min-h-9 items-center gap-1.5 rounded-md border border-white/70 bg-white/95 px-3 py-2 text-xs font-semibold text-emerald-950 shadow-sm transition-colors hover:bg-amber-100">
                Ver enfeites natalinos <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link to="/collections/$handle" params={{ handle: "guirlandas-natalinas" }} className="inline-flex min-h-9 items-center gap-1.5 rounded-md border border-white/70 bg-white/95 px-3 py-2 text-xs font-semibold text-emerald-950 shadow-sm transition-colors hover:bg-amber-100">
                Ver guirlandas <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link to="/collections/$handle" params={{ handle: "luzes" }} className="inline-flex min-h-9 items-center gap-1.5 rounded-md border border-white/70 bg-white/95 px-3 py-2 text-xs font-semibold text-emerald-950 shadow-sm transition-colors hover:bg-amber-100">
                Ver luzes de Natal <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-5 md:px-8 md:py-6" aria-label="Categorias mais procuradas">
        <div className="mb-4">
          <p className="eyebrow mb-1 text-muted-foreground">Encontre o que procura</p>
          <h2 className="text-xl md:text-2xl">Categorias mais procuradas</h2>
        </div>
        <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 scrollbar-none md:mx-0 md:gap-6 md:px-0">
          {orderedCollections.map((c) => {
            const cover = c.products.map((h) => getProduct(h)).find((p) => p?.images[0])?.images[0];
            return (
              <Link key={c.handle} to="/collections/$handle" params={{ handle: c.handle }} className="group flex w-[88px] flex-none snap-start flex-col items-center text-center md:w-[104px]">
                {cover && (
                  <div className="aspect-square w-[76px] overflow-hidden rounded-full border bg-muted ring-1 ring-border/50 transition-all duration-300 group-hover:ring-2 group-hover:ring-primary md:w-[88px]">
                    <img
                      src={img(cover.src, 320)}
                      srcSet={[160, 240, 320, 480].map((width) => `${img(cover.src, width)} ${width}w`).join(", ")}
                      sizes="(min-width: 768px) 88px, 76px"
                      alt={cover.alt || c.title}
                      loading="lazy"
                      decoding="async"
                      width={320}
                      height={320}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                )}
                <h3 className="mt-2 line-clamp-2 font-sans text-xs font-medium leading-tight md:text-sm">{c.title}</h3>
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
            <Link key={c.t} to={c.to} className="group overflow-hidden rounded-md bg-card text-center">
              <img src={ASSET(c.img)} alt={c.t} className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" decoding="async" />
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
