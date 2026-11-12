import { createFileRoute, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getProduct, img, variantPrice } from "@/lib/catalog";
import { useCart } from "@/lib/cart";
import { BLACK_FRIDAY, discountPercent, formatBRL } from "@/lib/promo";

export const Route = createFileRoute("/products/$handle")({
  loader: ({ params }) => {
    const product = getProduct(params.handle);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.product.title ?? "Produto"} | Mundo do Natal` },
      { name: "description", content: `${loaderData?.product.title ?? ""} com ${BLACK_FRIDAY.percent}% OFF na Black Friday do Mundo do Natal.` },
      { property: "og:title", content: loaderData?.product.title ?? "Mundo do Natal" },
      { property: "og:description", content: `${loaderData?.product.title ?? "Produto"} com ${BLACK_FRIDAY.percent}% OFF no Mundo do Natal.` },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      ...(loaderData?.product.images[0]?.src.startsWith("https://") ? [
        { property: "og:image", content: loaderData.product.images[0].src },
        { name: "twitter:image", content: loaderData.product.images[0].src },
      ] : []),
    ],
  }),
  component: ProductPage,
});

function ProductPage() {
  const { product } = Route.useLoaderData();
  return <ProductDetails key={product.handle} product={product} />;
}

function ProductDetails({ product }: { product: NonNullable<ReturnType<typeof getProduct>> }) {
  const { add } = useCart();
  const [vi, setVi] = useState(0);
  const [im, setIm] = useState(0);
  const v = product.variants[vi] ?? product.variants[0];
  if (!v) return null;
  const pp = variantPrice(v);
  return (
    <main className="mx-auto grid max-w-6xl gap-10 px-4 py-10 md:grid-cols-2">
      <div>
        <img src={img(product.images[im]?.src, 1000)} alt={product.title} fetchPriority="high" width={1000} height={1000} className="aspect-square w-full bg-muted object-cover" />
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {product.images.map((i, n) => (
            <Button variant="outline" key={i.src} onClick={() => setIm(n)} aria-label={`Foto ${n + 1}`} aria-pressed={im === n} className={cn("h-16 w-16 shrink-0 overflow-hidden p-0", im === n && "border-primary ring-1 ring-primary")}>
              <img src={img(i.src, 150)} alt="" loading="lazy" decoding="async" className="h-16 w-16 object-cover" />
            </Button>
          ))}
        </div>
      </div>
      <div>
        <h1 className="text-3xl md:text-4xl">{product.title}</h1>
        <div className="mt-4 flex flex-wrap items-baseline gap-3">
          <span className="text-2xl font-bold text-primary">{formatBRL(pp.price)}</span>
          {pp.compareAt && <s className="text-muted-foreground">{formatBRL(pp.compareAt)}</s>}
          {discountPercent(pp) > 0 && <span className="bg-promo px-2 py-1 text-xs font-bold text-promo-foreground">-{discountPercent(pp)}%</span>}
        </div>
        <p className="mt-3 inline-flex w-fit items-center rounded-sm bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">Frete grátis para todo o Brasil</p>
        {product.variants.length > 1 && (
          <select value={vi} onChange={(e) => setVi(Number(e.target.value))} className="mt-6 w-full border bg-background p-3 text-sm" aria-label="Opção">
            {product.variants.map((x, n) => <option key={x.id} value={n}>{x.t}</option>)}
          </select>
        )}
        <Button variant="commerce" size="lg" disabled={!v.a} onClick={() => add(product.handle, v.id)} className="mt-6 h-14 w-full">
          <ShoppingBag />
          {v.a ? "Adicionar ao carrinho" : "Esgotado"}
        </Button>
      </div>
    </main>
  );
}
