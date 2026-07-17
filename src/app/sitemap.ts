import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { getCars, getScooters } from "@/lib/fleet";
import { getBlogPosts, getGuideArticles } from "@/lib/content";

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
];

export default function sitemap(): MetadataRoute.Sitemap {
  const locales = ["en", "el"] as const;
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    for (const path of staticPaths) {
      entries.push({
        url: `${SITE_URL}/${locale}${path}`,
        lastModified: new Date(),
        changeFrequency: path === "" ? "weekly" : "monthly",
        priority: path === "" ? 1 : 0.7,
        alternates: {
          languages: {
            en: `${SITE_URL}/en${path}`,
            el: `${SITE_URL}/el${path}`,
          },
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
      });
    }
    for (const scooter of getScooters()) {
      const path = `/scooters/${scooter.slug}`;
      entries.push({
        url: `${SITE_URL}/${locale}${path}`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }
    for (const g of getGuideArticles(locale)) {
      entries.push({
        url: `${SITE_URL}/${locale}/sifnos-guide/${g.slug}`,
        lastModified: g.dateModified ? new Date(g.dateModified) : new Date(),
        changeFrequency: "monthly",
        priority: 0.8,
      });
    }
    for (const p of getBlogPosts(locale)) {
      entries.push({
        url: `${SITE_URL}/${locale}/blog/${p.slug}`,
        lastModified: p.dateModified ? new Date(p.dateModified) : new Date(),
        changeFrequency: "monthly",
        priority: 0.7,
      });
    }
  }

  return entries;
}
