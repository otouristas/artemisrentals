import fleet from "../../content/data/fleet.json";
import rates from "../../content/data/rates.json";

export type Vehicle = (typeof fleet.cars)[number] | (typeof fleet.scooters)[number];
export type PeriodId = "low" | "shoulder" | "mid" | "peak";
export type RateValue = number | null;
export type RateRow = Record<PeriodId, RateValue>;

const PERIOD_IDS: PeriodId[] = ["low", "shoulder", "mid", "peak"];

/** Scooter booking is open. Set to false to pause it (shows the notice, hides scooters from booking). */
export const SCOOTERS_BOOKING_ENABLED = true;

export function isScooterBookingEnabled() {
  return SCOOTERS_BOOKING_ENABLED;
}

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
  const live = getLiveRates(rateKey);
  if (live) return Math.min(...live.map((r) => r.rate));
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

/**
 * Live price periods from the CRM, keyed by vehicle slug (slug === rateKey).
 * Set on the server by ensureLivePricing() and on the client by LivePricingBridge.
 * When a vehicle has live periods they replace the static season table for it.
 */
export type LiveRate = {
  slug: string;
  label: string | null;
  /** Inclusive, yyyy-MM-dd. */
  start: string;
  end: string;
  rate: number;
  minDays: number;
};

let liveRates: Map<string, LiveRate[]> | null = null;

export function setLiveRates(rows: LiveRate[] | null) {
  if (!rows || rows.length === 0) {
    liveRates = null;
    return;
  }
  const map = new Map<string, LiveRate[]>();
  for (const row of rows) map.set(row.slug, [...(map.get(row.slug) ?? []), row]);
  liveRates = map;
}

export function getLiveRates(rateKey: string | null | undefined): LiveRate[] | null {
  if (!rateKey || !liveRates) return null;
  return liveRates.get(rateKey) ?? null;
}

function dayKey(date: Date) {
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${m}-${d}`;
}

export function estimateRateForDate(
  rateKey: string | null | undefined,
  date: Date,
): number | null {
  const live = getLiveRates(rateKey);
  if (live) {
    const day = dayKey(date);
    return live.find((r) => r.start <= day && day <= r.end)?.rate ?? null;
  }
  const row = getRateRow(rateKey);
  if (!row) return null;
  const value = row[seasonForDate(date)];
  return typeof value === "number" ? value : null;
}

/**
 * Rental days between pick-up and return, counted per night like the CRM:
 * 10 Jun → 14 Jun is 4 days. Same-day pick-up and return counts as 1.
 */
export function rentalDays(from: Date, to: Date) {
  const a = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate());
  const b = Date.UTC(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.max(1, Math.round((b - a) / 86400000));
}

/** Estimated total for a rental, or null when any charged day has no price. */
export function estimateTotal(rateKey: string | null | undefined, from: Date, to: Date): number | null {
  if (!rateKey || to < from) return null;
  const days = rentalDays(from, to);
  let total = 0;
  const cursor = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  for (let i = 0; i < days; i++) {
    const rate = estimateRateForDate(rateKey, cursor);
    if (rate == null) return null;
    total += rate;
    cursor.setDate(cursor.getDate() + 1);
  }
  return total;
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
