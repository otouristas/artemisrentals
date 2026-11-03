"use client";

import { useEffect, useState } from "react";

export type VehicleAvailability = { total: number; free: Record<string, number> };
type Result = { key: string; live: boolean; vehicles: Record<string, VehicleAvailability> };

/**
 * Live free-unit counts per model and day from /api/availability.
 * `live: false` means the CRM was unreachable or the answer is still loading:
 * callers should not block any dates then.
 */
export function useAvailability(from: string | null, to: string | null, slug?: string | null) {
  const key = from && to ? `${from}|${to}|${slug ?? ""}` : "";
  const [result, setResult] = useState<Result | null>(null);

  useEffect(() => {
    if (!from || !to) return;
    const controller = new AbortController();
    const params = new URLSearchParams({ from, to });
    if (slug) params.set("slug", slug);
    const requestKey = `${from}|${to}|${slug ?? ""}`;
    fetch(`/api/availability?${params}`, { signal: controller.signal, cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { live: boolean; vehicles: Record<string, VehicleAvailability> } | null) => {
        setResult({ key: requestKey, live: Boolean(data?.live), vehicles: data?.vehicles ?? {} });
      })
      .catch((error: unknown) => {
        if ((error as { name?: string }).name !== "AbortError") {
          setResult({ key: requestKey, live: false, vehicles: {} });
        }
      });
    return () => controller.abort();
  }, [from, to, slug]);

  const current = result && result.key === key ? result : null;
  return {
    live: current?.live ?? false,
    loading: Boolean(key) && !current,
    vehicles: current?.vehicles ?? {},
  };
}

/** Fewest free units on any day of the rental (inclusive of the return day). */
export function minFreeUnits(availability: VehicleAvailability | undefined, from: string, to: string) {
  if (!availability) return null;
  let min: number | null = null;
  for (const [day, free] of Object.entries(availability.free)) {
    if (day < from || day > to) continue;
    min = min === null ? free : Math.min(min, free);
  }
  return min;
}

/** Days with no free unit, as Date objects for a DayPicker `disabled` matcher. */
export function soldOutDays(availability: VehicleAvailability | undefined) {
  if (!availability) return [];
  return Object.entries(availability.free)
    .filter(([, free]) => free <= 0)
    .map(([day]) => new Date(`${day}T00:00:00`));
}
