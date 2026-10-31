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
  ready: boolean | string;
  paying: boolean;
  error: string;
  onPay: () => Promise<void>;
}

export function CheckoutDetails({ values: f, setValues: setF, cepState, options, ship, setShip, total, ready, paying, error, onPay }: CheckoutDetailsProps) {
  const set = (key: keyof CheckoutValues) => (event: React.ChangeEvent<HTMLInputElement>) => setF((current) => ({ ...current, [key]: event.target.value }));
  return (
    <form className="space-y-7" onSubmit={(event) => { event.preventDefault(); if (ready && !paying) void onPay(); }}>
      <div className="border-b pb-5"><p className="flex items-center gap-2 text-xs font-medium text-secondary"><Lock className="h-4 w-4" /> Checkout seguro</p><h1 className="mt-2 text-3xl">Finalizar compra</h1></div>
      <section className="space-y-4">
        <h2 className="flex items-center gap-2 font-sans text-base font-semibold"><span className="grid h-6 w-6 place-items-center rounded-full bg-muted text-xs">1</span> Seus dados</h2>
        <CheckoutField label="E-mail" autoComplete="email" type="email" placeholder="seu@email.com" value={f.email} onChange={set("email")} required />
        <CheckoutField label="Nome completo" autoComplete="name" value={f.name} onChange={set("name")} required />
        <div className="grid gap-4 sm:grid-cols-2">
          <CheckoutField label="Celular" autoComplete="tel" type="tel" placeholder="(11) 99999-9999" value={f.phone} onChange={(event) => setF((current) => ({ ...current, phone: maskPhone(event.target.value) }))} required />
          <CheckoutField label="CPF" inputMode="numeric" placeholder="000.000.000-00" value={f.cpf} onChange={(event) => setF((current) => ({ ...current, cpf: maskCpf(event.target.value) }))} aria-invalid={f.cpf.replace(/\D/g, "").length === 11 && !isValidCpf(f.cpf)} required />
        </div>
        {f.cpf.replace(/\D/g, "").length === 11 && !isValidCpf(f.cpf) && <p role="alert" className="text-xs text-destructive">CPF inválido. Confira os números.</p>}
      </section>
      <section className="space-y-4 border-t pt-6">
        <h2 className="flex items-center gap-2 font-sans text-base font-semibold"><span className="grid h-6 w-6 place-items-center rounded-full bg-muted text-xs">2</span> Entrega</h2>
        <div className="relative max-w-xs"><CheckoutField label="CEP" autoComplete="postal-code" inputMode="numeric" placeholder="00000-000" value={f.cep} onChange={(event) => setF((current) => ({ ...current, cep: maskCep(event.target.value) }))} required />{cepState === "loading" && <Loader2 aria-label="Buscando endereço" className="absolute bottom-4 right-3 h-4 w-4 animate-spin text-muted-foreground" />}</div>
        {cepState === "error" && <p role="alert" className="text-xs text-destructive">CEP não encontrado. Confira os números.</p>}
        {cepState === "ok" && <>
          <p className="flex items-center gap-2 text-xs text-secondary"><Check className="h-4 w-4" /> {f.city} – {f.state}</p>
          <CheckoutField label="Rua" autoComplete="address-line1" value={f.street} onChange={set("street")} required />
          <div className="grid grid-cols-2 gap-4"><CheckoutField label="Número" value={f.number} onChange={set("number")} required /><CheckoutField label="Complemento (opcional)" autoComplete="address-line2" value={f.comp} onChange={set("comp")} /></div>
          <CheckoutField label="Bairro" value={f.district} onChange={set("district")} />
        </>}
      </section>
      {options.length > 0 && <fieldset className="space-y-3 border-t pt-5"><legend className="px-1 text-sm font-semibold">Forma de entrega</legend>{options.map((option) => (
        <label key={option.id} className={cn("flex cursor-pointer items-center gap-3 rounded-md border p-4 text-sm transition-colors", ship === option.id ? "border-secondary bg-muted" : "border-border bg-background hover:border-secondary/50")}>
          <input type="radio" name="ship" aria-label={option.label} checked={ship === option.id} onChange={() => setShip(option.id)} className="h-4 w-4 accent-secondary" /><Truck className="h-4 w-4 shrink-0 text-secondary" /><span className="min-w-0 flex-1"><b>{option.label}</b><span className="block text-xs text-muted-foreground">{option.days}</span></span><b className="shrink-0 text-secondary">{option.price === 0 ? "GRÁTIS" : formatBRL(option.price)}</b>
        </label>
      ))}</fieldset>}
      <div className="space-y-3 border-t pt-5">
        <div className="flex items-center justify-between text-sm"><span>Total a pagar via Pix</span><b>{formatBRL(total)}</b></div>
        <Button type="submit" variant="commerce" size="lg" disabled={!ready || paying} className="h-14 w-full text-base" aria-busy={paying}>{paying ? <><Loader2 className="animate-spin" /> Gerando Pix…</> : <>COMPRAR AGORA <ArrowRight /></>}</Button>
        {error && <p role="alert" className="text-center text-sm text-destructive">{error}</p>}
        <p className="flex items-center justify-center gap-2 text-xs text-muted-foreground"><Lock className="h-3.5 w-3.5" /> Pagamento via Pix · InvictusPay</p>
      </div>
    </form>
  );
}