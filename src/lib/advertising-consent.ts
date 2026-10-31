// A notice version always resolves to the exact data, purpose, recipient and choices shown.
const LEGACY_NOTICE_VERSION = "meta-pageview-2026-10-31-v1";
const LEGACY_NOTICE = {
  text: "O Pixel da Meta compartilha páginas visitadas, horário, endereço IP, informações do navegador e identificadores de cookies com a Meta Platforms para medir visitas e resultados de anúncios no Facebook e Instagram. Não enviamos dados dos formulários, CPF, e-mail, telefone ou pagamentos. Você pode permitir ou recusar cookies de publicidade e alterar sua escolha nesta página a qualquer momento.",
  choices: ["Permitir publicidade", "Recusar publicidade"],
} as const;
export const AD_NOTICE_VERSION = "meta-commerce-2026-10-31-v2";
export const AD_NOTICE = {
  text: "O Pixel da Meta compartilha páginas e produtos visitados, buscas sem o texto pesquisado, itens adicionados ao carrinho, início do checkout, escolha de Pix e compras pagas (produtos, quantidades, valor e moeda), horário, endereço IP, informações do navegador e identificadores de cookies com a Meta Platforms para medir resultados e otimizar anúncios no Facebook e Instagram. Não enviamos CPF, e-mail, telefone, endereço, dados dos formulários ou código Pix. Você pode permitir ou recusar publicidade e alterar sua escolha nesta página a qualquer momento.",
  choices: ["Permitir publicidade", "Recusar publicidade"],
} as const;
export const AD_STORAGE_KEY = "mundo-natal-advertising-consent-v1";
export const AD_CHOICE_EVENT = "mundo-natal-advertising-choice";

const CONSENT_COUNTRIES = new Set([
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR",
  "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK",
  "SI", "ES", "SE", "IS", "LI", "NO", "GB", "CH", "BR",
]);

export interface AdvertisingChoice {
  advertising: boolean;
  recordedAt: string;
  region: string | null;
  noticeVersion: typeof AD_NOTICE_VERSION | typeof LEGACY_NOTICE_VERSION;
  notice: typeof AD_NOTICE | typeof LEGACY_NOTICE;
}

export interface AdvertisingRecord {
  visitorId: string;
  history: AdvertisingChoice[];
}

export function advertisingAllowed(region: string | null, choice?: boolean, optOut = false): boolean {
  if (optOut || choice === false) return false;
  if (choice === true) return true;
  if (!region || !/^[A-Z]{2}$/.test(region) || region === "XX" || region === "T1") return false;
  return !CONSENT_COUNTRIES.has(region);
}

export function traceRegion(trace: string, hostname: string): string | null {
  const lines = Object.fromEntries(trace.trim().split(/\r?\n/).map((line) => {
    const separator = line.indexOf("=");
    return [line.slice(0, separator), line.slice(separator + 1)];
  }));
  const region = lines["loc"];
  if (lines["h"] !== hostname || !region || !/^[A-Z]{2}$/.test(region) || region === "XX" || region === "T1") return null;
  return region;
}

let regionLookup: Promise<string | null> | undefined;
export function resolveAdvertisingRegion(): Promise<string | null> {
  if (typeof window === "undefined") return Promise.resolve(null);
  if (regionLookup) return regionLookup;
  regionLookup = (async () => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 2000);
    try {
      const response = await fetch("/cdn-cgi/trace", { signal: controller.signal, credentials: "same-origin" });
      return response.ok ? traceRegion(await response.text(), window.location.hostname) : null;
    } catch {
      return null;
    } finally {
      window.clearTimeout(timeout);
    }
  })();
  return regionLookup;
}

export function readAdvertisingRecord(): AdvertisingRecord | null {
  if (typeof window === "undefined") return null;
  try {
    const value: unknown = JSON.parse(localStorage.getItem(AD_STORAGE_KEY) ?? "null");
    if (!value || typeof value !== "object" || !("visitorId" in value) || typeof value.visitorId !== "string" || !("history" in value) || !Array.isArray(value.history)) return null;
    // A bare flag or unrelated analytics choice is not advertising consent evidence.
    if (value.history.length === 0 || !value.history.every((entry: unknown) => {
      if (!entry || typeof entry !== "object") return false;
      return "advertising" in entry && typeof entry.advertising === "boolean" &&
        "recordedAt" in entry && typeof entry.recordedAt === "string" && !Number.isNaN(Date.parse(entry.recordedAt)) &&
        "noticeVersion" in entry && "notice" in entry &&
        ((entry.noticeVersion === AD_NOTICE_VERSION && JSON.stringify(entry.notice) === JSON.stringify(AD_NOTICE)) ||
          (entry.noticeVersion === LEGACY_NOTICE_VERSION && JSON.stringify(entry.notice) === JSON.stringify(LEGACY_NOTICE))) &&
        "region" in entry && (entry.region === null || typeof entry.region === "string");
    })) return null;
    return value as AdvertisingRecord;
  } catch {
    return null;
  }
}

export function hasAdvertisingOptOut(): boolean {
  if (typeof navigator === "undefined") return true;
  const privacyNavigator = navigator as Navigator & { globalPrivacyControl?: boolean };
  return privacyNavigator.globalPrivacyControl === true || navigator.doNotTrack === "1";
}

export function currentAdvertisingPermission(region: string | null): boolean {
  const latest = readAdvertisingRecord()?.history.at(-1);
  // A refusal survives notice changes; old acceptance does not cover new data.
  const choice = latest?.advertising === false ? false : latest?.noticeVersion === AD_NOTICE_VERSION ? latest.advertising : undefined;
  return advertisingAllowed(region, choice, hasAdvertisingOptOut());
}

export function saveAdvertisingChoice(advertising: boolean, region: string | null): boolean {
  try {
    const previous = readAdvertisingRecord();
    const record: AdvertisingRecord = {
      visitorId: previous?.visitorId ?? crypto.randomUUID(),
      history: [...(previous?.history ?? []), { advertising, region, recordedAt: new Date().toISOString(), noticeVersion: AD_NOTICE_VERSION, notice: AD_NOTICE }],
    };
    // Keep acceptance evidence when a visitor subsequently withdraws.
    localStorage.setItem(AD_STORAGE_KEY, JSON.stringify(record));
    window.dispatchEvent(new Event(AD_CHOICE_EVENT));
    return true;
  } catch {
    return false;
  }
}