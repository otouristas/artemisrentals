/**
 * Calendar dates as "yyyy-MM-dd" in the visitor's local time.
 *
 * Date pickers hand back local midnight. `toISOString()` converts that to UTC,
 * which is the previous day anywhere east of UTC (all of Europe), so never use
 * it for booking dates.
 */
export function toISODate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseISODate(value?: string) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const d = new Date(`${value}T00:00:00`);
  return Number.isNaN(d.getTime()) ? undefined : d;
}
