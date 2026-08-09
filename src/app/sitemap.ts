import type { MetadataRoute } from "next";
import { SITE_URL, SITE_REVISED } from "@/lib/site";
import { getCars, getScooters } from "@/lib/fleet";
import { getBlogPosts, getGuideArticles } from "@/lib/content";
import { routing, type Locale } from "@/i18n/routing";

/**
 * Indexable landing pages only.
 *
 * Deliberately excluded (still indexable, just not advertised):
 * - /terms, /privacy, /cookies, /gdpr - 28 URLs of legal boilerplate that were
 *   competing for crawl budget on a domain with almost no authority.
 * - /book - a form, not a landing page. It is reached from every fleet CTA.
 */
const staticPaths = [
  "",
  "/cars",
  "/scooters",
  "/rates",
  "/reviews",
  "/sifnos-guide",
  "/blog",
  "/faq",
  "/about",
];

/** Commercial landing pages outrank the rest of the static set. */
function staticPriority(path: string) {
  if (path === "") return 1;
  if (path === "/cars" || path === "/scooters") return 0.9;
  if (path === "/rates" || path === "/sifnos-guide") return 0.8;
  return 0.6;
}

const siteRevised = new Date(SITE_REVISED);

function languageAlternates(path: string): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const locale of routing.locales) {
    languages[locale] = `${SITE_URL}/${locale}${path}`;
  }
  languages["x-default"] = `${SITE_URL}/en${path}`;
  return languages;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const locales = routing.locales as readonly Locale[];
  const entries: MetadataRoute.Sitemap = [];

  const push = (
    locale: Locale,
    path: string,
    lastModified: Date,
    priority: number,
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"],
  ) => {
    entries.push({
      url: `${SITE_URL}/${locale}${path}`,
      lastModified,
      changeFrequency,
      priority,
      alternates: { languages: languageAlternates(path) },
    });
  };

  for (const locale of locales) {
    for (const path of staticPaths) {
      push(
        locale,
        path,
        siteRevised,
        staticPriority(path),
        path === "" ? "weekly" : "monthly",
      );
    }

    for (const car of getCars()) {
      push(locale, `/cars/${car.slug}`, siteRevised, 0.6, "monthly");
    }
    for (const scooter of getScooters()) {
      push(locale, `/scooters/${scooter.slug}`, siteRevised, 0.6, "monthly");
    }
    for (const g of getGuideArticles(locale)) {
      push(
        locale,
        `/sifnos-guide/${g.slug}`,
        g.dateModified ? new Date(g.dateModified) : siteRevised,
        0.8,
        "monthly",
      );
    }
    for (const p of getBlogPosts(locale)) {
      push(
        locale,
        `/blog/${p.slug}`,
        p.dateModified ? new Date(p.dateModified) : siteRevised,
        0.7,
        "monthly",
      );
    }
  }

  return entries;
}
