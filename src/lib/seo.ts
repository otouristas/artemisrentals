import type { Metadata } from "next";
import { business, SITE_URL } from "./site";
import type { Locale } from "@/i18n/routing";

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
  const languages: Record<string, string> = {
    en: absoluteUrl("en", path),
    el: absoluteUrl("el", path),
    "x-default": absoluteUrl("en", path),
  };

  return {
    title,
    description,
    alternates: { canonical: url, languages },
    openGraph: {
      title,
      description,
      url,
      siteName: business.name,
      locale: locale === "el" ? "el_GR" : "en_US",
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

export function businessJsonLd() {
  return {
    "@type": "AutoRental",
    "@id": `${SITE_URL}/#business`,
    name: business.name,
    alternateName: business.alternateNames,
    url: SITE_URL,
    logo: `${SITE_URL}/images/brand/artemis-auto-rental.svg`,
    image: `${SITE_URL}/images/brand/hero-sifnos.jpg`,
    description:
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
