import { routing, type Locale } from "@/i18n/routing";

export const LOCALE_NATIVE_NAMES: Record<Locale, string> = {
  en: "English",
  el: "Ελληνικά",
  it: "Italiano",
  fr: "Français",
  de: "Deutsch",
  sv: "Svenska",
  nl: "Nederlands",
};

/** Open Graph locale tags (underscore form). */
export const OG_LOCALE: Record<Locale, string> = {
  en: "en_US",
  el: "el_GR",
  it: "it_IT",
  fr: "fr_FR",
  de: "de_DE",
  sv: "sv_SE",
  nl: "nl_NL",
};

/** BCP-47 tags for JSON-LD `inLanguage` and Intl. */
export const BCP47: Record<Locale, string> = {
  en: "en-US",
  el: "el-GR",
  it: "it-IT",
  fr: "fr-FR",
  de: "de-DE",
  sv: "sv-SE",
  nl: "nl-NL",
};

export function isLocale(value: string): value is Locale {
  return (routing.locales as readonly string[]).includes(value);
}

export function asLocale(value: string | undefined | null, fallback: Locale = "en"): Locale {
  if (value && isLocale(value)) return value;
  return fallback;
}

export function intlLocale(locale: string): string {
  return BCP47[asLocale(locale)] ?? "en-GB";
}

export function ogLocale(locale: string): string {
  return OG_LOCALE[asLocale(locale)];
}

export function bcp47(locale: string): string {
  return BCP47[asLocale(locale)];
}

export type LocalizedString = Partial<Record<Locale, string>> & { en: string };

export type LocalizedStringList = Partial<Record<Locale, string[]>> & { en: string[] };

/** Pick a localized string/list field; falls back to English. */
export function pickLocalized<T>(
  field: Partial<Record<string, T>> | undefined,
  locale: string,
): T | undefined {
  if (!field) return undefined;
  const loc = asLocale(locale);
  if (field[loc] !== undefined) return field[loc] as T;
  return field.en as T | undefined;
}

export function hreflangLanguages(path: string, absoluteUrl: (locale: Locale, path?: string) => string) {
  const languages: Record<string, string> = {};
  for (const locale of routing.locales) {
    languages[locale] = absoluteUrl(locale, path);
  }
  languages["x-default"] = absoluteUrl("en", path);
  return languages;
}
