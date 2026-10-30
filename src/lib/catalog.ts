import raw from "@/data/catalog.json";
import { applyPromo, type PricePair } from "./promo";

export interface Variant {
  id: number;
  t: string;
  p: number;
  c: number | null;
  o: string[];
  a: boolean;
  img: string | null;
}
export interface Product {
  handle: string;
  title: string;
  vendor: string;
  type: string;
  tags: string[];
  images: { src: string; alt: string }[];
  options: { name: string; values: string[] }[];
  variants: Variant[];
  collections: string[];
  createdAt: string;
}
export interface Collection {
  handle: string;
  title: string;
  description: string;
  products: string[];
}

const data = raw as unknown as { products: Product[]; collections: Collection[] };

export const products: Product[] = data.products;
export const collections: Collection[] = data.collections;
const byHandle = new Map(products.map((p) => [p.handle, p]));

export const getProduct = (handle: string): Product | undefined => byHandle.get(handle);
export const getCollection = (handle: string): Collection | undefined =>
  collections.find((c) => c.handle === handle);

export function collectionProducts(handle: string): Product[] {
  if (handle === "all") return products;
  const c = getCollection(handle);
  if (!c) return [];
  return c.products.map((h) => byHandle.get(h)).filter((p): p is Product => Boolean(p));
}

export const minVariant = (p: Product): Variant =>
  p.variants.reduce<Variant>((m, v) => (v.p < m.p ? v : m), p.variants[0] as Variant);

export const variantPrice = (v: Variant): PricePair => applyPromo(v.p, v.c);
export const productPrice = (p: Product): PricePair => variantPrice(minVariant(p));
export const isAvailable = (p: Product): boolean => p.variants.some((v) => v.a);

/** Busca simples sem acentos. */
const norm = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
export function searchProducts(q: string): Product[] {
  const terms = norm(q).split(/\s+/).filter(Boolean);
  if (!terms.length) return [];
  return products.filter((p) => {
    const hay = norm(`${p.title} ${p.type} ${p.tags.join(" ")}`);
    return terms.every((t) => hay.includes(t));
  });
}

/** Redimensiona imagens do CDN da loja. */
export function img(src: string | undefined | null, width = 900): string {
  if (!src) return "";
  const sep = src.includes("?") ? "&" : "?";
  return `${src}${sep}width=${width}`;
}

/** Menu principal, igual ao da loja original. */
export const NAV: { label: string; to: string }[] = [
  { label: "Início", to: "/" },
  { label: "Figuras Natalinas", to: "/collections/imagens-natalinas" },
  { label: "Árvores de Natal", to: "/collections/arvores-de-natal" },
  { label: "Enfeites", to: "/collections/enfeites" },
  { label: "Saias de Árvores", to: "/collections/saias-de-arvores" },
  { label: "Topo de Árvores", to: "/collections/topo-de-arvores" },
  { label: "Mini Árvores", to: "/collections/mini-arvores" },
  { label: "Festão Natalino", to: "/collections/festao-natalino" },
  { label: "Luzes", to: "/collections/luzes" },
  { label: "Guirlandas", to: "/collections/guirlandas-natalinas" },
];

export const WHATSAPP = "5511955044063";
export const ASSET = (name: string) => `https://mundodonatal.com/cdn/shop/t/9/assets/${name}`;
