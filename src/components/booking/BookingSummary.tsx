"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { business, whatsappUrl } from "@/lib/site";
import { intlLocale } from "@/lib/i18n-locale";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import type { BookingState, BookingStatus, Vehicle } from "./types";

function formatDate(value: string, locale: string) {
  if (!value) return "-";
  const d = new Date(`${value}T12:00:00`);
  if (Number.isNaN(d.getTime())) return value;
  return new Intl.DateTimeFormat(intlLocale(locale), {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

export function BookingSummary({
  state,
  vehicle,
  estimatedTotal,
  status,
  canSubmit,
  onSubmit,
}: {
  state: BookingState;
  vehicle: Vehicle | undefined;
  estimatedTotal: number | null;
  status: BookingStatus;
  canSubmit: boolean;
  onSubmit: () => void;
}) {
  const t = useTranslations("Book");
  const locale = useLocale();

  return (
    <aside className="lg:sticky lg:top-28 lg:self-start">
      <div className="border-t border-aegean/10 pt-6 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-10">
        {vehicle ? (
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-xl bg-aegean/[0.04]">
              <Image
                src={vehicle.image}
                alt={vehicle.name}
                fill
                className="object-cover"
                sizes="80px"
              />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-aegean/45">
                {t("vehicle")}
              </p>
              <p className="mt-1 font-display text-xl leading-tight text-aegean">{vehicle.name}</p>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-aegean/45">
              {t("vehicle")}
            </p>
            <p className="mt-1 font-display text-xl text-aegean">{t("vehicleAny")}</p>
          </div>
        )}

        <dl className="mt-8 space-y-4 text-sm">
          <Fact label={t("pickup")} value={formatDate(state.from, locale)} />
          <Fact label={t("return")} value={formatDate(state.to, locale)} />
          <Fact label={t("pickupLocation")} value={t(`places.${state.pickupLocation}`)} />
          <Fact label={t("returnLocation")} value={t(`places.${state.returnLocation}`)} />
          {state.partySize > 1 && (
            <Fact label={t("partySize")} value={String(state.partySize)} />
          )}
          {state.childSeat && <Fact label={t("childSeat")} value={t("yes")} />}
        </dl>

        <div className="mt-8 border-t border-aegean/10 pt-6">
          {estimatedTotal != null ? (
            <>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-aegean/45">
                {t("estimateLabel")}
              </p>
              <p className="mt-1 font-display text-3xl tracking-tight text-olive">~€{estimatedTotal}</p>
            </>
          ) : null}
          <p className="mt-2 text-xs leading-relaxed text-aegean/50">{t("estimateDisclaimer")}</p>
        </div>

        <button
          type="button"
          onClick={onSubmit}
          disabled={!canSubmit || status === "sending"}
          className="btn-primary mt-6 w-full disabled:cursor-not-allowed disabled:opacity-50"
        >
          {status === "sending" ? t("sending") : t("submit")}
        </button>

        {!canSubmit && status === "idle" && (
          <p className="mt-3 text-xs text-aegean/45">{t("fillRequired")}</p>
        )}
        {status === "success" && <p className="mt-3 text-sm text-olive">{t("success")}</p>}
        {status === "error" && <p className="mt-3 text-sm text-red-700">{t("error")}</p>}

        <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
          <a
            href={`tel:${business.phones[0].e164}`}
            className="font-medium text-aegean/70 underline-offset-4 transition hover:text-aegean hover:underline"
          >
            {business.phones[0].display}
          </a>
          <a
            href={whatsappUrl("Hello Artemis, I would like to enquire about a rental.")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-medium text-aegean/70 underline-offset-4 transition hover:text-aegean hover:underline"
          >
            <WhatsAppIcon className="h-3.5 w-3.5" />
            {t("whatsapp")}
          </a>
        </div>
      </div>
    </aside>
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
