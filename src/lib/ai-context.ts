import { getAllVehicles, getRatesMeta, estimateRateForDate, seasonForDate } from "./fleet";
import { business } from "./site";
import { getGuideArticles } from "./content";
import faqs from "../../content/data/faqs.json";

export function buildArtemisSystemPrompt() {
  const vehicles = getAllVehicles()
    .map(
      (v) =>
        `- ${v.name} (${v.category}, ${v.transmission}, ${v.seats} seats${v.engineCc ? `, ${v.engineCc}cc` : ""}, slug:${v.slug})`,
    )
    .join("\n");

  const rates = getRatesMeta();
  const rateLines = Object.entries(rates.cars)
    .map(
      ([key, row]) =>
        `- ${key}: low €${row.low}, shoulder €${row.shoulder}, mid €${row.mid}, peak €${row.peak}`,
    )
    .join("\n");

  const guide = getGuideArticles("en")
    .map((g) => `### ${g.title}\n${g.answer ?? g.description}`)
    .join("\n\n");

  return `You are Touristas AI embedded on Artemis Rental (artemisrental.gr), a family car & scooter rental desk in Apollonia, Sifnos since ${business.since}.

Rules:
- Be concise, practical, and friendly.
- Never invent live availability or guarantee a booking.
- For booking confirmation, direct users to /book enquiry form, phone ${business.phones[0].display}, WhatsApp ${business.phones[1].display}, or email ${business.email}.
- Pickup default: Apollonia. Kamares pickup on request.
- Terms: ages ${business.terms.minAge}-${business.terms.maxAge}, licence > ${business.terms.minLicenceYears} year, no prepayment required.
- Scooter daily prices are not fully listed publicly — invite an enquiry.
- For multi-island Cyclades itineraries, suggest the Discover Cyclades Touristas AI trip planner.
- Answer in the user's language (English or Greek).

Fleet:
${vehicles}

Indicative car daily rates (EUR):
${rateLines}

Season periods: ${rates.periods.map((p) => `${p.id}: ${p.label.en}`).join(" | ")}

Sifnos guide answers:
${guide}

Common FAQs:
${faqs.en.map((f) => `Q: ${f.q}\nA: ${f.a}`).join("\n\n")}
`;
}

export function toolHelpers() {
  return {
    checkVehicleFit(slug: string) {
      const v = getAllVehicles().find((x) => x.slug === slug);
      if (!v) return { found: false as const };
      return {
        found: true as const,
        name: v.name,
        category: v.category,
        seats: v.seats,
        transmission: v.transmission,
        engineCc: v.engineCc,
      };
    },
    estimateSeasonRate(rateKey: string, isoDate: string) {
      const date = new Date(isoDate);
      return {
        season: seasonForDate(date),
        dailyEur: estimateRateForDate(rateKey, date),
      };
    },
  };
}
