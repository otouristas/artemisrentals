import type { Metadata } from "next";
import { business, SITE_URL } from "./site";
import type { Locale } from "@/i18n/routing";
import { routing } from "@/i18n/routing";
import { bcp47, hreflangLanguages, ogLocale } from "@/lib/i18n-locale";

export function localePath(locale: Locale, path = "") {
  const clean = path.startsWith("/") ? path : `/${path}`;
  if (clean === "/") return `/${locale}`;
  return `/${locale}${clean}`;
}

export function absoluteUrl(locale: Locale, path = "") {
  return `${SITE_URL}${localePath(locale, path)}`;
}

export function buildMetadata({
  locale,
  title,
  description,
  path = "",
  image = "/images/brand/hero-sifnos.jpg",
  type = "website",
}: {
  locale: Locale;
  title: string;
  description: string;
  path?: string;
  image?: string;
  type?: "website" | "article";
}): Metadata {
  const url = absoluteUrl(locale, path);
  const ogImage = image.startsWith("http") ? image : `${SITE_URL}${image}`;
  const languages = hreflangLanguages(path, absoluteUrl);

  return {
    title,
    description,
    alternates: { canonical: url, languages },
    openGraph: {
      title,
      description,
      url,
      siteName: business.name,
      locale: ogLocale(locale),
      type,
      images: [{ url: ogImage, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    other: {
      "geo.region": "GR-L",
      "geo.placename": "Apollonia, Sifnos, Cyclades",
      "geo.position": `${business.geo.latitude};${business.geo.longitude}`,
      ICBM: `${business.geo.latitude}, ${business.geo.longitude}`,
    },
  };
}

export function jsonLdScript(data: Record<string, unknown> | Record<string, unknown>[]) {
  return {
    __html: JSON.stringify(data).replace(/</g, "\\u003c"),
  };
}

export function businessJsonLd(description?: string) {
  return {
    "@type": "AutoRental",
    "@id": `${SITE_URL}/#business`,
    name: business.name,
    alternateName: business.alternateNames,
    url: SITE_URL,
    logo: `${SITE_URL}/images/brand/artemis-auto-rental.svg`,
    image: `${SITE_URL}/images/brand/hero-sifnos.jpg`,
    description:
      description ??
      "Car, scooter and motorcycle rentals in Sifnos with reliable service since 1988.",
    telephone: business.phones[0].e164,
    email: business.email,
    address: {
      "@type": "PostalAddress",
      ...business.address,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: business.geo.latitude,
      longitude: business.geo.longitude,
    },
    areaServed: [
      { "@type": "Place", name: "Sifnos" },
      { "@type": "AdministrativeArea", name: "Cyclades" },
    ],
    priceRange: business.priceRange,
    foundingDate: String(business.since),
  };
}

export function breadcrumbJsonLd(
  locale: Locale,
  items: { name: string; path: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(locale, item.path || "/"),
    })),
  };
}

export function itemListJsonLd({
  locale,
  name,
  path,
  items,
}: {
  locale: Locale;
  name: string;
  path: string;
  items: { name: string; url: string; image?: string }[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    url: absoluteUrl(locale, path),
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      url: item.url,
      ...(item.image ? { image: item.image } : {}),
    })),
  };
}

export function aboutPageJsonLd(locale: Locale, name?: string) {
  return {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: name ?? "About Artemis Rental",
    url: absoluteUrl(locale, "/about"),
    mainEntity: businessJsonLd(),
    inLanguage: bcp47(locale),
  };
}

export function blogIndexJsonLd(
  locale: Locale,
  posts: { title: string; slug: string }[],
  name?: string,
) {
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: name ?? "Artemis Rental Blog",
    url: absoluteUrl(locale, "/blog"),
    inLanguage: bcp47(locale),
    blogPost: posts.map((p) => ({
      "@type": "BlogPosting",
      headline: p.title,
      url: absoluteUrl(locale, `/blog/${p.slug}`),
    })),
  };
}

export function allInLanguages(): string[] {
  return routing.locales.map((locale) => bcp47(locale));
}
