"use client";

import { useMemo, useState } from "react";
import { DayPicker, type DateRange } from "react-day-picker";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { estimateTotal, rentalDays } from "@/lib/fleet";
import { toISODate } from "@/lib/dates";
import { soldOutDays, useAvailability } from "@/lib/use-availability";
import "react-day-picker/style.css";

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
  const tBook = useTranslations("Book");
  const router = useRouter();
  const [range, setRange] = useState<DateRange | undefined>();
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const dayCount = range?.from && range?.to ? rentalDays(range.from, range.to) : 0;

  const indicativeTotal = useMemo(() => {
    if (!range?.from || !range?.to) return null;
    return estimateTotal(rateKey, range.from, range.to);
  }, [rateKey, range]);

  // Live availability for this model over the next year: fully booked days are disabled.
  const windowEnd = useMemo(() => {
    const d = new Date(today);
    d.setDate(d.getDate() + 365);
    return toISODate(d);
  }, [today]);
  const availability = useAvailability(toISODate(today), windowEnd, vehicleSlug);
  const blocked = useMemo(() => soldOutDays(availability.vehicles[vehicleSlug]), [availability.vehicles, vehicleSlug]);

  const href =
    range?.from && range?.to
      ? `/book?vehicle=${encodeURIComponent(vehicleSlug)}&from=${toISODate(range.from)}&to=${toISODate(range.to)}`
      : `/book?vehicle=${encodeURIComponent(vehicleSlug)}`;

  return (
    <div>
      {indicativeTotal != null ? (
        <p className="text-aegean">
          <span className="price-total text-3xl">~€{indicativeTotal}</span>
          <span className="ml-2 text-sm text-aegean/60">{t("nights", { count: dayCount })}</span>
        </p>
      ) : fromPrice != null ? (
        <p className="text-3xl font-bold tracking-tight text-aegean">
          €{fromPrice}
          <span className="ml-1 text-base font-medium text-aegean/55">{t("perDay")}</span>
        </p>
      ) : (
        <p className="text-2xl font-semibold text-aegean">{t("contactForPrice")}</p>
      )}

      <h2 className="mt-6 border-t border-line pt-5 text-lg font-semibold text-aegean">{t("selectDates")}</h2>
      <p className="mt-1 text-sm leading-relaxed text-aegean/60">{t("calendarHint")}</p>

      <div className="fleet-daypicker mt-5">
        <DayPicker
          mode="range"
          selected={range}
          onSelect={setRange}
          disabled={[{ before: today }, ...blocked]}
          excludeDisabled
          numberOfMonths={1}
          className="rdp-root"
        />
      </div>
      {blocked.length > 0 ? <p className="mt-2 text-xs text-aegean/55">{tBook("availHint")}</p> : null}


      {/* Button, not <Link>: a crawlable href would let Google discover
          /book?vehicle=… as duplicate URLs of /book. Same UX, no crawl waste. */}
      <button
        type="button"
        onClick={() => router.push(href)}
        className="btn-accent mt-5 min-h-12 w-full justify-center text-[15px]"
      >
        {range?.from && range?.to ? t("requestDates") : t("bookThis")}
      </button>

      <p className="mt-3 text-xs leading-relaxed text-aegean/50">{t("termsNoPrepay")}</p>
    </div>
  );
}
