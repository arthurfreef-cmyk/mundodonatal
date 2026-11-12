import type { UtmParams } from "./fruitfy";

const KEY = "mn-utm-v1";
const FIELDS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;

/** Keeps the campaign parameters from the visit that brought the shopper (first touch). */
export function captureUtms(search: string): void {
  try {
    if (window.localStorage.getItem(KEY)) return;
    const q = new URLSearchParams(search);
    const utm: UtmParams = {};
    for (const f of FIELDS) { const v = q.get(f)?.trim(); if (v) utm[f] = v.slice(0, 200); }
    if (Object.keys(utm).length) window.localStorage.setItem(KEY, JSON.stringify(utm));
  } catch { /* storage unavailable */ }
}

export function readUtms(): UtmParams {
  try {
    const raw: unknown = JSON.parse(window.localStorage.getItem(KEY) ?? "{}");
    if (typeof raw !== "object" || raw === null) return {};
    const out: UtmParams = {};
    for (const f of FIELDS) { const v = (raw as Record<string, unknown>)[f]; if (typeof v === "string" && v) out[f] = v.slice(0, 200); }
    return out;
  } catch { return {}; }
}
