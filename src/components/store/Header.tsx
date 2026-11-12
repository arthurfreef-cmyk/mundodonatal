import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Lock, Menu, Package, Search, ShoppingBag } from "lucide-react";
import { StoreDrawer } from "./StoreDrawer";
import { useState, type FormEvent } from "react";
import { NAV, WHATSAPP } from "@/lib/catalog";
import { useCart } from "@/lib/cart";
import { BLACK_FRIDAY } from "@/lib/promo";
import { Button } from "@/components/ui/button";

export function Header() {
  const { count, setOpen } = useCart();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [q, setQ] = useState("");
  const [menu, setMenu] = useState(false);

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    if (q.trim()) navigate({ to: "/search", search: { q: q.trim() } });
  };

  if (pathname === "/checkout") return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 md:px-8">
        <Button asChild variant="ghost" size="icon"><Link to="/" aria-label="Voltar à loja"><ArrowLeft /></Link></Button>
        <Link to="/" aria-label="Mundo Natalino" className="inline-flex min-w-0 items-center justify-center"><img src="/logo-mundo-natalino.svg" alt="Mundo Natalino" className="h-12 w-[220px] max-w-full object-contain sm:h-14 sm:w-[250px]" /></Link>
        <span className="flex items-center gap-1.5 text-xs text-secondary"><Lock className="h-4 w-4" /><span className="hidden sm:inline">Compra segura</span></span>
      </div>
    </header>
  );

  return (
    <header className="sticky top-0 z-40 bg-background">
      {BLACK_FRIDAY.active && (
        <Link to="/black-friday" aria-label={`Black Friday · ${BLACK_FRIDAY.percent}% OFF em todo o site`} className="promo-shine block overflow-hidden text-promo-foreground">
          <div aria-hidden="true" className="flex w-max animate-marquee py-2 text-xs font-bold uppercase motion-reduce:animate-none">
            {["first", "repeat"].map((group) => (
              <div key={group} className="flex shrink-0 gap-12 pr-12">
                {["one", "two", "three", "four", "five", "six"].map((item) => (
                  <span key={item}>★ Black Friday · {BLACK_FRIDAY.percent}% OFF em todo o site</span>
                ))}
              </div>
            ))}
          </div>
        </Link>
      )}
      <div className="flex items-center justify-center gap-2 bg-emerald-600 px-3 py-2 text-center text-xs font-semibold text-white sm:text-sm">
        <Package className="h-4 w-4" /> Frete grátis para todo o Brasil
      </div>
      <div className="border-b">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 md:px-8">
          <Button variant="ghost" size="icon" className="md:hidden" aria-label="Abrir menu" onClick={() => setMenu(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <Link to="/" aria-label="Mundo Natalino" className="flex shrink-0 items-center">
            <img src="/logo-mundo-natalino.svg" alt="Mundo Natalino" className="h-14 w-[240px] max-w-full object-contain sm:h-16 sm:w-[280px]" />
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
              <Button type="submit" variant="ghost" size="icon" aria-label="Pesquisar"><Search /></Button>
            </label>
          </form>
          <div className="ml-auto flex items-center gap-5 text-primary">
            <a href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent("Olá! Quero acompanhar meu pedido.")}`} target="_blank" rel="noreferrer" className="hidden items-center gap-2 text-xs font-medium md:flex">
              <Package className="h-4 w-4" /> Acompanhar pedido
            </a>
            <Button variant="ghost" size="icon" aria-label="Abrir carrinho" onClick={() => setOpen(true)} className="relative text-foreground">
              <ShoppingBag className="h-5 w-5" />
              <span className="absolute -right-2 -top-2 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] text-primary-foreground">
                {count}
              </span>
            </Button>
          </div>
        </div>
        <nav className="hidden overflow-x-auto border-t md:block" aria-label="Principal">
          <ul className="mx-auto flex w-max min-w-full justify-center gap-7 px-4 text-[13px] font-medium">
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

      <StoreDrawer open={menu} onOpenChange={setMenu} title="Menu" side="left">
          <div className="min-h-0 flex-1 overflow-y-auto p-6">
            <form onSubmit={(e) => { onSearch(e); setMenu(false); }} className="mb-6">
              <label className="flex items-center rounded-sm border bg-cream px-3"><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar..." aria-label="Buscar no menu" className="min-w-0 flex-1 bg-transparent py-2 text-sm" /><Button type="submit" variant="ghost" size="icon" aria-label="Pesquisar no menu"><Search /></Button></label>
            </form>
            <ul className="space-y-4 text-sm">
              {BLACK_FRIDAY.active && <li><Link to="/black-friday" onClick={() => setMenu(false)} className="font-bold text-primary">Black Friday — {BLACK_FRIDAY.percent}% OFF</Link></li>}
              {NAV.map((n) => <li key={n.to}><Link to={n.to} onClick={() => setMenu(false)}>{n.label}</Link></li>)}
            </ul>
          </div>
      </StoreDrawer>
    </header>
  );
}
