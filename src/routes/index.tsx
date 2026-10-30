import { createFileRoute, Link } from "@tanstack/react-router";
import { Countdown } from "@/components/store/Countdown";
import { ProductSection } from "@/components/store/ProductCard";
import { ASSET, collectionProducts } from "@/lib/catalog";
import { BLACK_FRIDAY } from "@/lib/promo";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Mundo do Natal | Árvores e Decoração de Natal" }, { name: "description", content: "Árvores realistas e decorações de Natal. Black Friday com 60% OFF em todo o site." }, { property: "og:title", content: "Mundo do Natal" }, { property: "og:description", content: "Black Friday 60% OFF em árvores e decoração de Natal." }] }),
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
      <section className="relative h-[520px] overflow-hidden">
        <video autoPlay muted loop playsInline poster={ASSET("hero-video-poster-mobile.webp")} className="absolute inset-0 h-full w-full object-cover" src="https://mundodonatal.com/cdn/shop/videos/c/vp/7dae404430564ab8b9ec66556a69b1c0/7dae404430564ab8b9ec66556a69b1c0.HD-720p-2.1Mbps-94990453.mp4?v=0" />
        <div className="hero-overlay absolute inset-0" />
        <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-center px-6 text-primary-foreground md:px-8">
          <p className="eyebrow">Coleção Natal 2026</p>
          <h1 className="mt-4 max-w-md text-6xl leading-none md:text-7xl">Antecipe o encanto do Natal</h1>
          <p className="mt-6 max-w-sm text-sm">Árvores realistas e decorações escolhidas para transformar a sua casa em um cenário inesquecível.</p>
          <div className="mt-6 flex gap-4">
            <Link to="/collections/$handle" params={{ handle: "arvores-de-natal" }} className="bg-accent px-5 py-3 text-xs font-semibold text-accent-foreground">Descobrir nossas árvores</Link>
            <Link to="/collections/$handle" params={{ handle: "all" }} className="border-t px-5 py-3 text-xs font-semibold">Ver toda a coleção</Link>
          </div>
        </div>
      </section>
      {BLACK_FRIDAY.active && (
        <Link to="/black-friday" className="promo-shine block px-4 py-8 text-center text-promo-foreground">
          <p className="font-heading text-4xl">Black Friday — {BLACK_FRIDAY.percent}% OFF em todo o site</p>
          <p className="eyebrow mt-2">Ver ofertas →</p>
        </Link>
      )}
      <section className="bg-secondary px-4 py-8 text-secondary-foreground">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 md:flex-row">
          <h2 className="text-2xl">O Natal está cada dia mais perto</h2>
          <Countdown target="2026-12-25T00:00:00-03:00" />
        </div>
      </section>
      <section className="bg-cream px-4 py-16">
        <h2 className="text-center text-4xl">Prepare a casa antes da correria de dezembro</h2>
        <div className="mx-auto mt-10 grid max-w-6xl gap-6 md:grid-cols-3">
          {cats.map((c) => (
            <Link key={c.t} to={c.to} className="bg-card text-center">
              <img src={ASSET(c.img)} alt={c.t} className="aspect-[4/3] w-full object-cover" loading="lazy" />
              <p className="eyebrow mt-4 text-accent">{c.k}</p>
              <h3 className="pb-6 text-2xl">{c.t}</h3>
            </Link>
          ))}
        </div>
      </section>
      <ProductSection title="Árvores de Natal mais Desejadas" to="/collections/arvores-de-natal" items={collectionProducts("arvores-de-natal").slice(0, 12)} />
      <ProductSection title="Enfeites Natalinos" to="/collections/enfeites" items={collectionProducts("enfeites").slice(0, 6)} />
      <ProductSection title="Saias de Árvores" to="/collections/saias-de-arvores" items={collectionProducts("saias-de-arvores").slice(0, 6)} />
      <ProductSection title="Guirlandas em destaque" to="/collections/guirlandas-natalinas" items={collectionProducts("guirlandas-natalinas").slice(0, 6)} />
      <ProductSection title="Figuras Natalinas" to="/collections/imagens-natalinas" items={collectionProducts("imagens-natalinas").slice(0, 6)} />
    </main>
  );
}
