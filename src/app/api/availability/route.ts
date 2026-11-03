import { NextResponse } from "next/server";
import { getLiveAvailability } from "@/lib/live-fleet";

export const dynamic = "force-dynamic";

const ISO = /^\d{4}-\d{2}-\d{2}$/;
const MAX_DAYS = 400;

/**
 * GET /api/availability?from=yyyy-MM-dd&to=yyyy-MM-dd[&slug=fiat-panda]
 * Free units per model per day, straight from the CRM. Counts only, no booking details.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from") ?? "";
  const to = searchParams.get("to") ?? "";
  const slug = searchParams.get("slug");

  if (!ISO.test(from) || !ISO.test(to) || to < from) {
    return NextResponse.json({ error: "invalid_range" }, { status: 400 });
  }
  const span = (Date.parse(to) - Date.parse(from)) / 86400000;
  if (span > MAX_DAYS) {
    return NextResponse.json({ error: "range_too_long" }, { status: 400 });
  }

  const map = await getLiveAvailability(from, to);
  if (!map) {
    // CRM unreachable or not configured: the site still takes enquiries, just without live counts.
    return NextResponse.json({ live: false, vehicles: {} }, { headers: { "Cache-Control": "no-store" } });
  }

  const vehicles = slug ? (map[slug] ? { [slug]: map[slug] } : {}) : map;
  return NextResponse.json({ live: true, vehicles }, { headers: { "Cache-Control": "no-store" } });
}
