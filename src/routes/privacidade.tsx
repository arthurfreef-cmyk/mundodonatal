import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/privacidade")({
  head: () => ({
    meta: [
      { title: "Privacidade e cookies | Mundo Natalino" },
      { name: "description", content: "Informações sobre privacidade, armazenamento essencial e processamento de pedidos no Mundo Natalino." },
      { property: "og:title", content: "Privacidade e cookies | Mundo Natalino" },
      { property: "og:description", content: "Saiba como os dados necessários ao funcionamento da loja e à sua compra são utilizados." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-12 md:px-8">
      <div className="flex items-center gap-3 text-secondary"><ShieldCheck className="h-7 w-7" /><p className="eyebrow">Mundo Natalino</p></div>
      <h1 className="mt-4 text-4xl">Privacidade e cookies</h1>
      <p className="mt-3 text-xs text-muted-foreground">Atualizado em 12 de novembro de 2026</p>
      <section className="mt-8 space-y-4 text-sm leading-relaxed">
        <h2 className="text-2xl">Armazenamento essencial</h2>
        <p>Esta loja utiliza armazenamento local e recursos técnicos essenciais para manter o carrinho, lembrar os itens selecionados e permitir a navegação e a finalização da compra.</p>
        <p>Não utilizamos pixels de rastreamento publicitário ou ferramentas de analytics para acompanhar sua navegação nesta loja.</p>
      </section>
      <section className="mt-8 space-y-4 text-sm leading-relaxed">
        <h2 className="text-2xl">Dados para sua compra</h2>
        <p>Os dados informados no checkout são utilizados para consultar o endereço pelo CEP, processar a solicitação de pagamento Pix pela InvictusPay e viabilizar a entrega do pedido. As informações necessárias são compartilhadas com os prestadores envolvidos nessas etapas para executar a compra.</p>
        <p>Os dados de pagamento são processados pelo provedor de pagamento. A loja não solicita nem armazena a senha do aplicativo bancário.</p>
      </section>
      <section className="mt-8 space-y-4 text-sm leading-relaxed">
        <h2 className="text-2xl">Contato</h2>
        <p>Se tiver dúvidas sobre privacidade ou sobre o uso dos seus dados em um pedido, entre em contato com nosso atendimento pelos canais informados no rodapé da loja.</p>
      </section>
    </main>
  );
}
