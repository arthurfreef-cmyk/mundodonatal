/**
 * Opções de entrega exibidas no checkout.
 * O valor do SEDEX varia por comprador (CEP + documento) e é recalculado
 * no servidor com os mesmos dados antes de gerar o Pix.
 */
export const SHIPPING_MIN_CENTS = 801;
export const SHIPPING_MAX_CENTS = 1199;

export interface ShippingOption {
  id: "free" | "sedex";
  label: string;
  days: string;
  price: number;
}

export function cleanCep(cep: string): string | null {
  const d = cep.replace(/\D/g, "");
  return d.length === 8 ? d : null;
}

export function maskCep(v: string): string {
  const d = v.replace(/\D/g, "").slice(0, 8);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
}

/** Valor individual entre R$ 8,01 e R$ 11,99, estável para o mesmo cliente. */
export function sedexPrice(cep: string, identity = ""): number {
  const d = cleanCep(cep);
  if (!d) return 11.99;
  const seed = `${d}:${identity.replace(/\D/g, "")}`;
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  const cents = SHIPPING_MIN_CENTS + ((hash >>> 0) % (SHIPPING_MAX_CENTS - SHIPPING_MIN_CENTS + 1));
  return cents / 100;
}

export function shippingOptions(cep: string, identity = ""): ShippingOption[] {
  return [
    { id: "free", label: "Frete Grátis", days: "7 a 12 dias úteis", price: 0 },
    { id: "sedex", label: "Via Sedex", days: "Entrega pelos Correios", price: sedexPrice(cep, identity) },
  ];
}

export interface CepAddress {
  street: string;
  district: string;
  city: string;
  state: string;
}

export async function lookupCep(cep: string): Promise<CepAddress | null> {
  const d = cleanCep(cep);
  if (!d) return null;
  const res = await fetch(`https://viacep.com.br/ws/${d}/json/`);
  if (!res.ok) return null;
  const j = (await res.json()) as { erro?: boolean; logradouro?: string; bairro?: string; localidade?: string; uf?: string };
  if (j.erro) return null;
  return { street: j.logradouro ?? "", district: j.bairro ?? "", city: j.localidade ?? "", state: j.uf ?? "" };
}
