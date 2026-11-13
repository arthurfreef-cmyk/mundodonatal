import { Link } from "@tanstack/react-router";
import { Award, Heart, ShieldCheck, Sparkles, Truck } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { WHATSAPP } from "@/lib/catalog";
import { Button } from "@/components/ui/button";

const perks = [
  { icon: Sparkles, t: "Curadoria especializada", d: "Tudo para um Natal inesquecível" },
  { icon: Truck, t: "Entrega para todo o Brasil", d: "Acompanhe cada etapa do pedido" },
  { icon: ShieldCheck, t: "Compra segura", d: "Pagamento protegido" },
  { icon: Heart, t: "Atendimento dedicado", d: "Conte com a nossa equipe" },
];

const inst = ["Sobre Nós", "Como Comprar", "Perguntas Frequentes", "Garantia dos Produtos", "Rastreamento e Entrega", "Guia de Árvores", "Guia Flip Tree", "Mundo Natalino é confiável?"];
const pol = ["Aviso Legal", "Termos de Serviço", "Política de Privacidade", "Política de Reembolso", "Política de Frete", "Informações de Contato"];

export function Footer() {
  const [email, setEmail] = useState("");
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      toast.error("Digite um e-mail válido.");
      return;
    }
    const message = "Olá! Quero receber novidades e ofertas do Mundo Natalino. Meu e-mail é: " + email.trim();
    window.open("https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(message), "_blank", "noopener,noreferrer");
  };
  return (
    <footer>
      <div className="mx-auto grid max-w-5xl grid-cols-2 border-t md:grid-cols-4">
        {perks.map(({ icon: I, t, d }) => (
          <div key={t} className="flex items-center gap-3 border-r p-5 last:border-r-0">
            <I className="h-5 w-5 shrink-0" />
            <div><p className="text-xs">{t}</p><p className="text-[10px] text-muted-foreground">{d}</p></div>
          </div>
        ))}
      </div>
      <section className="newsletter-bg text-primary-foreground">
        <div className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-16 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="eyebrow text-accent">Convites para um Natal inesquecível</p>
            <h2 className="mt-3 text-4xl md:text-5xl">Receba inspiração<br />e ofertas especiais</h2>
            <p className="mt-3 text-xs opacity-80">Novidades, guias de decoração e condições exclusivas direto no seu e-mail.</p>
          </div>
          <form onSubmit={submit} className="flex w-full max-w-md flex-col gap-2 sm:flex-row">
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required placeholder="Seu melhor e-mail" aria-label="E-mail" className="h-11 min-w-0 flex-1 rounded-md bg-background px-4 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            <Button type="submit" className="shrink-0 text-xs">Quero receber novidades →</Button>
          </form>
        </div>
      </section>
      <div className="bg-ink text-ink-foreground">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 md:grid-cols-4">
          <div>
            <img src="/logo-mundo-natalino.svg" alt="Mundo Natalino" className="h-auto w-full max-w-[220px] object-contain object-left" />
            <p className="mt-4 text-xs opacity-70">Tudo para transformar momentos em memórias que brilham.</p>
            <Link to="/collections/$handle" params={{ handle: "all" }} className="mt-4 inline-block text-xs font-semibold text-accent">Conhecer a coleção ›</Link>
          </div>
          <FooterCol title="Institucional" items={inst} />
          <FooterCol title="Políticas" items={pol} />
          <div>
            <p className="eyebrow text-accent">Fale conosco</p>
            <p className="mt-4 text-xs font-semibold">E-mail</p>
            <p className="break-words text-xs opacity-70">atendimento@mundodonatal.com</p>
            <p className="mt-3 text-xs font-semibold">Horário de atendimento</p>
            <p className="text-xs opacity-70">Segunda a sexta, das 9h às 18h</p>
            <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noreferrer" className="mt-3 inline-block text-xs text-accent">WhatsApp</a>
          </div>
        </div>
        <div className="mx-auto max-w-6xl border-t border-ink-foreground/10 px-6 py-6 text-[10px] opacity-60">
          <p className="flex items-center gap-2"><Award className="h-3 w-3" /> Pagamento via Pix</p>
          <p className="mt-3">© 2026 Mundo Natalino. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="eyebrow text-accent">{title}</p>
      <ul className="mt-4 space-y-3 text-xs opacity-80">{items.map((i) => <li key={i}>{i === "Política de Privacidade" ? <Link to="/privacidade" className="hover:underline">{i}</Link> : i}</li>)}
        {title === "Políticas" && <li><Link to="/privacidade" hash="cookies" className="hover:underline">Configurações de cookies</Link></li>}
      </ul>
    </div>
  );
}
