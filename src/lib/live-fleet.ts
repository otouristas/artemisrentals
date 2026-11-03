import "server-only";
import { setLiveRates, type LiveRate } from "@/lib/fleet";

/**
 * Live prices and availability from the CRM database (Supabase RPCs
 * site_vehicle_pricing / site_vehicle_availability). Both return public data only:
 * price periods and free-unit counts, never bookings or customers.
 *
 * Every function soft-fails to null so the site falls back to content/data/rates.json.
 */

const PRICING_REVALIDATE_SECONDS = 300;

function supabaseEnv() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return url && key ? { url, key } : null;
}

async function rpc<T>(name: string, body: Record<string, unknown>, init: RequestInit & { next?: { revalidate?: number; tags?: string[] } }) {
  const env = supabaseEnv();
  if (!env) return null;
  try {
    const res = await fetch(`${env.url}/rest/v1/rpc/${name}`, {
      method: "POST",
      headers: {
        apikey: env.key,
        Authorization: `Bearer ${env.key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      ...init,
    });
    if (!res.ok) {
      console.warn(`[live-fleet] ${name} failed`, res.status);
      return null;
    }
    return (await res.json()) as T;
  } catch (error) {
    console.warn(`[live-fleet] ${name} error`, error);
    return null;
  }
}

type PricingRow = {
  slug: string;
  label: string | null;
  start_date: string;
  end_date: string;
  daily_rate: number | string;
  min_days: number;
};

export async function getLivePricing(): Promise<LiveRate[] | null> {
  const rows = await rpc<PricingRow[]>("site_vehicle_pricing", {}, {
    next: { revalidate: PRICING_REVALIDATE_SECONDS, tags: ["pricing"] },
  });
  if (!rows || rows.length === 0) return null;
  return rows.map((r) => ({
    slug: r.slug,
    label: r.label,
    start: r.start_date,
    end: r.end_date,
    rate: Number(r.daily_rate),
    minDays: r.min_days,
  }));
}

/** Load live prices into the shared fleet helpers. Call at the top of pages that show prices. */
export async function ensureLivePricing() {
  const rows = await getLivePricing();
  setLiveRates(rows);
  return rows;
}

type AvailabilityRow = { slug: string; day: string; units_total: number; units_free: number };

export type AvailabilityMap = Record<string, { total: number; free: Record<string, number> }>;

/** Free units per model per day. Never cached: this is what guests book against. */
export async function getLiveAvailability(from: string, to: string): Promise<AvailabilityMap | null> {
  const rows = await rpc<AvailabilityRow[]>(
    "site_vehicle_availability",
    { p_from: from, p_to: to },
    { cache: "no-store" },
  );
  if (!rows) return null;
  const map: AvailabilityMap = {};
  for (const row of rows) {
    const entry = (map[row.slug] ??= { total: row.units_total, free: {} });
    entry.free[row.day] = row.units_free;
  }
  return map;
}
