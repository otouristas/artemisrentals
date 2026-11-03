"use client";

import { useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { trackEvent } from "@/lib/analytics";
import { toISODate } from "@/lib/dates";
import { CalendarIcon, PinIcon, SearchIcon } from "@/components/icons";

const fieldClass =
  "mt-0.5 block w-full min-w-0 appearance-none border-0 bg-transparent p-0 text-[15px] font-semibold text-aegean outline-none [color-scheme:light]";
const labelClass = "flex items-center gap-1.5 text-xs font-medium text-aegean/55";

/** Dates first: the guest sees every car priced for their trip on the next screen. */
export function HeroDateSearch() {
  const t = useTranslations("Home");
  const tBook = useTranslations("Book");
  const router = useRouter();
  const today = useMemo(() => toISODate(new Date()), []);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const fromRef = useRef<HTMLInputElement>(null);
  const toRef = useRef<HTMLInputElement>(null);

  function onFromChange(value: string) {
    setFrom(value);
    if (to && value && to < value) setTo(value);
  }

  function openPicker(input: HTMLInputElement | null) {
    if (!input) return;
    input.focus();
    try {
      input.showPicker?.();
    } catch {
      // Some browsers only allow showPicker from a direct click; focus is enough there.
    }
  }

  function search() {
    // Never a dead button: point the guest at the date that is still missing.
    if (!from) return openPicker(fromRef.current);
    if (!to) return openPicker(toRef.current);
    trackEvent("book_cta_click", { location: "hero_search" });
    // Button + router, not a crawlable href, same as the vehicle calendar.
    router.push(`/book?from=${from}&to=${to}`);
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        search();
      }}
      className="grid w-full max-w-4xl grid-cols-2 overflow-hidden rounded-2xl bg-foam shadow-[0_20px_60px_rgba(11,42,60,0.35)] md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)_auto] md:items-stretch md:rounded-full md:p-2"
      aria-label={t("searchLabel")}
    >
      <div className="col-span-2 min-w-0 border-b border-line px-5 py-3 md:col-span-1 md:border-b-0 md:border-r md:py-2">
        <span className={labelClass}>
          <PinIcon className="h-3.5 w-3.5" />
          {tBook("pickupLocation")}
        </span>
        <span className="mt-0.5 block truncate text-[15px] font-semibold text-aegean">
          {tBook("places.kamares")} · {tBook("places.apollonia")}
        </span>
      </div>
      <label className="min-w-0 border-r border-line px-5 py-3 md:py-2">
        <span className={labelClass}>
          <CalendarIcon className="h-3.5 w-3.5" />
          {tBook("pickup")}
        </span>
        <input
          type="date"
          name="from"
          required
          min={today}
          value={from}
          ref={fromRef}
          onChange={(e) => onFromChange(e.target.value)}
          className={fieldClass}
        />
      </label>
      <label className="min-w-0 px-5 py-3 md:border-r md:border-line md:py-2">
        <span className={labelClass}>
          <CalendarIcon className="h-3.5 w-3.5" />
          {tBook("return")}
        </span>
        <input
          type="date"
          name="to"
          required
          min={from || today}
          value={to}
          ref={toRef}
          onChange={(e) => setTo(e.target.value)}
          className={fieldClass}
        />
      </label>
      <div className="col-span-2 flex border-t border-line p-2 md:col-span-1 md:border-t-0 md:p-0 md:pl-2">
        <button
          type="submit"
          className="inline-flex min-h-12 w-full items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-aegean px-6 text-[15px] font-semibold text-foam transition hover:bg-aegean-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-aegean md:h-full md:rounded-full md:px-7"
        >
          <SearchIcon className="h-[18px] w-[18px]" />
          {t("searchCta")}
        </button>
      </div>
    </form>
  );
}
