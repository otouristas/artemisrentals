import {
  getAllVehicles,
  getLowestRate,
  getRatesMeta,
  estimateRateForDate,
  seasonForDate,
  localizeField,
  type Vehicle,
} from "./fleet";
import { business, whatsappUrl } from "./site";
import { getGuideArticles, getBlogPosts } from "./content";
import faqsData from "../../content/data/faqs.json";
import type { Locale } from "@/i18n/routing";
import { asLocale, bcp47 } from "@/lib/i18n-locale";
import { buildWhatsAppEnquiryText } from "./whatsapp-enquiry";

export { buildWhatsAppEnquiryText } from "./whatsapp-enquiry";

const SEASON_LABEL: Record<string, Partial<Record<Locale, string>> & { en: string }> = {
  low: {
    en: "low season",
    el: "χαμηλή περίοδος",
    it: "bassa stagione",
    fr: "basse saison",
    de: "Nebensaison",
    sv: "lågsäsong",
    nl: "laagseizoen",
  },
  shoulder: {
    en: "shoulder season",
    el: "ενδιάμεση περίοδος",
    it: "mezza stagione",
    fr: "mi-saison",
    de: "Zwischensaison",
    sv: "mellansäsong",
    nl: "tussenseizoen",
  },
  mid: {
    en: "mid season",
    el: "μεσαία περίοδος",
    it: "media stagione",
    fr: "moyenne saison",
    de: "Mittelsaison",
    sv: "midsäsong",
    nl: "middenseizoen",
  },
  peak: {
    en: "peak season",
    el: "υψηλή περίοδος",
    it: "alta stagione",
    fr: "haute saison",
    de: "Hochsaison",
    sv: "högsäsong",
    nl: "hoogseizoen",
  },
};

const LANGUAGE_NAME: Record<Locale, string> = {
  en: "English",
  el: "Greek",
  it: "Italian",
  fr: "French",
  de: "German",
  sv: "Swedish",
  nl: "Dutch",
};

export type ChatVehicleCard = {
  slug: string;
  name: string;
  category: string;
  seats: number;
  transmission: string;
  engineCc?: number;
  image: string;
  path: string;
  fromPrice: number | null;
  bookUrl: string;
  whatsappUrl: string;
};

function vehiclePath(v: Vehicle) {
  return v.category === "car" ? `/cars/${v.slug}` : `/scooters/${v.slug}`;
}

function bookDeepLink(
  locale: Locale,
  vehicleSlug?: string,
  from?: string,
  to?: string,
) {
  const params = new URLSearchParams();
  if (vehicleSlug) params.set("vehicle", vehicleSlug);
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  const qs = params.toString();
  return `/${locale}/book${qs ? `?${qs}` : ""}`;
}

function vehicleCard(
  v: Vehicle,
  locale: Locale,
  opts?: { from?: string; to?: string; partySize?: number },
): ChatVehicleCard {
  return {
    slug: v.slug,
    name: v.name,
    category: v.category,
    seats: v.seats,
    transmission: v.transmission,
    engineCc: (v as { engineCc?: number }).engineCc,
    image: v.image,
    path: vehiclePath(v),
    fromPrice: getLowestRate(v.rateKey),
    bookUrl: bookDeepLink(locale, v.slug, opts?.from, opts?.to),
    whatsappUrl: whatsappUrl(
      buildWhatsAppEnquiryText({
        locale,
        vehicleName: v.name,
        from: opts?.from,
        to: opts?.to,
        partySize: opts?.partySize,
      }),
    ),
  };
}

export function buildArtemisSystemPrompt(locale: string = "en", now: Date = new Date()) {
  const loc = asLocale(locale);
  const season = seasonForDate(now);
  const seasonLabel = localizeField(SEASON_LABEL[season], loc);
  const todayIso = now.toISOString().slice(0, 10);

  const vehicles = getAllVehicles()
    .map(
      (v) =>
        `- ${v.name} (${v.category}, ${v.transmission}, ${v.seats} seats${v.engineCc ? `, ${v.engineCc}cc` : ""}, slug:${v.slug}, image:${v.image})`,
    )
    .join("\n");

  const rates = getRatesMeta();
  const rateLines = Object.entries(rates.vehicles)
    .map(([key, row]) => {
      const fmt = (n: number | null) => (typeof n === "number" ? `€${n}` : "n/a");
      return `- ${key}: low ${fmt(row.low)}, shoulder ${fmt(row.shoulder)}, mid ${fmt(row.mid)}, peak ${fmt(row.peak)}`;
    })
    .join("\n");

  const guide = getGuideArticles(loc)
    .map((g) => `### ${g.title}\n${g.answer ?? g.description}`)
    .join("\n\n");

  const blogTitles = getBlogPosts(loc)
    .map((b) => `- ${b.title} (slug:${b.slug})`)
    .join("\n");

  const faqs = (faqsData as Record<string, { q: string; a: string }[]>)[loc] ?? faqsData.en;

  return `You are Touristas AI embedded on Artemis Rental (rentacarsifnos.com), a family car & scooter rental desk in Apollonia, Sifnos since ${business.since}.

Today is ${todayIso}, currently ${seasonLabel} on Sifnos.

CRITICAL: local data only:
- Recommend ONLY vehicles listed in Fleet below. Never invent models, prices, or availability.
- Always call recommendVehicle (or checkVehicleFit) before suggesting specific cars/scooters so the UI can show real fleet cards.
- When the guest mentions dates, pass ISO from/to into recommendVehicle, prefillBooking, and whatsappEnquiry.
- After recommending vehicles, briefly explain why they fit. The cards already show photo, price, Book, and WhatsApp.
- Never invent live availability or guarantee a booking.
- Scooter rates are published for mid/peak only (Jun–Sep); low/shoulder show as unavailable (-). Use estimateSeasonRate for date-specific prices.

Booking handoff:
- Prefer prefillBooking + whatsappEnquiry with the chosen vehicle slug and dates (same details as the booking form).
- Phone ${business.phones[0].display}, WhatsApp ${business.phones[1].display}, email ${business.email}.
- Pickup default: Apollonia. Cars: free Kamares/heliport/Artemonas/Kastro; Vathi/Platys Gialos/Faros/Chrysopigi/Cherronisos on request (fee confirmed at booking). Scooters: Apollonia office only.
- Terms: ages ${business.terms.minAge}-${business.terms.maxAge}, licence > ${business.terms.minLicenceYears} year, no prepayment required.

Stay on Artemis / Sifnos local content (fleet, rates, guide, FAQs). Do not send guests to external trip planners unless they explicitly ask for multi-island Cyclades planning outside Sifnos rentals.

Answer in the user's language (${LANGUAGE_NAME[loc]}, BCP-47 ${bcp47(loc)}), matching locale "${loc}".

Fleet (authoritative; only these exist):
${vehicles}

Indicative car daily rates (EUR):
${rateLines}

Season periods: ${rates.periods.map((p) => `${p.id}: ${localizeField(p.label, loc)}`).join(" | ")}

Sifnos guide answers:
${guide}

Blog articles available:
${blogTitles}

Common FAQs:
${faqs.map((f) => `Q: ${f.q}\nA: ${f.a}`).join("\n\n")}
`;
}

export function toolHelpers(locale: string = "en") {
  const loc = asLocale(locale);
  return {
    checkVehicleFit(slug: string, from?: string, to?: string, partySize?: number) {
      const v = getAllVehicles().find((x) => x.slug === slug);
      if (!v) return { found: false as const };
      return {
        found: true as const,
        ...vehicleCard(v, loc, { from, to, partySize }),
      };
    },
    estimateSeasonRate(rateKey: string, isoDate: string) {
      const date = new Date(`${isoDate}T12:00:00`);
      return {
        season: seasonForDate(date),
        dailyEur: estimateRateForDate(rateKey, date),
      };
    },
    recommendVehicle(
      partySize: number,
      transmission?: "manual" | "automatic",
      category?: string,
      from?: string,
      to?: string,
    ) {
      const candidates = getAllVehicles().filter((v) => v.seats >= partySize);
      const scored = candidates
        .map((v) => {
          let score = 0;
          if (transmission && v.transmission === transmission) score += 2;
          if (category && v.category === category) score += 2;
          score -= Math.max(0, v.seats - partySize) * 0.5;
          return { v, score };
        })
        .sort((a, b) => b.score - a.score);
      const pool = scored.length > 0 ? scored : getAllVehicles().map((v) => ({ v, score: 0 }));
      return {
        from: from ?? null,
        to: to ?? null,
        partySize,
        vehicles: pool.slice(0, 3).map(({ v }) =>
          vehicleCard(v, loc, { from, to, partySize }),
        ),
      };
    },
    prefillBooking(vehicleSlug?: string, from?: string, to?: string) {
      const vehicle = vehicleSlug
        ? getAllVehicles().find((x) => x.slug === vehicleSlug)
        : undefined;
      return {
        url: bookDeepLink(loc, vehicleSlug, from, to),
        whatsappUrl: whatsappUrl(
          buildWhatsAppEnquiryText({
            locale: loc,
            vehicleName: vehicle?.name,
            from,
            to,
          }),
        ),
        vehicle: vehicle ? vehicleCard(vehicle, loc, { from, to }) : null,
      };
    },
    whatsappEnquiry(vehicleSlug?: string, from?: string, to?: string, partySize?: number) {
      const vehicle = vehicleSlug
        ? getAllVehicles().find((x) => x.slug === vehicleSlug)
        : undefined;
      const text = buildWhatsAppEnquiryText({
        locale: loc,
        vehicleName: vehicle?.name,
        from,
        to,
        partySize,
      });
      return {
        url: whatsappUrl(text),
        text,
        vehicle: vehicle ? vehicleCard(vehicle, loc, { from, to, partySize }) : null,
      };
    },
    findGuideArticle(query: string, articleLocale?: string) {
      const articleLoc = asLocale(articleLocale ?? loc);
      const keywords = query
        .toLowerCase()
        .split(/[^a-z0-9\u0370-\u03ff]+/i)
        .filter((k) => k.length > 2);

      const matchScore = (haystack: string) => {
        const lower = haystack.toLowerCase();
        return keywords.reduce((sum, kw) => (lower.includes(kw) ? sum + 1 : sum), 0);
      };

      const guideMatches = getGuideArticles(articleLoc).map((a) => ({
        slug: a.slug,
        title: a.title,
        path: `/${articleLoc}/sifnos-guide/${a.slug}`,
        score: matchScore(`${a.title} ${a.description} ${a.answer ?? ""}`),
      }));
      const blogMatches = getBlogPosts(articleLoc).map((a) => ({
        slug: a.slug,
        title: a.title,
        path: `/${articleLoc}/blog/${a.slug}`,
        score: matchScore(`${a.title} ${a.description}`),
      }));

      const results = [...guideMatches, ...blogMatches]
        .filter((r) => r.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .map(({ slug, title, path }) => ({ slug, title, path }));

      return { results };
    },
  };
}
