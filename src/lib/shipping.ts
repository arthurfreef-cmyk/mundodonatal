/**
 * Regras de frete do checkout.
 * - "Expresso": valor entre R$ 7,00 e R$ 12,00, gerado de forma estável a partir do CEP
 *   (o mesmo CEP sempre recebe o mesmo valor).
 * - "Grátis": sempre disponível, com prazo maior.
 */
export const SHIPPING_MIN = 7;
export const SHIPPING_MAX = 12;

export interface ShippingOption {
  id: "free" | "express";
  label: string;
  days: string;
  price: number;
}

/** Remove tudo que não for dígito e valida 8 dígitos. */
export function cleanCep(cep: string): string | null {
  const d = cep.replace(/\D/g, "");
  return d.length === 8 ? d : null;
}

export function maskCep(v: string): string {
  const d = v.replace(/\D/g, "").slice(0, 8);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
}

/** Valor do frete expresso (R$ 7–12, centavos .90) derivado do CEP. */
export function expressPrice(cep: string): number {
  const d = cleanCep(cep);
  if (!d) return SHIPPING_MAX;
  let h = 0;
  for (const c of d) h = (h * 31 + Number(c)) % 1000;
  const steps = SHIPPING_MAX - SHIPPING_MIN; // 5 → 7,90 .. 11,90 + 12,00 teto
  const value = SHIPPING_MIN + (h % (steps + 1)) + 0.9;
  return Math.min(SHIPPING_MAX, Math.round(value * 100) / 100);
}

export function shippingOptions(cep: string): ShippingOption[] {
  return [
    { id: "free", label: "Frete Grátis", days: "7 a 12 dias úteis", price: 0 },
    { id: "express", label: "Entrega Expressa", days: "3 a 5 dias úteis", price: expressPrice(cep) },
  ];
}

export interface CepAddress {
  street: string;
  district: string;
  city: string;
  state: string;
}

/** Busca endereço no ViaCEP. Retorna null quando o CEP não existe. */
export async function lookupCep(cep: string): Promise<CepAddress | null> {
  const d = cleanCep(cep);
  if (!d) return null;
  const res = await fetch(`https://viacep.com.br/ws/${d}/json/`);
  if (!res.ok) return null;
  const j = (await res.json()) as { erro?: boolean; logradouro?: string; bairro?: string; localidade?: string; uf?: string };
  if (j.erro) return null;
  return { street: j.logradouro ?? "", district: j.bairro ?? "", city: j.localidade ?? "", state: j.uf ?? "" };
}
