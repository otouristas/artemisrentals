import fleet from "../../content/data/fleet.json";
import rates from "../../content/data/rates.json";

export type Vehicle = (typeof fleet.cars)[number] | (typeof fleet.scooters)[number];
export type PeriodId = "low" | "shoulder" | "mid" | "peak";
export type RateValue = number | null;
export type RateRow = Record<PeriodId, RateValue>;

const PERIOD_IDS: PeriodId[] = ["low", "shoulder", "mid", "peak"];

export function getCars() {
  return fleet.cars;
}

export function getScooters() {
  return fleet.scooters;
}

export function getAllVehicles(): Vehicle[] {
  return [...fleet.cars, ...fleet.scooters];
}

export function getVehicleBySlug(slug: string): Vehicle | undefined {
  return getAllVehicles().find((v) => v.slug === slug);
}

export function getRatesMeta() {
  return rates;
}

export function getRateRow(rateKey: string | null | undefined): RateRow | null {
  if (!rateKey) return null;
  const row = rates.vehicles[rateKey as keyof typeof rates.vehicles];
  return row ? (row as RateRow) : null;
}

/** Lowest published daily rate across seasons (ignores null / closed seasons). */
export function getLowestRate(rateKey: string | null | undefined): number | null {
  const row = getRateRow(rateKey);
  if (!row) return null;
  const values = PERIOD_IDS.map((p) => row[p]).filter((n): n is number => typeof n === "number");
  if (values.length === 0) return null;
  return Math.min(...values);
}

export function seasonForDate(date: Date): PeriodId {
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const md = m * 100 + d;

  // Peak: 11 Jul – 10 Sep
  if (md >= 711 && md <= 910) return "peak";
  // Mid: 11 Jun – 10 Jul
  if (md >= 611 && md <= 710) return "mid";
  // Shoulder: 11 May – 10 Jun, 11–30 Sep
  if ((md >= 511 && md <= 610) || (md >= 911 && md <= 930)) return "shoulder";
  // Low: 1 Jan – 10 May, 1–31 Oct (Nov–Dec treated as low)
  return "low";
}

export function getCurrentSeason(date: Date = new Date()): PeriodId {
  return seasonForDate(date);
}

export function estimateRateForDate(
  rateKey: string | null | undefined,
  date: Date,
): number | null {
  const row = getRateRow(rateKey);
  if (!row) return null;
  const value = row[seasonForDate(date)];
  return typeof value === "number" ? value : null;
}

/** Today's / current-season daily rate for display. */
export function getCurrentSeasonRate(
  rateKey: string | null | undefined,
  date: Date = new Date(),
): { period: PeriodId; price: number | null } {
  const period = getCurrentSeason(date);
  return { period, price: estimateRateForDate(rateKey, date) };
}

export function formatRateCell(value: RateValue): string {
  return typeof value === "number" ? `€${value}` : "-";
}

export function getPeriodLabel(period: PeriodId, locale: string): string {
  const entry = rates.periods.find((p) => p.id === period);
  if (!entry) return period;
  return localizeField(entry.label as { en: string }, locale);
}

export function getRelatedVehicles(slug: string, limit = 3): Vehicle[] {
  const current = getVehicleBySlug(slug);
  if (!current) return [];
  const sameCategory = getAllVehicles().filter(
    (v) => v.slug !== slug && v.category === current.category,
  );
  const related = (current as { relatedSlugs?: string[] }).relatedSlugs;
  if (Array.isArray(related) && related.length > 0) {
    const preferred = related
      .map((s) => getVehicleBySlug(s))
      .filter((v): v is Vehicle => Boolean(v));
    const rest = sameCategory.filter((v) => !preferred.some((p) => p.slug === v.slug));
    return [...preferred, ...rest].slice(0, limit);
  }
  return sameCategory.slice(0, limit);
}

export function localizeField(
  field: Partial<Record<string, string>> | string | undefined,
  locale: string,
): string {
  if (!field) return "";
  if (typeof field === "string") return field;
  if (field[locale]) return field[locale] as string;
  return field.en ?? Object.values(field).find((v) => typeof v === "string") ?? "";
}
