import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, Package, Search, ShoppingBag, User, X } from "lucide-react";
import { useState, type FormEvent } from "react";
import { ASSET, NAV, WHATSAPP } from "@/lib/catalog";
import { useCart } from "@/lib/cart";
import { BLACK_FRIDAY } from "@/lib/promo";

export function Header() {
  const { count, setOpen } = useCart();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [menu, setMenu] = useState(false);

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    if (q.trim()) navigate({ to: "/search", search: { q: q.trim() } });
  };

  return (
    <header className="sticky top-0 z-40 bg-background">
      {BLACK_FRIDAY.active && (
        <Link to="/black-friday" className="promo-shine block overflow-hidden text-promo-foreground">
          <div className="flex w-max animate-marquee gap-12 py-2 text-xs font-bold uppercase tracking-[0.2em]">
            {Array.from({ length: 12 }).map((_, i) => (
              <span key={i}>★ Black Friday · {BLACK_FRIDAY.percent}% OFF em todo o site</span>
            ))}
          </div>
        </Link>
      )}
      <div className="bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-7xl justify-center gap-8 px-4 py-2 text-[11px] md:gap-16">
          <span>Frete grátis — consulte condições</span>
          <span className="hidden md:inline">Parcele em até 3x sem juros; demais parcelas com juros</span>
          <a className="hidden underline md:inline" href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noreferrer">
            Atendimento especializado
          </a>
        </div>
      </div>
      <div className="border-b">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 md:px-8">
          <button className="md:hidden" aria-label="Abrir menu" onClick={() => setMenu(true)}>
            <Menu className="h-5 w-5" />
          </button>
          <Link to="/" className="shrink-0">
            <img src={ASSET("logo-mundo-do-natal-favicon-v1.png")} alt="Mundo do Natal" className="h-12 w-auto md:h-14" />
          </Link>
          <form onSubmit={onSearch} className="mx-auto hidden w-full max-w-md md:block">
            <label className="flex items-center rounded-sm border bg-cream px-3">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="O que você procura para o seu Natal?"
                className="w-full bg-transparent py-2 text-sm outline-none"
                aria-label="Buscar"
              />
              <Search className="h-4 w-4" />
            </label>
          </form>
          <div className="ml-auto flex items-center gap-5 text-primary">
            <User className="hidden h-5 w-5 text-foreground md:block" aria-hidden />
            <a href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent("Olá! Quero acompanhar meu pedido.")}`} target="_blank" rel="noreferrer" className="hidden items-center gap-2 text-xs font-medium md:flex">
              <Package className="h-4 w-4" /> Acompanhar pedido
            </a>
            <button aria-label="Abrir carrinho" onClick={() => setOpen(true)} className="relative text-foreground">
              <ShoppingBag className="h-5 w-5" />
              <span className="absolute -right-2 -top-2 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] text-primary-foreground">
                {count}
              </span>
            </button>
          </div>
        </div>
        <nav className="hidden border-t md:block" aria-label="Principal">
          <ul className="mx-auto flex max-w-7xl justify-center gap-7 px-4 text-[13px] font-medium">
            {NAV.map((n) => (
              <li key={n.to}>
                <Link
                  to={n.to}
                  activeOptions={{ exact: true }}
                  className="block border-b-2 border-transparent py-3 hover:text-primary"
                  activeProps={{ className: "border-primary! text-primary" }}
                >
                  {n.label}
                </Link>
              </li>
            ))}
            {BLACK_FRIDAY.active && (
              <li>
                <Link to="/black-friday" className="block py-3 font-bold text-primary">Black Friday</Link>
              </li>
            )}
            <li>
              <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noreferrer" className="block py-3 hover:text-primary">Contato</a>
            </li>
          </ul>
        </nav>
      </div>

      {menu && (
        <div className="fixed inset-0 z-50 bg-ink/50 md:hidden" onClick={() => setMenu(false)}>
          <div className="h-full w-80 max-w-[85%] overflow-y-auto bg-background p-6" onClick={(e) => e.stopPropagation()}>
            <button aria-label="Fechar menu" onClick={() => setMenu(false)} className="mb-6"><X className="h-5 w-5" /></button>
            <form onSubmit={(e) => { onSearch(e); setMenu(false); }} className="mb-6">
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar..." className="w-full rounded-sm border bg-cream px-3 py-2 text-sm" />
            </form>
            <ul className="space-y-4 text-sm">
              {BLACK_FRIDAY.active && <li><Link to="/black-friday" onClick={() => setMenu(false)} className="font-bold text-primary">Black Friday — {BLACK_FRIDAY.percent}% OFF</Link></li>}
              {NAV.map((n) => <li key={n.to}><Link to={n.to} onClick={() => setMenu(false)}>{n.label}</Link></li>)}
            </ul>
          </div>
        </div>
      )}
    </header>
  );
}
