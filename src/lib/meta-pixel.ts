import { currentAdvertisingPermission } from "@/lib/advertising-consent";

export const META_PIXEL_ID = "1207280195597113";
const SCRIPT_ID = "mundo-natal-meta-pixel";

export type FacebookPixel = {
  (...args: unknown[]): void;
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[][];
  push: FacebookPixel;
  loaded: boolean;
  version: string;
};

declare global {
  interface Window {
    fbq?: FacebookPixel;
    _fbq?: FacebookPixel;
  }
}

let initialized = false;
let lastPath: string | null = null;
let revoked = false;
const PRIVATE_PARAMETER = /^(email|e-mail|phone|telefone|celular|cpf|cnpj|name|nome|first_name|last_name|address|endereco|token|access_token|password|senha|customer.*)$/i;

function hasPrivateUrlData(url: URL): boolean {
  return [...url.searchParams].some(([key, value]) => PRIVATE_PARAMETER.test(key) || /[^\s@]+@[^\s@]+\.[^\s@]+/.test(value)) ||
    /[^\s@]+@[^\s@]+\.[^\s@]+/.test(decodeURIComponent(url.pathname));
}

function safePageUrl(): boolean {
  try {
    const url = new URL(window.location.href);
    if (hasPrivateUrlData(url) || (document.referrer && hasPrivateUrlData(new URL(document.referrer)))) return false;
    // Fragments may contain checkout/auth data; never load the SDK on those URLs.
    if (url.hash) return false;
    return true;
  } catch {
    return false;
  }
}

function initializePixel(): FacebookPixel {
  let pixel = window.fbq;
  if (!pixel) {
    const stub = function (...args: unknown[]) {
      if (stub.callMethod) stub.callMethod.apply(stub, args);
      else stub.queue.push(args);
    } as FacebookPixel;
    stub.queue = [];
    stub.push = stub;
    stub.loaded = true;
    stub.version = "2.0";
    pixel = stub;
    window.fbq = stub;
    window._fbq ??= stub;
  }
  if (!initialized) {
    // No automatic event detection or form-data matching; PageView only.
    pixel("set", "autoConfig", false, META_PIXEL_ID);
    pixel("init", META_PIXEL_ID, {}, { agent: "lovable" });
    initialized = true;
  }
  if (!document.getElementById(SCRIPT_ID)) {
    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.async = true;
    script.src = "https://connect.facebook.net/en_US/fbevents.js";
    document.head.appendChild(script);
  }
  return pixel;
}

export function syncMetaPermission(region: string | null): void {
  if (typeof window === "undefined" || !initialized || !window.fbq) return;
  const allowed = currentAdvertisingPermission(region) && safePageUrl();
  if (!allowed) {
    // Remove unsent PageViews too: loaded=true on the stub is not SDK readiness.
    if (!window.fbq.callMethod) window.fbq.queue = window.fbq.queue.filter((args) => args[0] !== "track" && args[0] !== "trackSingle");
    window.fbq("consent", "revoke");
    revoked = true;
  } else if (revoked) {
    window.fbq("consent", "grant");
    revoked = false;
  }
}

export function trackMetaPageView(pathname: string, region: string | null): boolean {
  if (typeof window === "undefined") return false;
  syncMetaPermission(region);
  if (!currentAdvertisingPermission(region) || !safePageUrl() || pathname !== window.location.pathname || lastPath === pathname) return false;
  const pixel = initializePixel();
  if (revoked) {
    pixel("consent", "grant");
    revoked = false;
  }
  // One PageView per actual page, including client-side navigation.
  pixel("track", "PageView");
  lastPath = pathname;
  return true;
}