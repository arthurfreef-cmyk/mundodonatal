import type { Dispatch, SetStateAction } from "react";
import { ArrowRight, Check, Loader2, Lock, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CheckoutField } from "./CheckoutField";
import { isValidCpf, maskCpf, maskPhone } from "@/lib/br";
import { maskCep, type ShippingOption } from "@/lib/shipping";
import { formatBRL } from "@/lib/promo";
import { cn } from "@/lib/utils";

export interface CheckoutValues {
  email: string; name: string; phone: string; cpf: string; cep: string;
  street: string; number: string; comp: string; district: string; city: string; state: string;
}
export interface CheckoutDetailsProps {
  values: CheckoutValues;
  setValues: Dispatch<SetStateAction<CheckoutValues>>;
  cepState: "idle" | "loading" | "ok" | "error";
  options: ShippingOption[];
  ship: ShippingOption["id"];
  setShip: (value: ShippingOption["id"]) => void;
  total: number;
  ready: boolean;
  paying: boolean;
  error: string;
  onPay: () => Promise<void>;
}

export function CheckoutDetails({ values: f, setValues: setF, cepState, options, ship, setShip, total, ready, paying, error, onPay }: CheckoutDetailsProps) {
  const set = (key: keyof CheckoutValues) => (event: React.ChangeEvent<HTMLInputElement>) => setF((current) => ({ ...current, [key]: event.target.value }));
  return (
    <form className="min-w-0 space-y-5 sm:space-y-6" onSubmit={(event) => { event.preventDefault(); if (ready && !paying) void onPay(); }}>
      <div className="rounded-xl border bg-card p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-secondary"><Lock className="h-4 w-4" /> Ambiente seguro</div>
        <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Finalize seu pedido</h1>
        <p className="mt-1 text-sm text-muted-foreground">Preencha seus dados para receber sua compra.</p>
        <div className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
          <span className="h-1.5 flex-1 rounded-full bg-secondary" />
          <span className="h-1.5 flex-1 rounded-full bg-secondary/25" />
          <span className="h-1.5 flex-1 rounded-full bg-secondary/25" />
          <span className="ml-1">Dados · Entrega · Pix</span>
        </div>
      </div>

      <section className="space-y-4 rounded-xl border bg-card p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-3">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-secondary text-sm font-bold text-secondary-foreground">1</span>
          <div><h2 className="font-semibold">Seus dados</h2><p className="text-xs text-muted-foreground">Informações para identificar seu pedido</p></div>
        </div>
        <CheckoutField label="E-mail" autoComplete="email" type="email" placeholder="seu@email.com" value={f.email} onChange={set("email")} required />
        <CheckoutField label="Nome completo" autoComplete="name" placeholder="Como podemos te chamar?" value={f.name} onChange={set("name")} required />
        <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
          <CheckoutField label="Celular" autoComplete="tel" type="tel" placeholder="(11) 99999-9999" value={f.phone} onChange={(event) => setF((current) => ({ ...current, phone: maskPhone(event.target.value) }))} required />
          <CheckoutField label="CPF" inputMode="numeric" placeholder="000.000.000-00" value={f.cpf} onChange={(event) => setF((current) => ({ ...current, cpf: maskCpf(event.target.value) }))} aria-invalid={f.cpf.replace(/\D/g, "").length === 11 && !isValidCpf(f.cpf)} required />
        </div>
        {f.cpf.replace(/\D/g, "").length === 11 && !isValidCpf(f.cpf) && <p role="alert" className="text-xs text-destructive">CPF inválido. Confira os números.</p>}
      </section>

      <section className="space-y-4 rounded-xl border bg-card p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-3">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-secondary text-sm font-bold text-secondary-foreground">2</span>
          <div><h2 className="font-semibold">Endereço de entrega</h2><p className="text-xs text-muted-foreground">Digite o CEP para preencher o endereço automaticamente</p></div>
        </div>
        <div className="relative max-w-xs">
          <CheckoutField label="CEP" autoComplete="postal-code" inputMode="numeric" placeholder="00000-000" value={f.cep} onChange={(event) => setF((current) => ({ ...current, cep: maskCep(event.target.value) }))} required />
          {cepState === "loading" && <Loader2 aria-label="Buscando endereço" className="absolute bottom-4 right-3 h-4 w-4 animate-spin text-muted-foreground" />}
        </div>
        {cepState === "loading" && <p role="status" className="text-xs text-muted-foreground">Localizando seu endereço…</p>}
        {cepState === "error" && <p role="alert" className="text-xs text-destructive">Não encontramos esse CEP. Confira os números e tente novamente.</p>}
        {cepState === "ok" && <>
          <p role="status" className="flex items-center gap-2 rounded-lg bg-secondary/10 px-3 py-2 text-xs font-medium text-secondary"><Check className="h-4 w-4 shrink-0" /> Endereço localizado: {f.city} – {f.state}</p>
          <CheckoutField label="Rua" autoComplete="address-line1" value={f.street} onChange={set("street")} required />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><CheckoutField label="Número" autoComplete="address-line2" value={f.number} onChange={set("number")} required /><CheckoutField label="Complemento (opcional)" value={f.comp} onChange={set("comp")} /></div>
          <CheckoutField label="Bairro" value={f.district} onChange={set("district")} />
        </>}
      </section>

      {options.length > 0 && <fieldset className="space-y-3 rounded-xl border bg-card p-5 shadow-sm sm:p-6">
        <legend className="px-1 text-sm font-semibold">3 · Escolha a entrega</legend>
        {options.map((option) => (
          <label key={option.id} className={cn("flex cursor-pointer items-center gap-3 rounded-lg border p-4 text-sm transition-colors", ship === option.id ? "border-secondary bg-secondary/5 ring-1 ring-secondary/20" : "border-border bg-background hover:border-secondary/50")}>
            <input type="radio" name="ship" aria-label={option.label} checked={ship === option.id} onChange={() => setShip(option.id)} className="h-4 w-4 accent-secondary" />
            {option.id === "sedex" ? <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Sedex_logo.png" alt="SEDEX Correios" className="h-auto w-20 shrink-0 rounded-sm object-contain" /> : <Truck className="h-5 w-5 shrink-0 text-secondary" />}
            <span className="min-w-0 flex-1"><b>{option.label}</b><span className="block text-xs text-muted-foreground">{option.days}</span></span>
            <b className="shrink-0 text-secondary">{option.price === 0 ? "GRÁTIS" : formatBRL(option.price)}</b>
          </label>
        ))}
      </fieldset>}

      <div className="space-y-3 rounded-xl border bg-card p-5 shadow-sm sm:p-6">
        <div className="flex items-center justify-between gap-3 text-sm"><span className="text-muted-foreground">Total do pedido</span><b className="text-xl">{formatBRL(total)}</b></div>
        <Button type="submit" variant="commerce" size="lg" disabled={!ready || paying} className="h-14 w-full text-base font-bold" aria-busy={paying}>
          {paying ? <><Loader2 className="animate-spin" /> Gerando Pix…</> : <>FINALIZAR PEDIDO <ArrowRight /></>}
        </Button>
        {error && <p role="alert" className="text-center text-sm text-destructive">{error}</p>}
        {!ready && !paying && <p className="text-center text-xs text-muted-foreground">Para liberar o pagamento, preencha seus dados, informe um CEP válido, confirme o endereço e revise o CPF e celular.</p>}
        <p className="flex items-center justify-center gap-2 text-xs text-muted-foreground"><Lock className="h-3.5 w-3.5" /> Pagamento seguro via Pix</p>
      </div>
    </form>
  );
}