import business from "../../content/data/business.json";

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://rentacarsifnos.com";

export { business };

export function tripPlannerUrl(locale: string, prompt?: string) {
  const base = business.discoverCycladesTripPlanner.replace(
    "{locale}",
    locale === "el" ? "el" : "en",
  );
  const url = new URL(base);
  url.searchParams.set("island", "sifnos");
  if (prompt) url.searchParams.set("prompt", prompt);
  return url.toString();
}

/** Prefer NEXT_PUBLIC_WHATSAPP for local testing overrides. */
export function whatsappPhoneDigits() {
  const raw = process.env.NEXT_PUBLIC_WHATSAPP || business.whatsapp;
  return raw.replace(/\D/g, "");
}

export function whatsappUrl(text?: string) {
  const url = new URL(`https://wa.me/${whatsappPhoneDigits()}`);
  if (text) url.searchParams.set("text", text);
  return url.toString();
}

export function discoverCycladesUrl(locale: string, path = "") {
  const loc = locale === "el" ? "el" : "en";
  if (!path || path === "/") return `https://discovercyclades.gr/${loc}`;
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `https://discovercyclades.gr/${loc}${clean}`;
}

export function sifnosFerryUrl(locale: string) {
  return discoverCycladesUrl(locale, "/ferry-routes/direct/athens-piraeus-to-sifnos");
}

export function sifnosHotelsUrl(locale: string) {
  return discoverCycladesUrl(locale, "/hotels/sifnos");
}

export function sifnosGuideDcUrl(locale: string) {
  return discoverCycladesUrl(locale, "/sifnos");
}
