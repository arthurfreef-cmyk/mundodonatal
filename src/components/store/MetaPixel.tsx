import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";
import { AD_CHOICE_EVENT, AD_STORAGE_KEY, resolveAdvertisingRegion } from "@/lib/advertising-consent";
import { syncMetaPermission, trackMetaEvent, trackMetaPageView } from "@/lib/meta-pixel";
import { getProduct } from "@/lib/catalog";
import { productEventParameters } from "@/lib/meta-commerce";

export function MetaPixel() {
  const pathname = useRouterState({ select: (state) => state.resolvedLocation?.pathname ?? state.location.pathname });
  const href = useRouterState({ select: (state) => state.resolvedLocation?.href ?? state.location.href });
  useEffect(() => {
    let active = true;
    let region: string | null = null;
    let resolved = false;
    const trackPage = () => {
      if (!trackMetaPageView(pathname, region)) return;
      if (pathname.startsWith("/products/")) {
        const product = getProduct(decodeURIComponent(pathname.slice("/products/".length)));
        const variant = product?.variants[0];
        if (product && variant) trackMetaEvent("ViewContent", productEventParameters(product, variant));
      }
      // Never share free-text queries: they can contain personal information.
      if (pathname === "/search" && new URL(window.location.href).searchParams.get("q")?.trim()) trackMetaEvent("Search", {});
    };
    void resolveAdvertisingRegion().then((country) => {
      if (!active) return;
      region = country;
      resolved = true;
      trackPage();
    });
    const onChoice = () => {
      syncMetaPermission(region);
      if (resolved) trackPage();
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key === AD_STORAGE_KEY || event.key === null) onChoice();
    };
    window.addEventListener(AD_CHOICE_EVENT, onChoice);
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", onChoice);
    return () => {
      active = false;
      window.removeEventListener(AD_CHOICE_EVENT, onChoice);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", onChoice);
    };
  }, [pathname, href]);
  return null;
}