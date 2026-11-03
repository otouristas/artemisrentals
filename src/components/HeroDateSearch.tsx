"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { trackEvent } from "@/lib/analytics";
import { toISODate } from "@/lib/dates";
import { CalendarIcon, PinIcon } from "@/components/icons";

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

  function onFromChange(value: string) {
    setFrom(value);
    if (to && value && to < value) setTo(value);
  }

  function search() {
    if (!from || !to) return;
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
      className="grid w-full max-w-3xl grid-cols-2 overflow-hidden rounded-2xl bg-foam shadow-[0_20px_60px_rgba(11,42,60,0.35)] md:grid-cols-[1.1fr_1fr_1fr_auto] md:items-center md:rounded-full md:p-1.5"
      aria-label={t("searchLabel")}
    >
      <div className="col-span-2 border-b border-line px-5 py-3 md:col-span-1 md:border-b-0 md:border-r md:py-2">
        <span className={labelClass}>
          <PinIcon className="h-3.5 w-3.5" />
          {tBook("pickupLocation")}
        </span>
        <span className="mt-0.5 block truncate text-[15px] font-semibold text-aegean">
          {tBook("places.kamares")} · {tBook("places.apollonia")}
        </span>
      </div>
      <label className="border-r border-line px-5 py-3 md:py-2">
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
          onChange={(e) => onFromChange(e.target.value)}
          className={fieldClass}
        />
      </label>
      <label className="px-5 py-3 md:py-2">
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
          onChange={(e) => setTo(e.target.value)}
          className={fieldClass}
        />
      </label>
      <div className="col-span-2 border-t border-line p-2 md:col-span-1 md:border-t-0 md:p-0">
        <button
          type="submit"
          disabled={!from || !to}
          className="btn-accent min-h-12 w-full justify-center whitespace-nowrap px-6 text-[15px] disabled:cursor-not-allowed disabled:opacity-70 md:rounded-full"
        >
          {t("searchCta")}
        </button>
      </div>
    </form>
  );
}
