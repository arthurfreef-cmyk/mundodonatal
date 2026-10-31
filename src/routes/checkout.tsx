import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { BadgeCheck, Check, Clock, Loader2, Lock, QrCode, RotateCcw, ShieldCheck, Smartphone, Truck } from "lucide-react";
import { img, variantPrice } from "@/lib/catalog";
import { useCart } from "@/lib/cart";
import { formatBRL } from "@/lib/promo";
import { cleanCep, lookupCep, maskCep, shippingOptions, type ShippingOption } from "@/lib/shipping";
import { cn } from "@/lib/utils";
import { isValidCpf, maskCpf, maskPhone } from "@/lib/br";
import { useServerFn } from "@tanstack/react-start";
import { createPixPayment, getPaymentStatus } from "@/lib/payments.functions";
import { syncMetaPermission, trackMetaEvent } from "@/lib/meta-pixel";
import { resolveAdvertisingRegion } from "@/lib/advertising-consent";
import { cartEventParameters, type MetaCartItem } from "@/lib/meta-commerce";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Finalizar compra | Mundo do Natal" },
      { name: "description", content: "Checkout seguro do Mundo do Natal com frete grátis e entrega expressa." },
      { property: "og:title", content: "Finalizar compra | Mundo do Natal" },
      { property: "og:description", content: "Checkout seguro com frete grátis." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Checkout,
});

const input = "w-full border border-border bg-background px-3 py-3 text-sm outline-none focus:border-primary";

function Checkout() {
  const { lines, subtotal, setOpen, clear } = useCart();
  const [f, setF] = useState({ email: "", name: "", phone: "", cpf: "", cep: "", street: "", number: "", comp: "", district: "", city: "", state: "" });
  const [cepState, setCepState] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [ship, setShip] = useState<ShippingOption["id"]>("free");
  const [done, setDone] = useState(false);
  const checkoutStarted = useRef(false);
  const paymentConfirmed = useRef(false);
  const paidItems = useRef<MetaCartItem[]>([]);
  useEffect(() => {
    if (!lines.length || checkoutStarted.current) return;
    checkoutStarted.current = true;
    void resolveAdvertisingRegion().then((region) => {
      syncMetaPermission(region);
      trackMetaEvent("InitiateCheckout", cartEventParameters(lines));
    });
  }, [lines]);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF((s) => ({ ...s, [k]: e.target.value }));

  useEffect(() => setOpen(false), [setOpen]);

  // Busca o endereço automaticamente quando o CEP fica completo.
  useEffect(() => {
    const d = cleanCep(f.cep);
    if (!d) { setCepState("idle"); return; }
    let alive = true;
    setCepState("loading");
    lookupCep(d)
      .then((a) => {
        if (!alive) return;
        if (!a) return setCepState("error");
        setF((s) => ({ ...s, street: a.street || s.street, district: a.district || s.district, city: a.city, state: a.state }));
        setCepState("ok");
      })
      .catch(() => alive && setCepState("error"));
    return () => { alive = false; };
  }, [f.cep]);

  const options = useMemo(() => (cepState === "ok" ? shippingOptions(f.cep) : []), [cepState, f.cep]);
  const shipping = options.find((o) => o.id === ship)?.price ?? 0;
  const total = subtotal + shipping;
  const ready = f.email.includes("@") && f.name.trim().length > 2 && f.phone.replace(/\D/g, "").length >= 10 && isValidCpf(f.cpf) && cepState === "ok" && f.street && f.number;

  const createPix = useServerFn(createPixPayment);
  const checkStatus = useServerFn(getPaymentStatus);
  const [pix, setPix] = useState<{ id: string; amount: number; code: string | null; image: string | null } | null>(null);
  const [paying, setPaying] = useState(false);
  const [err, setErr] = useState("");
  const [copied, setCopied] = useState(false);
  const [left, setLeft] = useState(1800);
  useEffect(() => {
    if (!pix) return;
    setLeft(1800);
    const t = setInterval(() => setLeft((x) => Math.max(0, x - 1)), 1000);
    return () => clearInterval(t);
  }, [pix]);
  const savings = lines.reduce((s, l) => s + l.qty * Math.max(0, (variantPrice(l.variant).compareAt ?? l.unit) - l.unit), 0);

  // Confere a cada 5s se o Pix foi pago.
  useEffect(() => {
    if (!pix?.id || done) return;
    const t = setInterval(async () => {
      try {
        const { status } = await checkStatus({ data: { id: pix.id } });
        if (status === "paid" && !paymentConfirmed.current) {
          paymentConfirmed.current = true;
          trackMetaEvent("Purchase", cartEventParameters(paidItems.current, pix.amount / 100), `pix-${pix.id}`);
          setDone(true); clear();
        }
      } catch { /* tenta de novo */ }
    }, 5000);
    return () => clearInterval(t);
  }, [pix, done, checkStatus, clear]);

  async function pay() {
    setErr(""); setPaying(true);
    try {
      const r = await createPix({ data: {
        items: lines.map((l) => ({ handle: l.handle, variantId: l.variantId, qty: l.qty })),
        customer: { name: f.name.trim(), email: f.email.trim(), document: f.cpf.replace(/\D/g, ""), phone: f.phone.replace(/\D/g, "") },
        cep: f.cep, shipping: ship,
      } });
      if (!r.ok) setErr(r.error); else {
        paidItems.current = lines.map(({ variantId, qty, unit }) => ({ variantId, qty, unit }));
        trackMetaEvent("AddPaymentInfo", { ...cartEventParameters(paidItems.current, r.amount / 100), payment_method: "Pix" }, `pix-${r.id}`);
        setPix(r);
      }
    } catch { setErr("Não foi possível gerar o Pix. Tente novamente."); }
    setPaying(false);
  }

  if (done) {
    return (
      <main className="mx-auto max-w-lg px-4 py-20 text-center">
        <Check className="mx-auto h-12 w-12 text-primary" />
        <h1 className="mt-4 text-3xl">Pagamento confirmado!</h1>
        <p className="mt-2 text-sm text-muted-foreground">Obrigado pela compra. Você receberá as informações do pedido no seu e-mail.</p>
        <Link to="/" className="mt-6 inline-block bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground">Voltar à loja</Link>
      </main>
    );
  }

  if (pix) {
    const qr = pix.image ? (pix.image.startsWith("http") || pix.image.startsWith("data:") ? pix.image : `data:image/png;base64,${pix.image}`)
      : pix.code ? `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(pix.code)}` : null;
    return (
      <main className="mx-auto max-w-md px-4 py-12 text-center">
        <h1 className="text-3xl">Pague com Pix</h1>
        <p className="mt-2 text-sm text-muted-foreground">Total: <b className="text-primary">{formatBRL(pix.amount / 100)}</b></p>
        <p className="mt-3 inline-flex items-center gap-2 bg-secondary px-3 py-1.5 text-sm font-semibold"><Clock className="h-4 w-4 text-primary" /> Expira em {String(Math.floor(left / 60)).padStart(2, "0")}:{String(left % 60).padStart(2, "0")}</p>
        {qr && <img src={qr} alt="QR Code Pix" className="mx-auto mt-6 h-64 w-64 border bg-background p-2" />}
        {pix.code && (
          <>
            <p className="mt-6 break-all border bg-secondary p-3 text-left text-xs">{pix.code}</p>
            <button type="button" onClick={() => { if (!pix.code) return; navigator.clipboard.writeText(pix.code); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
              className="mt-3 w-full bg-primary py-4 text-sm font-bold uppercase text-primary-foreground">
              {copied ? "Código copiado!" : "Copiar código Pix"}
            </button>
          </>
        )}
        <p className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Aguardando pagamento… a confirmação é automática</p>
        <ol className="mt-6 space-y-2 border p-4 text-left text-sm">
          <li className="flex gap-2"><Smartphone className="h-4 w-4 shrink-0 text-primary" /> Abra o app do seu banco e escolha Pix.</li>
          <li className="flex gap-2"><QrCode className="h-4 w-4 shrink-0 text-primary" /> Escaneie o QR Code ou cole o código copiado.</li>
          <li className="flex gap-2"><BadgeCheck className="h-4 w-4 shrink-0 text-primary" /> Confirme. O pedido é aprovado na hora.</li>
        </ol>
        <p className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground"><ShieldCheck className="h-4 w-4" /> Pagamento processado com segurança pela InvictusPay</p>
      </main>
    );
  }

  if (lines.length === 0) {
    return (
      <main className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="text-3xl">Seu carrinho está vazio</h1>
        <Link to="/" className="mt-6 inline-block bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground">Continuar comprando</Link>
      </main>
    );
  }

  return (
    <main className="mx-auto grid max-w-6xl gap-8 px-4 py-8 md:grid-cols-[1fr_400px] md:px-8">
      <form className="space-y-8" onSubmit={(e) => { e.preventDefault(); if (ready && !paying) pay(); }}>
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-2 text-sm font-semibold"><Lock className="h-4 w-4 text-primary" /> Checkout seguro</div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {["Dados", "Entrega", "Pagamento"].map((st, i) => (
              <span key={st} className="flex items-center gap-1"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">{i + 1}</span>{st}</span>
            ))}
          </div>
        </div>

        <section className="space-y-3">
          <h2 className="text-xl">1. Seus dados</h2>
          <input className={input} type="email" placeholder="E-mail" value={f.email} onChange={set("email")} required />
          <input className={input} placeholder="Nome completo" value={f.name} onChange={set("name")} required />
          <input className={input} type="tel" placeholder="WhatsApp / Celular" value={f.phone} onChange={(e) => setF((s) => ({ ...s, phone: maskPhone(e.target.value) }))} required />
          <input className={input} inputMode="numeric" placeholder="CPF" value={f.cpf} onChange={(e) => setF((s) => ({ ...s, cpf: maskCpf(e.target.value) }))} required />
          {f.cpf.replace(/\D/g, "").length === 11 && !isValidCpf(f.cpf) && <p className="text-xs text-destructive">CPF inválido. Confira os números.</p>}
          <p className="text-xs text-muted-foreground">O CPF é exigido pelo Banco Central para emitir o Pix e a nota fiscal.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl">2. Entrega</h2>
          <div className="relative">
            <input className={input} inputMode="numeric" placeholder="CEP" value={f.cep} onChange={(e) => setF((s) => ({ ...s, cep: maskCep(e.target.value) }))} required />
            {cepState === "loading" && <Loader2 className="absolute right-3 top-3.5 h-4 w-4 animate-spin text-muted-foreground" />}
          </div>
          {cepState === "error" && <p className="text-xs text-destructive">CEP não encontrado. Confira os números.</p>}
          {cepState === "ok" && (
            <>
              <input className={input} placeholder="Rua" value={f.street} onChange={set("street")} required />
              <div className="grid grid-cols-2 gap-3">
                <input className={input} placeholder="Número" value={f.number} onChange={set("number")} required />
                <input className={input} placeholder="Complemento" value={f.comp} onChange={set("comp")} />
              </div>
              <input className={input} placeholder="Bairro" value={f.district} onChange={set("district")} />
              <p className="text-xs text-muted-foreground">{f.city} – {f.state}</p>
            </>
          )}
        </section>

        {options.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-xl">3. Frete</h2>
            {options.map((o) => (
              <label key={o.id} className={cn("flex cursor-pointer items-center gap-3 border p-4 text-sm", ship === o.id ? "border-primary bg-secondary" : "border-border")}>
                <input type="radio" name="ship" checked={ship === o.id} onChange={() => setShip(o.id)} className="accent-primary" />
                <Truck className="h-4 w-4" />
                <span className="flex-1"><b>{o.label}</b><span className="block text-xs text-muted-foreground">{o.days}</span></span>
                <b className={o.price === 0 ? "text-primary" : ""}>{o.price === 0 ? "GRÁTIS" : formatBRL(o.price)}</b>
              </label>
            ))}
          </section>
        )}

        <button type="submit" disabled={!ready || paying} className="w-full bg-primary py-4 text-sm font-bold uppercase tracking-wide text-primary-foreground disabled:opacity-50">
          {paying ? "Gerando Pix…" : <>Pagar com Pix · {formatBRL(total)}</>}
        </button>
        {err && <p className="text-center text-sm text-destructive">{err}</p>}
        <p className="flex items-center justify-center gap-2 text-xs text-muted-foreground"><ShieldCheck className="h-4 w-4" /> Ambiente criptografado · seus dados não são compartilhados</p>
      </form>

      <aside className="h-fit space-y-4 border bg-card p-5 md:sticky md:top-6">
        <h2 className="text-xl">Resumo do pedido</h2>
        {lines.map((l) => (
          <div key={l.variantId} className="flex gap-3 text-xs">
            <div className="relative">
              <img src={img(l.variant.img ?? l.product.images[0]?.src, 160)} alt={l.product.title} className="h-16 w-16 object-cover" />
              <span className="absolute -right-2 -top-2 rounded-full bg-primary px-1.5 text-[10px] text-primary-foreground">{l.qty}</span>
            </div>
            <div className="flex-1">
              <p className="font-medium">{l.product.title}</p>
              {l.variant.t !== "Default Title" && <p className="text-muted-foreground">{l.variant.t}</p>}
            </div>
            <b>{formatBRL(l.unit * l.qty)}</b>
          </div>
        ))}
        <div className="space-y-1 border-t pt-4 text-sm">
          {savings > 0 && <div className="flex justify-between font-semibold text-primary"><span>Você economiza</span><span>-{formatBRL(savings)}</span></div>}
          <div className="flex justify-between"><span>Subtotal</span><span>{formatBRL(subtotal)}</span></div>
          <div className="flex justify-between"><span>Frete</span><span>{options.length ? (shipping ? formatBRL(shipping) : "Grátis") : "Informe o CEP"}</span></div>
          <div className="flex justify-between border-t pt-2 text-lg font-bold"><span>Total</span><span className="text-primary">{formatBRL(total)}</span></div>
        </div>
        <ul className="space-y-3 border-t pt-4 text-xs">
          <li className="flex gap-3"><ShieldCheck className="h-5 w-5 shrink-0 text-primary" /><span><b>Compra garantida</b><br />Receba seu pedido ou seu dinheiro de volta.</span></li>
          <li className="flex gap-3"><RotateCcw className="h-5 w-5 shrink-0 text-primary" /><span><b>7 dias para trocar</b><br />Devolução simples, conforme o Código do Consumidor.</span></li>
          <li className="flex gap-3"><Truck className="h-5 w-5 shrink-0 text-primary" /><span><b>Envio com rastreio</b><br />Código enviado para o seu e-mail.</span></li>
          <li className="flex gap-3"><Lock className="h-5 w-5 shrink-0 text-primary" /><span><b>Pagamento seguro</b><br />Pix processado pela InvictusPay.</span></li>
        </ul>
      </aside>
    </main>
  );
}
