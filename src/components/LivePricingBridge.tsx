"use client";

import { setLiveRates, type LiveRate } from "@/lib/fleet";

/**
 * Hands the server's live CRM prices to the client copy of the fleet helpers.
 * Runs during render, before the price-showing components below it in the tree.
 */
export function LivePricingBridge({ rows }: { rows: LiveRate[] | null }) {
  setLiveRates(rows);
  return null;
}
