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
  fromPrice,
}: {
  vehicleSlug: string;
  rateKey: string | null;
  fromPrice?: number | null;
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
    <div className="bg-foam">
      {fromPrice != null ? (
        <p className="font-display text-3xl tracking-tight text-aegean">
          {t("fromDay", { price: fromPrice })}
        </p>
      ) : (
        <p className="font-display text-2xl text-aegean">{t("contactForPrice")}</p>
      )}

      <h2 className="mt-6 font-display text-xl text-aegean">{t("selectDates")}</h2>
      <p className="mt-1 text-sm leading-relaxed text-aegean/60">{t("calendarHint")}</p>

      <div className="fleet-daypicker mt-5">
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
        <div className="mt-5 border-t border-aegean/10 pt-4">
          <p className="text-sm text-aegean/60">{t("nights", { count: dayCount })}</p>
          {indicativeTotal != null && (
            <p className="mt-1 font-display text-2xl text-aegean">~€{indicativeTotal}</p>
          )}
        </div>
      )}

      <Link href={href} className="btn-primary mt-5 w-full justify-center">
        {range?.from && range?.to ? t("requestDates") : t("bookThis")}
      </Link>

      <p className="mt-3 text-xs leading-relaxed text-aegean/50">{t("termsNoPrepay")}</p>
    </div>
  );
}
