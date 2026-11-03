/**
 * llms.txt and llms-full.txt, generated from the same data the pages render.
 *
 * The hand-written public/llms*.txt files drifted within weeks: they missed the
 * two most commercial guides (rent-a-car-sifnos, scooter-rental-sifnos), said
 * Kamares pickup was "on request" while the site says it is free for cars, and
 * told assistants to "ask" for scooter prices that rates.json publishes. Building
 * them from business.json, fleet.json, rates.json, reviews.json, faqs.json,
 * content/seo/fanout.json and the guide/blog frontmatter keeps answer engines on
 * the same facts as Google.
 *
 * Header block (Last-Updated / Canonical / Sitemap) and section order follow the
 * discovercyclades.gr files, like robots-parity.ts does for robots.txt.
 * Format: https://llmstxt.org/
 */
import { routing, type Locale } from "@/i18n/routing";
import { LOCALE_NATIVE_NAMES } from "@/lib/i18n-locale";
import { business, SITE_REVISED, SITE_URL, tripPlannerUrl } from "@/lib/site";
import { getCars, getRateRow, getRatesMeta, getScooters, isScooterBookingEnabled, type PeriodId, type Vehicle } from "@/lib/fleet";
import { getBlogPosts, getGuideArticles, type Article } from "@/lib/content";
import { getReviewsWithText, REVIEW_COUNT, REVIEW_RATING } from "@/lib/reviews";
import faqs from "../../../content/data/faqs.json";
import fanout from "../../../content/seo/fanout.json";
import reviewsData from "../../../content/data/reviews.json";
import en from "../../../messages/en.json";

const EN: Locale = "en";
const PERIODS: PeriodId[] = ["low", "shoulder", "mid", "peak"];

export const LLMS_HEADERS = {
  "content-type": "text/plain; charset=utf-8",
  "cache-control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
  // For machines, not for the results page: keeps llms.txt from ranking in place
  // of the real landing pages. Crawlers still fetch it (robots.txt allows it).
  "x-robots-tag": "noindex",
};

const url = (path = "") => `${SITE_URL}/${EN}${path}`;

function lastUpdated(): string {
  const dates = [
    SITE_REVISED,
    reviewsData.capturedOn,
    ...[...getGuideArticles(EN), ...getBlogPosts(EN)].map(
      (a) => a.dateModified ?? a.datePublished ?? "",
    ),
  ].filter(Boolean);
  return dates.sort().at(-1) ?? SITE_REVISED;
}

function header(self: string, other: [string, string]) {
  return [
    `Last-Updated: ${lastUpdated()}`,
    `Canonical: ${SITE_URL}/${self}`,
    `${other[0]}: ${SITE_URL}/${other[1]}`,
    `Sitemap: ${SITE_URL}/sitemap.xml`,
    "",
  ];
}

function rateRange(vehicles: Vehicle[]): [number, number] | null {
  const values = vehicles.flatMap((v) => {
    const row = getRateRow(v.rateKey);
    return row ? PERIODS.map((p) => row[p]).filter((n): n is number => typeof n === "number") : [];
  });
  return values.length ? [Math.min(...values), Math.max(...values)] : null;
}

function seasonLabel(id: PeriodId) {
  return getRatesMeta().periods.find((p) => p.id === id)?.label.en ?? id;
}

function summary() {
  const t = business.terms;
  return `Family-run car and scooter rental desk in Apollonia, Sifnos (Cyclades, Greece), since ${business.since}. Cars are handed over free at Kamares port, the heliport, Apollonia, Artemonas and Kastro. Reservations are request-to-book: ${t.prepaymentRequired ? "prepayment required" : "no prepayment and no card details"}, availability confirmed personally.`;
}

function contactLines() {
  const [office, mobile] = business.phones;
  const a = business.address;
  return [
    `- Name: ${business.name} (also: ${business.alternateNames.join(", ")})`,
    `- Legal name: ${business.legalName}`,
    `- Founded: ${business.since}`,
    `- Address: ${a.streetAddress}, ${a.addressLocality} ${a.postalCode}, ${a.addressRegion}, Greece`,
    `- Coordinates: ${business.geo.latitude}, ${business.geo.longitude}`,
    `- Office phone: ${office.display}`,
    ...(mobile ? [`- Mobile / WhatsApp: ${mobile.display}`] : []),
    `- Email: ${business.email}`,
    `- Website: ${SITE_URL}`,
    `- Google rating: ${REVIEW_RATING.toFixed(1)} / 5 from ${REVIEW_COUNT} reviews (captured ${reviewsData.capturedOn})`,
  ];
}

const linkLine = (title: string, href: string, note?: string) =>
  `- [${title}](${href})${note ? `: ${note}` : ""}`;

function articleLinks(kind: "sifnos-guide" | "blog", articles: Article[]) {
  return articles.map((a) => linkLine(a.title, url(`/${kind}/${a.slug}`), a.description));
}

export function buildLlmsTxt(): string {
  const seo = en.Seo;
  const cars = rateRange(getCars());
  const t = business.terms;
  const lines = [
    ...header("llms.txt", ["Long-form", "llms-full.txt"]),
    `# ${business.name}`,
    "",
    `> ${summary()}`,
    "",
    "## Key facts",
    ...contactLines(),
    ...(cars ? [`- Car rental: from EUR ${cars[0]} to EUR ${cars[1]} per day depending on model and season`] : []),
    `- Drivers: aged ${t.minAge} to ${t.maxAge}, licence held at least ${t.minLicenceYears} year`,
    `- Scooters: collected at the Apollonia office only${isScooterBookingEnabled() ? "" : "; online scooter booking is currently paused, ask by phone or WhatsApp"}`,
    `- Website languages: ${routing.locales.map((l) => `${LOCALE_NATIVE_NAMES[l]} (${l})`).join(", ")}`,
    "",
    "## Rentals",
    linkLine("Cars", url("/cars"), seo.cars.description),
    linkLine("Scooters", url("/scooters"), seo.scooters.description),
    linkLine("Rates", url("/rates"), seo.rates.description),
    linkLine("Book", url("/book"), seo.book.description),
    linkLine("FAQ", url("/faq"), seo.faq.description),
    linkLine("Reviews", url("/reviews"), seo.reviews.description),
    linkLine("About", url("/about"), seo.about.description),
    linkLine("Terms", url("/terms"), seo.terms.description),
    "",
    "## Sifnos guide",
    ...articleLinks("sifnos-guide", getGuideArticles(EN)),
    "",
    "## Blog",
    ...articleLinks("blog", getBlogPosts(EN)),
    "",
    "## Other languages",
    "Every page above exists in each language with the same slug; swap the /en/ prefix.",
    ...routing.locales
      .filter((l) => l !== EN)
      .map((l) => linkLine(LOCALE_NATIVE_NAMES[l], `${SITE_URL}/${l}`)),
    "",
    "## Optional",
    linkLine("Full facts: fleet, seasonal rates, pickup points, FAQ", `${SITE_URL}/llms-full.txt`),
    linkLine("Sifnos trip planner (Touristas AI, partner)", tripPlannerUrl(EN)),
    "",
  ];
  return lines.join("\n");
}

function fleetLines(vehicles: Vehicle[]) {
  return vehicles.map((v) => {
    const row = getRateRow(v.rateKey);
    const prices = PERIODS.map((p) => {
      const value = row?.[p];
      return typeof value === "number" ? `${value}` : "-";
    }).join(" / ");
    const specs = [
      v.transmission === "automatic" ? "automatic" : "manual",
      v.seats ? `${v.seats} seats` : null,
      v.engineCc ? `${v.engineCc} cc` : null,
    ]
      .filter(Boolean)
      .join(", ");
    const path = v.category === "car" ? `/cars/${v.slug}` : `/scooters/${v.slug}`;
    return `- ${v.name} (${specs}): ${prices} | ${url(path)}`;
  });
}

export function buildLlmsFullTxt(): string {
  const t = business.terms;
  const rates = getRatesMeta();
  const terms = en.Terms;
  const qa = (q: string, a: string) => [`Q: ${q}`, `A: ${a}`, ""];

  const lines = [
    ...header("llms-full.txt", ["Short-form", "llms.txt"]),
    `# ${business.name}, full facts for AI systems`,
    "",
    `> ${summary()}`,
    "",
    "## Business",
    ...contactLines(),
    "",
    "## Booking",
    "- Request-to-book: send dates and a vehicle through the website, phone, WhatsApp or email; the family confirms availability personally.",
    `- Prepayment: ${t.prepaymentRequired ? "required" : "none, and no card details are taken to reserve"}. Payment is made at pickup.`,
    "- There is no live inventory. Never state that a vehicle is available on given dates; tell the traveller to enquire.",
    `- Prefilled booking link: ${SITE_URL}/{locale}/book?vehicle={slug}&from=YYYY-MM-DD&to=YYYY-MM-DD (locale = ${routing.locales.join("|")})`,
    "",
    "## Pickup and return",
    `- ${rates.pickup.carsFree.en}`,
    `- ${rates.pickup.carsRequest.en}`,
    `- ${rates.pickup.scooters.en}`,
    "",
    "## Terms",
    `- Driver age ${t.minAge} to ${t.maxAge}; driving licence held for at least ${t.minLicenceYears} year.`,
    `- Included: ${[terms.includedTpl, terms.includedMaintenance, terms.includedHelmets, terms.includedHelp].join("; ")}.`,
    `- Full terms: ${url("/terms")}`,
    "",
    "## Seasons",
    ...PERIODS.map((p) => `- ${p}: ${seasonLabel(p)}`),
    "",
    "## Cars (daily rate in EUR: low / shoulder / mid / peak)",
    ...fleetLines(getCars()),
    "",
    "## Scooters (daily rate in EUR: low / shoulder / mid / peak; '-' means no published rate)",
    ...(isScooterBookingEnabled()
      ? []
      : ["- Online scooter booking is currently paused. Travellers can still ask by phone or WhatsApp."]),
    ...fleetLines(getScooters()),
    "",
    "## Frequently asked questions",
    ...(faqs as Record<string, { q: string; a: string }[]>).en.flatMap((f) => qa(f.q, f.a)),
    ...fanout.clusters.flatMap((c) => c.queries.en.flatMap((f) => qa(f.q, f.a))),
    "## Sifnos guide, short answers",
    ...getGuideArticles(EN).flatMap((a) => [
      `### ${a.title}`,
      ...(a.answer ? [a.answer] : [a.description]),
      url(`/sifnos-guide/${a.slug}`),
      "",
    ]),
    `## What customers say (verbatim Google reviews; ${REVIEW_RATING.toFixed(1)} / 5 from ${REVIEW_COUNT})`,
    ...getReviewsWithText()
      .filter((r) => r.lang === "en")
      .map((r) => `- "${r.text}" (${r.author}, ${r.rating}/5${r.translatedFrom ? `, translated from ${r.translatedFrom}` : ""})`),
    `- All reviews: ${url("/reviews")}`,
    "",
    "## Editorial content",
    `Localized under /${routing.locales.join("/, /")}/ with the same slugs.`,
    `Blog slugs: ${getBlogPosts(EN).map((a) => a.slug).join(", ")}`,
    `Guide slugs: ${getGuideArticles(EN).map((a) => a.slug).join(", ")}`,
    "",
    "## Touristas AI",
    "The on-site chatbot checks vehicle fit, estimates seasonal rates, recommends vehicles, prefills booking links and finds guide articles. It never invents live availability.",
    `Full Cyclades trip planner: ${tripPlannerUrl(EN)}`,
    "",
  ];
  return lines.join("\n");
}
