"use client";

import { useMemo } from "react";
import { DayPicker, type DateRange } from "react-day-picker";
import { useTranslations } from "next-intl";
import { estimateTotal, rentalDays } from "@/lib/fleet";
import { soldOutDays, useAvailability } from "@/lib/use-availability";
import { parseISODate, toISODate } from "@/lib/dates";
import "react-day-picker/style.css";

export function StepDates({
  from,
  to,
  rateKey,
  vehicleSlug,
  onChange,
  onNext,
  onBack,
}: {
  from: string;
  to: string;
  rateKey: string | null;
  vehicleSlug: string | null;
  onChange: (from: string, to: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const t = useTranslations("Book");
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const range: DateRange | undefined = useMemo(() => {
    const f = parseISODate(from);
    const tt = parseISODate(to);
    if (!f && !tt) return undefined;
    return { from: f, to: tt };
  }, [from, to]);

  function handleSelect(next: DateRange | undefined) {
    onChange(next?.from ? toISODate(next.from) : "", next?.to ? toISODate(next.to) : "");
  }

  const nights = range?.from && range?.to ? rentalDays(range.from, range.to) : 0;

  const estimatedTotal = useMemo(() => {
    if (!range?.from || !range?.to) return null;
    return estimateTotal(rateKey, range.from, range.to);
  }, [rateKey, range]);

  // Live availability for the chosen model over the next year: fully booked days are disabled.
  const windowEnd = useMemo(() => {
    const d = new Date(today);
    d.setDate(d.getDate() + 365);
    return toISODate(d);
  }, [today]);
  const availability = useAvailability(vehicleSlug ? toISODate(today) : null, vehicleSlug ? windowEnd : null, vehicleSlug);
  const blocked = useMemo(
    () => (vehicleSlug ? soldOutDays(availability.vehicles[vehicleSlug]) : []),
    [availability.vehicles, vehicleSlug],
  );

  const canProceed = Boolean(from && to);

  return (
    <div>
      <h2 className="font-display text-2xl text-aegean">{t("stepDatesTitle")}</h2>
      <p className="mt-1 text-sm text-aegean/65">{t("stepDatesLead")}</p>

      <div className="touristas-daypicker mt-5 overflow-x-auto rounded-2xl bg-foam/80 p-4 ring-1 ring-aegean/10 md:p-5">
        <DayPicker
          mode="range"
          selected={range}
          onSelect={handleSelect}
          disabled={[{ before: today }, ...blocked]}
          excludeDisabled
          numberOfMonths={1}
          className="rdp-root"
        />
      </div>
      {blocked.length > 0 ? <p className="mt-2 text-xs text-aegean/55">{t("availHint")}</p> : null}

      {nights > 0 && (
        <p className="mt-4 text-sm font-medium text-aegean">
          {t("nights", { count: nights })}
          {estimatedTotal != null ? ` · ${t("estimatedTotal", { total: estimatedTotal })}` : null}
        </p>
      )}

      <div className="mt-8 flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="rounded-full border border-aegean/20 px-6 py-3 text-sm font-semibold text-aegean transition hover:bg-aegean/5"
        >
          {t("back")}
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!canProceed}
          className="btn-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          {t("next")}
        </button>
      </div>
    </div>
  );
}
