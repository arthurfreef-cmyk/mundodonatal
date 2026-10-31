import { beforeEach, describe, expect, it, vi } from "vitest";
import { AD_STORAGE_KEY, advertisingAllowed, readAdvertisingRecord, saveAdvertisingChoice, traceRegion } from "./advertising-consent";
import { cartEventParameters } from "./meta-commerce";

describe("advertising rules", () => {
  beforeEach(() => localStorage.clear());
  it("blocks Brazil and unknown regions without permission", () => {
    expect(advertisingAllowed("BR")).toBe(false);
    expect(advertisingAllowed(null)).toBe(false);
    expect(advertisingAllowed("US")).toBe(true);
    expect(advertisingAllowed("US", false)).toBe(false);
    expect(advertisingAllowed("BR", true, true)).toBe(false);
  });
  it("rejects rewrite traces and unknown locations", () => {
    expect(traceRegion("h=other.com\nloc=US", "localhost")).toBeNull();
    expect(traceRegion("h=localhost\nloc=XX", "localhost")).toBeNull();
    expect(traceRegion("h=localhost\nloc=BR", "localhost")).toBe("BR");
  });
  it("keeps acceptance evidence when withdrawn", () => {
    saveAdvertisingChoice(true, "BR");
    saveAdvertisingChoice(false, "BR");
    expect(readAdvertisingRecord()?.history.map((entry) => entry.advertising)).toEqual([true, false]);
    expect(localStorage.getItem(AD_STORAGE_KEY)).not.toBeNull();
  });
});

describe("commerce pixel", () => {
  beforeEach(() => {
    vi.resetModules();
    localStorage.clear();
    sessionStorage.clear();
    delete window.fbq;
    delete window._fbq;
    document.getElementById("mundo-natal-meta-pixel")?.remove();
    window.history.replaceState({}, "", "/");
  });
  it("does not initialize or queue denied events", async () => {
    const pixel = await import("./meta-pixel");
    pixel.syncMetaPermission("BR");
    expect(pixel.trackMetaEvent("AddToCart", {})).toBe(false);
    expect(window.fbq).toBeUndefined();
  });
  it("initializes the supplied ID once and reports a real cart value", async () => {
    const pixel = await import("./meta-pixel");
    pixel.trackMetaPageView("/", "US");
    pixel.trackMetaPageView("/", "US");
    const payload = cartEventParameters([{ variantId: 123, qty: 2, unit: 99.98 }]);
    pixel.trackMetaEvent("AddToCart", payload);
    expect(window.fbq?.queue.filter((args) => args[0] === "init")).toEqual([["init", "1207280195597113", {}, { agent: "lovable" }]]);
    expect(window.fbq?.queue.filter((args) => args[1] === "PageView")).toHaveLength(1);
    expect(payload.value).toBe(199.96);
    expect(payload.currency).toBe("BRL");
    expect(window.fbq?.queue.some((args) => args[1] === "AddToCart")).toBe(true);
  });
  it("reports a paid amount once, not personal information", async () => {
    const pixel = await import("./meta-pixel");
    pixel.syncMetaPermission("US");
    const payload = cartEventParameters([{ variantId: 123, qty: 2, unit: 99.98 }], 207.86);
    expect(pixel.trackMetaEvent("Purchase", payload, "paid-example")).toBe(true);
    expect(pixel.trackMetaEvent("Purchase", payload, "paid-example")).toBe(false);
    expect(window.fbq?.queue.filter((args) => args[1] === "Purchase")).toHaveLength(1);
    expect(payload.value).toBe(207.86);
    expect(Object.keys(payload)).not.toContain("email");
  });
  it("withdrawal removes unsent events and does not replay them", async () => {
    const pixel = await import("./meta-pixel");
    pixel.trackMetaPageView("/", "US");
    saveAdvertisingChoice(false, "US");
    pixel.syncMetaPermission("US");
    expect(window.fbq?.queue.filter((args) => args[0] === "track")).toHaveLength(0);
    expect(pixel.trackMetaEvent("Purchase", {}, "denied-order")).toBe(false);
    saveAdvertisingChoice(true, "US");
    pixel.syncMetaPermission("US");
    expect(window.fbq?.queue.some((args) => args[1] === "Purchase")).toBe(false);
  });
  it("blocks URLs containing customer identifiers", async () => {
    const pixel = await import("./meta-pixel");
    window.history.replaceState({}, "", "/?cpf=12345678900");
    expect(pixel.trackMetaPageView("/", "US")).toBe(false);
    expect(window.fbq).toBeUndefined();
  });
});