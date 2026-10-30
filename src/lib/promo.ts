/**
 * Configuração da Black Friday.
 * Para encerrar a campanha basta trocar `active` para false:
 * os preços voltam ao valor original da loja.
 */
export const BLACK_FRIDAY = {
  active: true,
  percent: 60,
  label: "Black Friday",
  /** Data final usada no contador da campanha. */
  endsAt: "2026-11-30T23:59:59-03:00",
} as const;

export interface PricePair {
  /** Preço cobrado. */
  price: number;
  /** Preço "de" riscado (null quando não há desconto). */
  compareAt: number | null;
}

const round2 = (n: number): number => Math.round(n * 100) / 100;

/**
 * Aplica o desconto da Black Friday sobre o preço original da loja.
 * O preço original passa a ser o "de" riscado; se a loja já tinha um
 * preço "de" maior, ele é mantido.
 */
export function applyPromo(
  basePrice: number,
  storeCompareAt: number | null,
  promo: { active: boolean; percent: number } = BLACK_FRIDAY,
): PricePair {
  if (!Number.isFinite(basePrice) || basePrice < 0) {
    return { price: 0, compareAt: null };
  }
  const original = storeCompareAt && storeCompareAt > basePrice ? storeCompareAt : null;
  if (!promo.active || promo.percent <= 0) {
    return { price: basePrice, compareAt: original };
  }
  const discounted = round2(basePrice * (1 - promo.percent / 100));
  return { price: discounted, compareAt: original ?? basePrice };
}

export function discountPercent({ price, compareAt }: PricePair): number {
  if (!compareAt || compareAt <= price) return 0;
  return Math.round((1 - price / compareAt) * 100);
}

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
export const formatBRL = (n: number): string => brl.format(n);

/** Parcelamento em até 3x sem juros (regra exibida na loja original). */
export const installment = (price: number, times = 3): number => Math.floor((price / times) * 100) / 100;
