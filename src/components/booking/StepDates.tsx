"use client";

import { useMemo } from "react";
import { DayPicker, type DateRange } from "react-day-picker";
import { useTranslations } from "next-intl";
import { estimateRateForDate } from "@/lib/fleet";
import "react-day-picker/style.css";

function toISODate(d: Date) {
  return d.toISOString().slice(0, 10);
}

function parseISODate(value?: string) {
  if (!value) return undefined;
  const d = new Date(`${value}T00:00:00`);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

function daysBetween(from: Date, to: Date) {
  const a = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate());
  const b = Date.UTC(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.max(1, Math.round((b - a) / 86400000) + 1);
}

export function StepDates({
  from,
  to,
  rateKey,
  onChange,
  onNext,
  onBack,
}: {
  from: string;
  to: string;
  rateKey: string | null;
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

  const nights = range?.from && range?.to ? daysBetween(range.from, range.to) : 0;

  const estimatedTotal = useMemo(() => {
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
          disabled={{ before: today }}
          numberOfMonths={1}
          className="rdp-root"
        />
      </div>

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
