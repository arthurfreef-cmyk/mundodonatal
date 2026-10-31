import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AD_CHOICE_EVENT, AD_NOTICE, AD_STORAGE_KEY, currentAdvertisingPermission, hasAdvertisingOptOut, readAdvertisingRecord, resolveAdvertisingRegion, saveAdvertisingChoice } from "@/lib/advertising-consent";

export const Route = createFileRoute("/privacidade")({
  head: () => ({
    meta: [
      { title: "Privacidade e cookies | Mundo do Natal" },
      { name: "description", content: "Informações sobre dados, Pixel da Meta e escolhas de cookies de publicidade no Mundo do Natal." },
      { property: "og:title", content: "Privacidade e cookies | Mundo do Natal" },
      { property: "og:description", content: "Consulte o uso de dados e gerencie suas escolhas de cookies de publicidade." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  const [region, setRegion] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState("Verificando suas preferências…");
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    let country: string | null = null;
    const refresh = () => {
      const choice = readAdvertisingRecord()?.history.at(-1)?.advertising;
      setStatus(hasAdvertisingOptOut() ? "Publicidade desativada pelo sinal de privacidade do seu navegador." :
        choice === false ? "Publicidade recusada." : currentAdvertisingPermission(country) ?
          (choice === true ? "Publicidade permitida por você." : "Medição ativa conforme a localização, sem consentimento registrado.") :
          "Publicidade bloqueada: é necessário consentimento ou a localização não foi identificada.");
    };
    void resolveAdvertisingRegion().then((value) => {
      if (!active) return;
      country = value;
      setRegion(value);
      setReady(true);
      refresh();
    });
    const onStorage = (event: StorageEvent) => { if (event.key === AD_STORAGE_KEY || event.key === null) refresh(); };
    window.addEventListener(AD_CHOICE_EVENT, refresh);
    window.addEventListener("storage", onStorage);
    return () => {
      active = false;
      window.removeEventListener(AD_CHOICE_EVENT, refresh);
      window.removeEventListener("storage", onStorage);
    };
  }, []);
  const choose = (allow: boolean) => {
    setError(saveAdvertisingChoice(allow, region) ? "" : "Não foi possível salvar sua escolha. Verifique se o armazenamento do navegador está disponível.");
  };
  return (
    <main className="mx-auto max-w-3xl px-5 py-12 md:px-8">
      <div className="flex items-center gap-3 text-secondary"><ShieldCheck className="h-7 w-7" /><p className="eyebrow">Mundo do Natal</p></div>
      <h1 className="mt-4 text-4xl">Privacidade e cookies</h1>
      <p className="mt-3 text-xs text-muted-foreground">Atualizado em 31 de outubro de 2026</p>
      <section className="mt-8 space-y-4 text-sm leading-relaxed">
        <h2 className="text-2xl">Dados de navegação e publicidade</h2>
        <p>{AD_NOTICE.text}</p>
        <p>A Meta pode utilizar esses dados conforme sua própria política para medição, atribuição e personalização de anúncios. Enviamos PageView, ViewContent, Search sem o texto pesquisado, AddToCart, InitiateCheckout, AddPaymentInfo e Purchase somente após a confirmação de pagamento. Não enviamos dados de clientes para correspondência de identidade.</p>
        <p>O Pixel usa cookies de publicidade, como _fbp e, quando aplicável, _fbc. Não carregamos o Pixel antes da permissão em regiões que exigem consentimento, incluindo Brasil, União Europeia, Espaço Econômico Europeu, Reino Unido e Suíça. Se a localização não puder ser confirmada, a publicidade permanece bloqueada. Fora dessas regiões, a medição pode ficar ativa, respeitando recusas e sinais de privacidade do navegador.</p>
        <p>Mais informações na <a className="text-primary underline" href="https://www.facebook.com/privacy/policy/" target="_blank" rel="noreferrer">Política de Privacidade da Meta</a>.</p>
      </section>
      <section id="cookies" className="mt-8 border-y py-7">
        <h2 className="text-2xl">Configurações de cookies</h2>
        <p className="mt-3 text-sm leading-relaxed">Sua escolha de publicidade é opcional e não interfere nas compras. Registramos neste navegador a escolha, a data, a região, um identificador local e o aviso apresentado. Guardamos o histórico, inclusive uma eventual retirada de consentimento. Ele permanece até você limpar o armazenamento do site; a escolha vale para este navegador e é atualizada também em outras abas.</p>
        <p role="status" className="mt-4 text-sm font-semibold">{status}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button variant="outline" disabled={!ready} onClick={() => choose(false)}>Recusar publicidade</Button>
          <Button variant="outline" disabled={!ready} onClick={() => choose(true)}>Permitir publicidade</Button>
        </div>
        {error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}
        <p className="mt-4 text-xs text-muted-foreground">Recusar interrompe novos envios imediatamente; não desfaz dados já enviados à Meta. Visitas bloqueadas não são enviadas depois da aceitação. Você também pode apagar cookies pelo navegador.</p>
      </section>
      <section className="mt-8 space-y-4 text-sm leading-relaxed">
        <h2 className="text-2xl">Dados para sua compra</h2>
        <p>O carrinho usa o armazenamento local do navegador. Os dados preenchidos no checkout são utilizados para consultar o endereço pelo CEP e solicitar o pagamento Pix à InvictusPay, quando você decide pagar. Esses dados não são enviados ao Pixel. Cookies e armazenamento necessários ao carrinho não dependem da sua escolha de publicidade.</p>
      </section>
    </main>
  );
}