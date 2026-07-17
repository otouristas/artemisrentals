import fleet from "../../content/data/fleet.json";
import rates from "../../content/data/rates.json";

export type Vehicle = (typeof fleet.cars)[number] | (typeof fleet.scooters)[number];
export type PeriodId = "low" | "shoulder" | "mid" | "peak";

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

export function getLowestRate(rateKey: string | null): number | null {
  if (!rateKey) return null;
  const row = rates.cars[rateKey as keyof typeof rates.cars];
  if (!row) return null;
  return Math.min(row.low, row.shoulder, row.mid, row.peak);
}

export function getRateRow(rateKey: string | null) {
  if (!rateKey) return null;
  return rates.cars[rateKey as keyof typeof rates.cars] ?? null;
}

export function getRatesMeta() {
  return rates;
}

export function estimateRateForDate(rateKey: string | null, date: Date): number | null {
  const row = getRateRow(rateKey);
  if (!row) return null;
  const period = seasonForDate(date);
  return row[period];
}

export function seasonForDate(date: Date): PeriodId {
  const m = date.getUTCMonth() + 1;
  const d = date.getUTCDate();
  const md = m * 100 + d;

  // Peak: 11 Jul – 10 Sep
  if (md >= 711 && md <= 910) return "peak";
  // Mid: 11 Jun – 10 Jul
  if (md >= 611 && md <= 710) return "mid";
  // Shoulder: 11 May – 10 Jun, 11–30 Sep
  if ((md >= 511 && md <= 610) || (md >= 911 && md <= 930)) return "shoulder";
  // Low: 1 Jan – 10 May, 1–31 Oct (and rest of year treated as low)
  return "low";
}
