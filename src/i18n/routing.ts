import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "el", "it", "fr", "de", "sv", "nl"],
  defaultLocale: "en",
  localePrefix: "always",
  // Avoid middleware Link x-default → unprefixed URLs (those 307 and confuse GSC).
  // Hreflang stays in HTML metadata + sitemap with correct /en/... x-default.
  alternateLinks: false,
});

export type Locale = (typeof routing.locales)[number];
