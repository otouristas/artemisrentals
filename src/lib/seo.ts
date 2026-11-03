import type { Metadata } from "next";
import { business, SITE_URL } from "./site";
import type { Locale } from "@/i18n/routing";
import { routing } from "@/i18n/routing";
import { bcp47, hreflangLanguages, ogLocale } from "@/lib/i18n-locale";
import {
  getCars,
  getRateRow,
  getRatesMeta,
  getScooters,
  localizeField,
  type PeriodId,
  type Vehicle,
} from "@/lib/fleet";

export function localePath(locale: Locale, path = "") {
  const clean = path.startsWith("/") ? path : `/${path}`;
  if (clean === "/") return `/${locale}`;
  return `/${locale}${clean}`;
}

export function absoluteUrl(locale: Locale, path = "") {
  return `${SITE_URL}${localePath(locale, path)}`;
}

export function absoluteImageUrl(src: string) {
  if (src.startsWith("http://") || src.startsWith("https://")) return src;
  return `${SITE_URL}${src.startsWith("/") ? src : `/${src}`}`;
}

/**
 * Google truncates the title link by pixel width on mobile, and titles it leaves
 * alone run noticeably shorter than the ones it rewrites. Since Google also shows
 * the site name separately above the result, an unconditional " | Artemis Rental"
 * spends ~17 of a ~60 character budget on something often already on screen.
 *
 * So the brand is appended only when it fits:
 *   auto   - append when the total stays within TITLE_MAX (default)
 *   always - commercial and home pages, where the brand earns its place
 *   never  - the title already carries the brand
 */
export const BRAND_SUFFIX = " | Artemis Rental";
const TITLE_MAX = 60;

export function withBrand(title: string, mode: "auto" | "always" | "never" = "auto") {
  if (mode === "never") return title;
  if (title.includes("Artemis")) return title;
  if (mode === "always") return `${title}${BRAND_SUFFIX}`;
  return title.length + BRAND_SUFFIX.length <= TITLE_MAX
    ? `${title}${BRAND_SUFFIX}`
    : title;
}

export function buildMetadata({
  locale,
  title,
  description,
  path = "",
  image = "/images/brand/hero-sifnos.jpg",
  type = "website",
  brand = "auto",
}: {
  locale: Locale;
  title: string;
  description: string;
  path?: string;
  image?: string;
  type?: "website" | "article";
  brand?: "auto" | "always" | "never";
}): Metadata {
  const url = absoluteUrl(locale, path);
  title = withBrand(title, brand);
  const ogImage = absoluteImageUrl(image);
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

/**
 * Google Business Profile rating, emitted only when real values are present in
 * content/data/business.json. Never populate this with estimated numbers:
 * fabricated review data is a structured-data policy violation.
 */
function aggregateRatingJsonLd() {
  const rating = (
    business as { rating?: { value?: number | null; count?: number | null } }
  ).rating;
  if (!rating || typeof rating.value !== "number" || typeof rating.count !== "number") {
    return undefined;
  }
  if (rating.count < 1) return undefined;
  return {
    "@type": "AggregateRating",
    ratingValue: rating.value,
    reviewCount: rating.count,
    bestRating: 5,
    worstRating: 1,
  };
}

export const BUSINESS_ID = `${SITE_URL}/#business`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

/**
 * The one AutoRental entity. Every other node (WebSite, WebPage, Article, Offer)
 * points at it by @id instead of repeating it, so search and AI engines see a
 * single business with one name, address, phone set and founding year.
 *
 * Deliberately absent until real values exist: openingHours (seasonal, unknown),
 * sameAs (no confirmed GBP/social profile URLs yet) and knowsLanguage (site
 * languages are not the same as the languages spoken at the desk).
 */
export function businessJsonLd(description?: string) {
  const aggregateRating = aggregateRatingJsonLd();
  const [office, mobile] = business.phones;
  return {
    "@type": "AutoRental",
    "@id": BUSINESS_ID,
    name: business.name,
    legalName: business.legalName,
    alternateName: business.alternateNames,
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: `${SITE_URL}/images/brand/artemis-auto-rental.svg`,
    },
    image: `${SITE_URL}/images/brand/hero-sifnos.jpg`,
    description:
      description ??
      `Family-run car and scooter rental in Apollonia, Sifnos, since ${business.since}. Free car pickup at Kamares port, no prepayment to reserve.`,
    telephone: office.e164,
    email: business.email,
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "reservations",
        telephone: office.e164,
        email: business.email,
        areaServed: "GR",
      },
      ...(mobile
        ? [
            {
              "@type": "ContactPoint",
              contactType: "customer support",
              name: "Mobile and WhatsApp",
              telephone: mobile.e164,
              areaServed: "GR",
            },
          ]
        : []),
    ],
    address: {
      "@type": "PostalAddress",
      ...business.address,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: business.geo.latitude,
      longitude: business.geo.longitude,
    },
    hasMap: business.rating.url,
    areaServed: [
      { "@type": "Place", name: "Sifnos" },
      { "@type": "AdministrativeArea", name: "Cyclades" },
    ],
    priceRange: business.priceRange,
    currenciesAccepted: "EUR",
    foundingDate: String(business.since),
    ...(aggregateRating ? { aggregateRating } : {}),
  };
}

/** Site-wide graph rendered once in the locale layout. */
export function siteGraphJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      businessJsonLd(),
      {
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        url: SITE_URL,
        name: business.name,
        alternateName: business.alternateNames,
        inLanguage: allInLanguages(),
        publisher: { "@id": BUSINESS_ID },
        // No SearchAction: the site has no search endpoint, and Google retired the
        // sitelinks search box in 2024. A dead target only misleads agents.
      },
    ],
  };
}

/**
 * Article / BlogPosting for guide and blog entries. Publisher and author point at
 * the business node so the content is attributed to the same entity that rents
 * the cars, which is the E-E-A-T signal that matters for a local operator.
 */
export function articleJsonLd({
  locale,
  type,
  path,
  title,
  description,
  answer,
  datePublished,
  dateModified,
  image,
}: {
  locale: Locale;
  type: "Article" | "BlogPosting";
  path: string;
  title: string;
  description: string;
  answer?: string;
  datePublished?: string;
  dateModified?: string;
  image?: string;
}) {
  const url = absoluteUrl(locale, path);
  const businessRef = {
    "@type": "Organization",
    "@id": BUSINESS_ID,
    name: business.name,
    url: SITE_URL,
  };
  return {
    "@context": "https://schema.org",
    "@type": type,
    "@id": `${url}#article`,
    headline: title,
    description,
    ...(answer ? { abstract: answer } : {}),
    ...(datePublished ? { datePublished } : {}),
    dateModified: dateModified ?? datePublished,
    ...(image ? { image: absoluteImageUrl(image) } : {}),
    inLanguage: bcp47(locale),
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    isPartOf: { "@id": WEBSITE_ID },
    // Named inline as well as by @id: Google's Article docs want author.name and
    // publisher.name on the node itself, not only through a graph reference.
    author: businessRef,
    publisher: businessRef,
    about: { "@type": "Place", name: "Sifnos, Cyclades, Greece" },
  };
}

type SeasonPeriod = { id: PeriodId; label: Partial<Record<string, string>> & { en: string } };

/**
 * Daily rate card for /rates: one Offer per vehicle with a UnitPriceSpecification
 * per season, straight from content/data/rates.json (the same numbers the table
 * shows). Seasons without a published price are left out, never estimated.
 */
export function rentalCatalogJsonLd(locale: Locale, name: string) {
  const periods = getRatesMeta().periods as SeasonPeriod[];
  const offerFor = (vehicle: Vehicle) => {
    const row = getRateRow(vehicle.rateKey);
    if (!row) return null;
    const specs = periods
      .filter((p) => typeof row[p.id] === "number")
      .map((p) => ({
        "@type": "UnitPriceSpecification",
        name: localizeField(p.label, locale),
        price: row[p.id],
        priceCurrency: "EUR",
        unitCode: "DAY",
      }));
    if (specs.length === 0) return null;
    const path = vehicle.category === "car" ? `/cars/${vehicle.slug}` : `/scooters/${vehicle.slug}`;
    return {
      "@type": "Offer",
      url: absoluteUrl(locale, path),
      businessFunction: "http://purl.org/goodrelations/v1#LeaseOut",
      priceCurrency: "EUR",
      priceSpecification: specs,
      itemOffered: vehicleJsonLd(vehicle),
      seller: { "@id": BUSINESS_ID },
    };
  };
  const list = (vehicles: Vehicle[]) =>
    vehicles.map(offerFor).filter((o): o is NonNullable<typeof o> => o !== null);

  return {
    "@context": "https://schema.org",
    "@type": "OfferCatalog",
    "@id": `${absoluteUrl(locale, "/rates")}#catalog`,
    name,
    url: absoluteUrl(locale, "/rates"),
    provider: { "@id": BUSINESS_ID },
    itemListElement: [...list(getCars()), ...list(getScooters())],
  };
}

/** Car or Motorcycle node with the specs the fleet data actually holds. */
export function vehicleJsonLd(vehicle: Vehicle) {
  return {
    "@type": vehicle.category === "car" ? "Car" : "Motorcycle",
    name: vehicle.name,
    image: absoluteImageUrl(vehicle.image),
    vehicleTransmission: vehicle.transmission === "automatic" ? "Automatic" : "Manual",
    fuelType: "Petrol",
    ...(vehicle.seats ? { seatingCapacity: vehicle.seats } : {}),
    ...(vehicle.engineCc
      ? {
          vehicleEngine: {
            "@type": "EngineSpecification",
            engineDisplacement: {
              "@type": "QuantitativeValue",
              value: vehicle.engineCc,
              unitCode: "CMQ",
            },
          },
        }
      : {}),
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
    mainEntity: { "@id": BUSINESS_ID },
    isPartOf: { "@id": WEBSITE_ID },
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
