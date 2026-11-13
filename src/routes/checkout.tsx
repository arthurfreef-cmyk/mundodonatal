import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { BadgeCheck, Check, Loader2, QrCode, Smartphone } from "lucide-react";
import { variantPrice } from "@/lib/catalog";
import { useCart } from "@/lib/cart";
import { formatBRL } from "@/lib/promo";
import { cleanCep, lookupCep, shippingOptions, type ShippingOption } from "@/lib/shipping";
import { isValidCpf } from "@/lib/br";
import { useServerFn } from "@tanstack/react-start";
import { createPixPayment, getPaymentStatus } from "@/lib/payments.functions";
import { readUtms } from "@/lib/utm";
import { loadBuyer, saveBuyer } from "@/lib/buyer";
import { Button } from "@/components/ui/button";
import { CheckoutDetails } from "@/components/store/CheckoutDetails";
import { CheckoutSummary } from "@/components/store/CheckoutSummary";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Finalizar compra | Mundo Natalino" },
      { name: "description", content: "Checkout do Mundo Natalino com frete grátis e opção de entrega SEDEX." },
      { property: "og:title", content: "Finalizar compra | Mundo Natalino" },
      { property: "og:description", content: "Checkout com frete grátis ou entrega SEDEX." },
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
  const paymentConfirmed = useRef(false);
  useEffect(() => setOpen(false), [setOpen]);
  // Restaura os dados de contato da última compra neste aparelho.
  useEffect(() => {
    const b = loadBuyer();
    if (b) setF((s) => ({ ...s, name: s.name || b.name, email: s.email || b.email, phone: s.phone || b.phone }));
  }, []);

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

  const options = useMemo(() => (cepState === "ok" ? shippingOptions(f.cep, f.cpf) : []), [cepState, f.cep, f.cpf]);
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
        const r = await checkStatus({ data: { id: pix.id } });
        if (r.status === "paid" && !paymentConfirmed.current) {
          paymentConfirmed.current = true;
          setDone(true); clear();
        } else if (r.status === "canceled") {
          setPix(null); setErr("Este Pix foi cancelado ou expirou. Gere um novo para concluir a compra.");
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
        cep: f.cep, shipping: ship, utm: readUtms(),
      } });
      if (!r.ok) setErr(r.error); else {
        saveBuyer({ name: f.name.trim(), email: f.email.trim(), phone: f.phone });
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
      : pix.code ? `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(pix.code)}` : null;
    return (
      <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/60 px-3 py-3 backdrop-blur-sm sm:items-center sm:px-5 sm:py-6" role="presentation">
        <section
          role="dialog"
          aria-modal="true"
          aria-labelledby="pix-dialog-title"
          className="relative my-auto flex max-h-[calc(100dvh-24px)] w-full max-w-md flex-col overflow-hidden rounded-2xl border bg-background shadow-2xl sm:max-h-[min(820px,calc(100dvh-48px))]"
        >
          <div className="shrink-0 border-b px-5 pb-4 pt-5 text-center sm:px-7 sm:pt-6">
            <div className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary"><QrCode className="h-5 w-5" /></div>
            <h1 id="pix-dialog-title" className="mt-2 text-2xl font-bold tracking-tight">Seu Pix está pronto!</h1>
            <p className="mt-1 text-sm text-muted-foreground">Escaneie o QR Code ou copie o código para pagar.</p>
            <p className="mt-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">Total a pagar</p>
            <p className="text-2xl font-extrabold text-primary">{formatBRL(pix.amount / 100)}</p>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4 sm:px-7">
            {qr ? (
              <div className="mx-auto flex w-full flex-col items-center">
                <div className="rounded-xl border bg-white p-2 shadow-sm">
                  <img src={qr} alt="QR Code Pix para pagamento" className="block h-[min(54vw,240px)] w-[min(54vw,240px)] object-contain sm:h-60 sm:w-60" />
                </div>
                {pix.code && (
                  <details className="mt-3 w-full max-w-sm rounded-lg border bg-muted/40 p-3">
                    <summary className="cursor-pointer text-center text-xs font-semibold text-muted-foreground">Mostrar código Pix copia e cola</summary>
                    <p className="mt-2 break-all select-all text-left text-xs leading-relaxed text-foreground">{pix.code}</p>
                  </details>
                )}
              </div>
            ) : (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-center text-sm text-destructive">
                O QR Code não foi disponibilizado. {pix.code ? "Use o código Pix copia e cola abaixo." : "Tente gerar o Pix novamente."}
                {pix.code && <p className="mt-2 break-all select-all text-left text-xs">{pix.code}</p>}
              </div>
            )}

            {pix.code && (
              <Button type="button" size="lg" onClick={async () => {
                try {
                  if (navigator.clipboard?.writeText) {
                    await navigator.clipboard.writeText(pix.code!);
                  } else {
                    const field = document.createElement("textarea");
                    field.value = pix.code!;
                    field.setAttribute("readonly", "");
                    field.style.position = "fixed";
                    field.style.opacity = "0";
                    document.body.appendChild(field);
                    field.select();
                    const copiedSuccessfully = document.execCommand("copy");
                    field.remove();
                    if (!copiedSuccessfully) throw new Error("Clipboard unavailable");
                  }
                  setErr("");
                  setCopied(true);
                  window.setTimeout(() => setCopied(false), 2500);
                } catch {
                  setErr("Não foi possível copiar automaticamente. Abra o código Pix abaixo, selecione e copie.");
                }
              }} className="mt-3 h-12 w-full max-w-sm text-base font-bold">
                {copied ? <><Check className="h-5 w-5" /> Código copiado!</> : "Copiar código Pix"}
              </Button>
            )}
            {err && <p role="alert" className="mt-3 text-center text-sm text-destructive">{err}</p>}
            <div className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-primary/5 px-3 py-2.5 text-center text-xs font-medium text-primary">
              <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
              Aguardando confirmação automática do pagamento
            </div>
            <ol className="mt-3 space-y-2 text-xs text-muted-foreground">
              <li className="flex gap-2"><Smartphone className="h-4 w-4 shrink-0 text-primary" /> Abra o aplicativo do seu banco e escolha Pix.</li>
              <li className="flex gap-2"><QrCode className="h-4 w-4 shrink-0 text-primary" /> Escaneie o QR Code ou use o código copia e cola.</li>
              <li className="flex gap-2"><BadgeCheck className="h-4 w-4 shrink-0 text-primary" /> Após pagar, aguarde. Confirmaremos seu pedido automaticamente.</li>
            </ol>
          </div>
          <div className="shrink-0 border-t bg-background px-5 py-3 text-center text-[11px] text-muted-foreground">
            Não feche esta tela até concluir o pagamento.
          </div>
        </section>
      </div>
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
