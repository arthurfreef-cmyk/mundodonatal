import { useEffect, useState } from "react";

interface Parts { d: number; h: number; m: number; s: number }
const calc = (target: number): Parts => {
  const diff = Math.max(0, target - Date.now());
  return {
    d: Math.floor(diff / 864e5),
    h: Math.floor((diff / 36e5) % 24),
    m: Math.floor((diff / 6e4) % 60),
    s: Math.floor((diff / 1e3) % 60),
  };
};

/** Contador ao vivo. Só calcula no navegador para não divergir do HTML do servidor. */
export function Countdown({ target, tone = "dark", compact = false }: { target: string; tone?: "dark" | "promo"; compact?: boolean }) {
  const [p, setP] = useState<Parts | null>(null);
  useEffect(() => {
    const t = new Date(target).getTime();
    setP(calc(t));
    const id = setInterval(() => setP(calc(t)), 1000);
    return () => clearInterval(id);
  }, [target]);
  const box = tone === "promo" ? "border-promo-foreground/40 text-promo-foreground" : "border-secondary-foreground/30 bg-secondary-foreground/5";
  const items: [string, number | undefined][] = [["Dias", p?.d], ["Horas", p?.h], ["Min", p?.m], ["Seg", p?.s]];
  return (
    <div className={`flex ${compact ? "gap-1.5" : "gap-2"}`} role="timer">
      {items.map(([l, v]) => (
        <div key={l} className={`${compact ? "w-11 py-1.5" : "w-16 border py-2"} text-center ${compact ? box : box}`}>
          <div className={`font-heading ${compact ? "text-lg" : "text-3xl"}`}>{v === undefined ? "--" : String(v).padStart(2, "0")}</div>
          <div className={`eyebrow opacity-70 ${compact ? "text-[9px]" : ""}`}>{l}</div>
        </div>
      ))}
    </div>
  );
}
