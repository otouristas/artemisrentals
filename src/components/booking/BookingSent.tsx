"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import { business } from "@/lib/site";
import { intlLocale } from "@/lib/i18n-locale";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import type { BookingState, Vehicle } from "./types";

function formatDate(value: string, locale: string) {
  if (!value) return "-";
  const d = new Date(`${value}T12:00:00`);
  if (Number.isNaN(d.getTime())) return value;
  return new Intl.DateTimeFormat(intlLocale(locale), {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(d);
}

/** Replaces the wizard once the enquiry is sent, so the guest knows exactly where they stand. */
export function BookingSent({
  state,
  vehicle,
  estimatedTotal,
  whatsappHref,
  onReset,
}: {
  state: BookingState;
  vehicle: Vehicle | undefined;
  estimatedTotal: number | null;
  whatsappHref: string;
  onReset: () => void;
}) {
  const t = useTranslations("Book");
  const locale = useLocale();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstName = state.name.trim().split(/\s+/)[0] ?? "";

  useEffect(() => {
    headingRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    headingRef.current?.focus({ preventScroll: true });
  }, []);

  const steps = [t("nextStep1"), t("nextStep2"), t("nextStep3")];

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(320px,23rem)] lg:gap-x-12">
      <div className="min-w-0 lg:pr-10" role="status">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-olive/15 text-olive">
          <svg viewBox="0 0 20 20" className="h-6 w-6" aria-hidden="true">
            <path fill="currentColor" d="M8.1 13.6 4.5 10l-1.1 1.1 4.7 4.7 9.5-9.5-1.1-1.1z" />
          </svg>
        </span>
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="mt-5 font-display text-3xl text-aegean outline-none md:text-4xl"
        >
          {t("sentTitle")}
        </h2>
        <p className="mt-3 max-w-xl text-base leading-relaxed text-aegean/70">
          {t("sentLead", { name: firstName })}
        </p>

        <h3 className="mt-10 text-xs font-semibold uppercase tracking-[0.16em] text-aegean/45">
          {t("nextStepsTitle")}
        </h3>
        <ol className="mt-4 space-y-4">
          {steps.map((label, i) => (
            <li key={label} className="flex gap-4">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-aegean text-xs font-semibold text-foam">
                {i + 1}
              </span>
              <span className="pt-0.5 text-sm leading-relaxed text-aegean/80">{label}</span>
            </li>
          ))}
        </ol>

        <p className="mt-10 text-sm text-aegean/60">{t("sentQuestions")}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary inline-flex min-h-12 items-center gap-2"
          >
            <WhatsAppIcon className="h-4 w-4" />
            {t("whatsapp")}
          </a>
          <a
            href={`tel:${business.phones[0].e164}`}
            className="inline-flex min-h-12 items-center rounded-full border border-aegean/15 px-5 text-sm font-semibold text-aegean transition hover:bg-aegean/[0.04]"
          >
            {t("call")} · {business.phones[0].display}
          </a>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="mt-8 text-sm font-semibold text-aegean/60 underline-offset-4 transition hover:text-aegean hover:underline"
        >
          {t("newRequest")}
        </button>
      </div>

      <aside className="lg:self-start">
        <div className="panel p-5 md:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-aegean/45">
            {t("sentSummaryTitle")}
          </p>
          <div className="mt-4 flex items-center gap-4">
            {vehicle ? (
              <div className="relative h-14 w-[4.5rem] shrink-0 overflow-hidden rounded-xl bg-foam">
                <Image src={vehicle.image} alt={vehicle.name} fill className="object-cover" sizes="72px" />
              </div>
            ) : null}
            <p className="font-display text-xl leading-tight text-aegean">
              {vehicle?.name ?? t("vehicleAny")}
            </p>
          </div>
          <dl className="mt-6 space-y-3 text-sm">
            <Fact label={t("pickup")} value={formatDate(state.from, locale)} />
            <Fact label={t("return")} value={formatDate(state.to, locale)} />
            <Fact label={t("pickupLocation")} value={t(`places.${state.pickupLocation}`)} />
            <Fact label={t("returnLocation")} value={t(`places.${state.returnLocation}`)} />
            {estimatedTotal != null ? (
              <Fact label={t("estimateLabel")} value={`~€${estimatedTotal}`} />
            ) : null}
          </dl>
          <p className="mt-5 border-t border-aegean/10 pt-4 text-xs leading-relaxed text-aegean/55">
            {t("whatsappAckHint")}
          </p>
        </div>
      </aside>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-6">
      <dt className="text-aegean/50">{label}</dt>
      <dd className="text-right font-medium text-aegean">{value}</dd>
    </div>
  );
}
