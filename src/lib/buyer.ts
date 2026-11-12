/** Contact details remembered on this device to prefill the next checkout (no CPF or address stored). */
export interface SavedBuyer { name: string; email: string; phone: string }
const KEY = "mn-buyer-v1";

export function loadBuyer(): SavedBuyer | null {
  try {
    const raw: unknown = JSON.parse(window.localStorage.getItem(KEY) ?? "null");
    if (typeof raw !== "object" || raw === null) return null;
    const r = raw as Record<string, unknown>;
    if (typeof r["name"] !== "string" || typeof r["email"] !== "string" || typeof r["phone"] !== "string") return null;
    return { name: r["name"].slice(0, 120), email: r["email"].slice(0, 200), phone: r["phone"].slice(0, 20) };
  } catch { return null; }
}

export function saveBuyer(b: SavedBuyer): void {
  try { window.localStorage.setItem(KEY, JSON.stringify(b)); } catch { /* storage unavailable */ }
}
