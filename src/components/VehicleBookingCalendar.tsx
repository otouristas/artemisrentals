"use client";

import { useMemo, useState } from "react";
import { DayPicker, type DateRange } from "react-day-picker";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { estimateRateForDate } from "@/lib/fleet";
import "react-day-picker/style.css";

function daysBetween(from: Date, to: Date) {
  const a = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate());
  const b = Date.UTC(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.max(1, Math.round((b - a) / 86400000) + 1);
}

function toISODate(d: Date) {
  return d.toISOString().slice(0, 10);
}

export function VehicleBookingCalendar({
  vehicleSlug,
  rateKey,
}: {
  vehicleSlug: string;
  rateKey: string | null;
}) {
  const t = useTranslations("Fleet");
  const [range, setRange] = useState<DateRange | undefined>();
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const dayCount =
    range?.from && range?.to ? daysBetween(new Date(range.from), new Date(range.to)) : 0;

  const indicativeTotal = useMemo(() => {
    if (!rateKey || !range?.from || !range?.to) return null;
    let total = 0;
    const cursor = new Date(range.from);
    const end = new Date(range.to);
    cursor.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    while (cursor <= end) {
      const rate = estimateRateForDate(rateKey, new Date(cursor));
      if (rate == null) return null;
      total += rate;
      cursor.setDate(cursor.getDate() + 1);
    }
    return total;
  }, [rateKey, range]);

  const href =
    range?.from && range?.to
      ? `/book?vehicle=${encodeURIComponent(vehicleSlug)}&from=${toISODate(range.from)}&to=${toISODate(range.to)}`
      : `/book?vehicle=${encodeURIComponent(vehicleSlug)}`;

  return (
    <div className="rounded-2xl bg-foam/80 p-4 ring-1 ring-aegean/10 md:p-5">
      <h2 className="font-display text-2xl text-aegean">{t("selectDates")}</h2>
      <p className="mt-1 text-sm text-aegean/65">{t("calendarHint")}</p>
      <div className="touristas-daypicker mt-4 overflow-x-auto">
        <DayPicker
          mode="range"
          selected={range}
          onSelect={setRange}
          disabled={{ before: today }}
          numberOfMonths={1}
          className="rdp-root"
        />
      </div>
      {dayCount > 0 && (
        <p className="mt-3 text-sm font-medium text-aegean">
          {t("nights", { count: dayCount })}
          {indicativeTotal != null ? ` · ${t("indicativeTotal", { total: indicativeTotal })}` : null}
        </p>
      )}
      <Link
        href={href}
        className="mt-4 inline-flex rounded-full bg-aegean px-6 py-3 text-sm font-semibold text-foam transition hover:bg-aegean-deep"
      >
        {range?.from && range?.to ? t("requestDates") : t("bookThis")}
      </Link>
    </div>
  );
}
