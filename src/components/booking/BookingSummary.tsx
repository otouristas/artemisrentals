"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { business, whatsappUrl } from "@/lib/site";
import { intlLocale } from "@/lib/i18n-locale";
import { REVIEW_COUNT, REVIEW_PROFILE_URL, REVIEW_RATING } from "@/lib/reviews";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { GoogleG } from "@/components/GoogleG";
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
  whatsappHref,
  onSubmit,
}: {
  state: BookingState;
  vehicle: Vehicle | undefined;
  estimatedTotal: number | null;
  status: BookingStatus;
  canSubmit: boolean;
  whatsappHref: string;
  onSubmit: () => void;
}) {
  const t = useTranslations("Book");
  const tCommon = useTranslations("Common");
  const tReviews = useTranslations("Reviews");
  const locale = useLocale();

  return (
    <aside className="lg:sticky lg:top-28 lg:self-start">
      <div className="panel p-5 shadow-[0_12px_32px_rgba(11,42,60,0.08)] md:p-6">
        {vehicle ? (
          <div className="flex items-center justify-between gap-4">
            <div className="relative order-2 h-16 w-20 shrink-0 overflow-hidden rounded-lg border border-line bg-foam">
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
              <p className="mt-1 text-xl font-semibold leading-tight text-aegean">{vehicle.name}</p>
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

        <dl className="mt-6 space-y-3 border-t border-line pt-5 text-sm">
          <Fact label={t("pickup")} value={formatDate(state.from, locale)} />
          <Fact label={t("return")} value={formatDate(state.to, locale)} />
          <Fact label={t("pickupLocation")} value={t(`places.${state.pickupLocation}`)} />
          <Fact label={t("returnLocation")} value={t(`places.${state.returnLocation}`)} />
          {state.partySize > 1 && (
            <Fact label={t("partySize")} value={String(state.partySize)} />
          )}
          {state.childSeat && <Fact label={t("childSeat")} value={t("yes")} />}
        </dl>

        <div className="mt-6 border-t border-line pt-5">
          {estimatedTotal != null ? (
            <>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-aegean/45">
                {t("estimateLabel")}
              </p>
              <p className="mt-1 text-aegean"><span className="price-total text-3xl">~€{estimatedTotal}</span></p>
            </>
          ) : null}
          <p className="mt-2 text-xs leading-relaxed text-aegean/50">{t("estimateDisclaimer")}</p>
        </div>

        {status !== "success" && (
          <button
            type="button"
            onClick={onSubmit}
            disabled={!canSubmit || status === "sending"}
            className="btn-accent mt-6 min-h-12 w-full text-[15px] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {status === "sending" ? t("sending") : t("submit")}
          </button>
        )}

        {!canSubmit && status === "idle" && (
          <p className="mt-3 text-xs text-aegean/45">{t("fillRequired")}</p>
        )}

        {status === "success" && (
          <div className="mt-6 space-y-3">
            <p className="text-sm text-olive">{t("success")}</p>
            <p className="text-xs leading-relaxed text-aegean/55">{t("whatsappAckHint")}</p>
          </div>
        )}
        {status === "error" && <p className="mt-3 text-sm text-red-700">{t("error")}</p>}

        <ul className="mt-6 space-y-2 text-sm text-aegean/75">
          <li className="flex items-center gap-2">
            <CheckIcon />
            {tCommon("trustNoPrepay")}
          </li>
          <li className="flex items-center gap-2">
            <CheckIcon />
            {t("freePortPickup")}
          </li>
          <li>
            <a
              href={REVIEW_PROFILE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 underline-offset-4 transition hover:text-aegean hover:underline"
            >
              <GoogleG className="h-4 w-4 shrink-0" />
              <span>
                <span className="font-semibold text-aegean">★ {REVIEW_RATING.toFixed(1)}</span>
                {" · "}
                {tReviews("basedOn", { count: REVIEW_COUNT })}
              </span>
            </a>
          </li>
        </ul>

        <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
          <a
            href={`tel:${business.phones[0].e164}`}
            className="font-medium text-aegean/70 underline-offset-4 transition hover:text-aegean hover:underline"
          >
            {business.phones[0].display}
          </a>
          <a
            href={whatsappHref || whatsappUrl()}
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

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4 shrink-0 text-olive" aria-hidden="true">
      <path
        fill="currentColor"
        d="M8.1 13.6 4.5 10l-1.1 1.1 4.7 4.7 9.5-9.5-1.1-1.1z"
      />
    </svg>
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
