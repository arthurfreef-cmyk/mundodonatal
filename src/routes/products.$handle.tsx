import { createFileRoute, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { getProduct, img, variantPrice } from "@/lib/catalog";
import { useCart } from "@/lib/cart";
import { BLACK_FRIDAY, discountPercent, formatBRL, installment } from "@/lib/promo";

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
  const { add } = useCart();
  const [vi, setVi] = useState(0);
  const [im, setIm] = useState(0);
  const v = product.variants[vi] ?? product.variants[0];
  if (!v) return null;
  const pp = variantPrice(v);
  return (
    <main className="mx-auto grid max-w-6xl gap-10 px-4 py-10 md:grid-cols-2">
      <div>
        <img src={img(product.images[im]?.src, 1000)} alt={product.title} className="aspect-square w-full bg-muted object-cover" />
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {product.images.map((i, n) => (
            <button key={i.src} onClick={() => setIm(n)} aria-label={`Foto ${n + 1}`}>
              <img src={img(i.src, 150)} alt="" className="h-16 w-16 object-cover" />
            </button>
          ))}
        </div>
      </div>
      <div>
        <h1 className="text-3xl md:text-4xl">{product.title}</h1>
        <div className="mt-4 flex items-baseline gap-3">
          <span className="text-2xl font-bold text-primary">{formatBRL(pp.price)}</span>
          {pp.compareAt && <s className="text-muted-foreground">{formatBRL(pp.compareAt)}</s>}
          {discountPercent(pp) > 0 && <span className="bg-promo px-2 py-1 text-xs font-bold text-promo-foreground">-{discountPercent(pp)}%</span>}
        </div>
        <p className="mt-1 text-xs text-muted-foreground">ou 3x de {formatBRL(installment(pp.price))} sem juros</p>
        {product.variants.length > 1 && (
          <select value={vi} onChange={(e) => setVi(Number(e.target.value))} className="mt-6 w-full border bg-background p-3 text-sm" aria-label="Opção">
            {product.variants.map((x, n) => <option key={x.id} value={n}>{x.t}</option>)}
          </select>
        )}
        <button disabled={!v.a} onClick={() => add(product.handle, v.id)} className="mt-6 w-full bg-primary py-4 text-sm font-semibold text-primary-foreground disabled:opacity-50">
          {v.a ? "Adicionar ao carrinho" : "Esgotado"}
        </button>
      </div>
    </main>
  );
}
