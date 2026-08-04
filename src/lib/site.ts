import business from "../../content/data/business.json";

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://rentacarsifnos.com";

export { business };

/** UTM so Discover Cyclades can attribute traffic from Artemis / rentacarsifnos.com */
const DC_UTM = {
  utm_source: "rentacarsifnos",
  utm_medium: "referral",
  utm_campaign: "artemis_partner",
} as const;

function withDcUtm(url: URL) {
  for (const [key, value] of Object.entries(DC_UTM)) {
    if (!url.searchParams.has(key)) url.searchParams.set(key, value);
  }
  return url.toString();
}

export function tripPlannerUrl(locale: string, prompt?: string) {
  const base = business.discoverCycladesTripPlanner.replace(
    "{locale}",
    locale === "el" ? "el" : "en",
  );
  const url = new URL(base);
  url.searchParams.set("island", "sifnos");
  if (prompt) url.searchParams.set("prompt", prompt);
  return withDcUtm(url);
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

/**
 * Build a Discover Cyclades URL with partner UTMs.
 * Prefer helpers below for known Sifnos destinations (old /sifnos/* paths 404).
 */
export function discoverCycladesUrl(locale: string, path = "") {
  const loc = locale === "el" ? "el" : "en";
  const clean = !path || path === "/" ? "" : path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`https://discovercyclades.gr/${loc}${clean}`);
  return withDcUtm(url);
}

export function sifnosFerryUrl(locale: string) {
  return discoverCycladesUrl(locale, "/ferry-routes/direct/athens-piraeus-to-sifnos");
}

export function sifnosHotelsUrl(locale: string) {
  return discoverCycladesUrl(locale, "/hotels/sifnos");
}

/** Canonical Sifnos island guide on Discover Cyclades. */
export function sifnosGuideDcUrl(locale: string) {
  return discoverCycladesUrl(locale, "/guides/sifnos");
}

/**
 * "How to get there" deep link. Subpages under /sifnos/* soft-404; ferry route is the live page.
 */
export function sifnosHowToGetDcUrl(locale: string) {
  return sifnosFerryUrl(locale);
}

/**
 * Things-to-do / places hub. EN has /places/sifnos; EL falls back to the guide.
 */
export function sifnosThingsToDoDcUrl(locale: string) {
  if (locale === "el") return sifnosGuideDcUrl(locale);
  return discoverCycladesUrl(locale, "/places/sifnos");
}

export function sifnosBeachesDcUrl(locale: string) {
  if (locale === "el") return sifnosGuideDcUrl(locale);
  return discoverCycladesUrl(locale, "/places/sifnos/beaches");
}
