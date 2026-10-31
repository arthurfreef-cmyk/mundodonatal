import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";
import { AD_CHOICE_EVENT, AD_STORAGE_KEY, resolveAdvertisingRegion } from "@/lib/advertising-consent";
import { syncMetaPermission, trackMetaPageView } from "@/lib/meta-pixel";

export function MetaPixel() {
  const pathname = useRouterState({ select: (state) => state.resolvedLocation?.pathname ?? state.location.pathname });
  useEffect(() => {
    let active = true;
    let region: string | null = null;
    let resolved = false;
    void resolveAdvertisingRegion().then((country) => {
      if (!active) return;
      region = country;
      resolved = true;
      trackMetaPageView(pathname, region);
    });
    const onChoice = () => {
      syncMetaPermission(region);
      if (resolved) trackMetaPageView(pathname, region);
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
  }, [pathname]);
  return null;
}