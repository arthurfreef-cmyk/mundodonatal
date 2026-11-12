import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { BadgeCheck, Check, Loader2, QrCode, ShieldCheck, Smartphone } from "lucide-react";
import { variantPrice } from "@/lib/catalog";
import { useCart } from "@/lib/cart";
import { formatBRL } from "@/lib/promo";
import { cleanCep, lookupCep, shippingOptions, type ShippingOption } from "@/lib/shipping";
import { isValidCpf } from "@/lib/br";
import { useServerFn } from "@tanstack/react-start";
import { createPixPayment, getPaymentStatus } from "@/lib/payments.functions";
import { syncMetaPermission, trackMetaEvent } from "@/lib/meta-pixel";
import { resolveAdvertisingRegion } from "@/lib/advertising-consent";
import { cartEventParameters, type MetaCartItem } from "@/lib/meta-commerce";
import { Button } from "@/components/ui/button";
import { CheckoutDetails } from "@/components/store/CheckoutDetails";
import { CheckoutSummary } from "@/components/store/CheckoutSummary";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Finalizar compra | Mundo Natalino" },
      { name: "description", content: "Checkout seguro do Mundo Natalino com frete grátis e entrega expressa." },
      { property: "og:title", content: "Finalizar compra | Mundo Natalino" },
      { property: "og:description", content: "Checkout seguro com frete grátis." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Checkout,
});



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
        setF((s) => ({ ...s, street: a.street, district: a.district, city: a.city, state: a.state, number: "", comp: "" }));
        setCepState("ok");
      })
      .catch(() => alive && setCepState("error"));
    return () => { alive = false; };
  }, [f.cep]);

  const options = useMemo(() => (cepState === "ok" ? shippingOptions(f.cep) : []), [cepState, f.cep]);
  const shipping = options.find((o) => o.id === ship)?.price ?? 0;
  const total = subtotal + shipping;
  const ready = /^\S+@\S+\.\S+$/.test(f.email.trim()) && f.name.trim().length > 2 && f.phone.replace(/\D/g, "").length >= 10 && isValidCpf(f.cpf) && cepState === "ok" && Boolean(f.street.trim() && f.number.trim());

  const createPix = useServerFn(createPixPayment);
  const checkStatus = useServerFn(getPaymentStatus);
  const [pix, setPix] = useState<{ id: string; amount: number; code: string | null; image: string | null } | null>(null);
  const [paying, setPaying] = useState(false);
  const [err, setErr] = useState("");
  const [copied, setCopied] = useState(false);
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
    if (!ready || paying || !lines.length) return;
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
        <p className="mt-2 text-sm text-muted-foreground">Obrigado pela compra. Seu pagamento foi confirmado.</p>
        <Button asChild size="lg" className="mt-6"><Link to="/">Voltar à loja</Link></Button>
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
        {qr && <img src={qr} alt="QR Code Pix" className="mx-auto mt-6 h-64 w-64 border bg-background p-2" />}
        {pix.code && (
          <>
            <p className="mt-6 break-all border bg-muted p-3 text-left text-xs">{pix.code}</p>
            <Button type="button" size="lg" onClick={async () => {
              if (!pix.code) return;
              try {
                await navigator.clipboard.writeText(pix.code);
                setErr(""); setCopied(true); setTimeout(() => setCopied(false), 2000);
              } catch { setErr("Não foi possível copiar automaticamente. Selecione e copie o código acima."); }
            }}
              className="mt-3 w-full">
              {copied ? "Código copiado!" : "Copiar código Pix"}
            </Button>
          </>
        )}
        {err && <p role="alert" className="mt-3 text-sm text-destructive">{err}</p>}
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
        <Button asChild size="lg" className="mt-6"><Link to="/">Continuar comprando</Link></Button>
      </main>
    );
  }

  return (
    <main className="mx-auto grid max-w-6xl grid-cols-1 items-start gap-6 px-4 py-4 sm:gap-8 sm:py-6 md:grid-cols-[minmax(0,1fr)_340px] md:gap-12 md:px-8 md:py-10">
      <CheckoutDetails values={f} setValues={setF} cepState={cepState} options={options} ship={ship} setShip={setShip} total={total} ready={ready} paying={paying} error={err} onPay={pay} />
      <CheckoutSummary savings={savings} shipping={shipping} total={total} hasShipping={options.length > 0} />
    </main>
  );
}
