import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { getCars, getScooters } from "@/lib/fleet";
import { getBlogPosts, getGuideArticles } from "@/lib/content";
import { routing, type Locale } from "@/i18n/routing";

const staticPaths = [
  "",
  "/cars",
  "/scooters",
  "/rates",
  "/book",
  "/sifnos-guide",
  "/blog",
  "/faq",
  "/about",
  "/terms",
  "/privacy",
  "/cookies",
  "/gdpr",
];

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

  for (const locale of locales) {
    for (const path of staticPaths) {
      entries.push({
        url: `${SITE_URL}/${locale}${path}`,
        lastModified: new Date(),
        changeFrequency: path === "" ? "weekly" : "monthly",
        priority: path === "" ? 1 : 0.7,
        alternates: {
          languages: languageAlternates(path),
        },
      });
    }

    for (const car of getCars()) {
      const path = `/cars/${car.slug}`;
      entries.push({
        url: `${SITE_URL}/${locale}${path}`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.6,
        alternates: {
          languages: languageAlternates(path),
        },
      });
    }
    for (const scooter of getScooters()) {
      const path = `/scooters/${scooter.slug}`;
      entries.push({
        url: `${SITE_URL}/${locale}${path}`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.6,
        alternates: {
          languages: languageAlternates(path),
        },
      });
    }
    for (const g of getGuideArticles(locale)) {
      const path = `/sifnos-guide/${g.slug}`;
      entries.push({
        url: `${SITE_URL}/${locale}${path}`,
        lastModified: g.dateModified ? new Date(g.dateModified) : new Date(),
        changeFrequency: "monthly",
        priority: 0.8,
        alternates: {
          languages: languageAlternates(path),
        },
      });
    }
    for (const p of getBlogPosts(locale)) {
      const path = `/blog/${p.slug}`;
      entries.push({
        url: `${SITE_URL}/${locale}${path}`,
        lastModified: p.dateModified ? new Date(p.dateModified) : new Date(),
        changeFrequency: "monthly",
        priority: 0.7,
        alternates: {
          languages: languageAlternates(path),
        },
      });
    }
  }

  return entries;
}
