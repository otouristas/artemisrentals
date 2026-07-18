import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "el", "it", "fr", "de", "sv", "nl"],
  defaultLocale: "en",
  localePrefix: "always",
});

export type Locale = (typeof routing.locales)[number];
