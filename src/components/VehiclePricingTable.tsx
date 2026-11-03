import { getTranslations } from "next-intl/server";
import {
  formatRateCell,
  getCurrentSeason,
  getPeriodLabel,
  getRateRow,
  getRatesMeta,
  localizeField,
  type PeriodId,
} from "@/lib/fleet";
import type { Locale } from "@/i18n/routing";

const PERIODS: PeriodId[] = ["low", "shoulder", "mid", "peak"];

export async function VehiclePricingTable({
  rateKey,
  category,
  locale,
}: {
  rateKey: string | null;
  category: "car" | "scooter";
  locale: Locale;
}) {
  const t = await getTranslations("Fleet");
  const row = getRateRow(rateKey);
  if (!row) return null;

  const rates = getRatesMeta();
  const current = getCurrentSeason();
  const currentPrice = row[current];

  return (
    <section className="border-t border-line pt-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-aegean">{t("pricingTitle")}</h2>
          <p className="mt-2 text-sm text-aegean/65">{t("pricingLead")}</p>
        </div>
        <div className="rounded-xl border border-line bg-surface px-4 py-3 text-right">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-aegean/55">
            {t("currentSeason")}
          </p>
          <p className="mt-0.5 text-xs text-aegean/60">{getPeriodLabel(current, locale)}</p>
          <p className="mt-1 text-2xl font-bold text-aegean">
            {typeof currentPrice === "number" ? (
              <>
                €{currentPrice}
                <span className="ml-1 text-sm font-sans font-medium text-aegean/55">
                  {t("perDay")}
                </span>
              </>
            ) : (
              <span className="text-base font-sans font-semibold">{t("seasonClosed")}</span>
            )}
          </p>
        </div>
      </div>

      <div className="mt-5 overflow-x-auto rounded-xl border border-line">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-surface text-aegean">
            <tr>
              <th className="px-4 py-3 font-semibold">{t("season")}</th>
              <th className="px-4 py-3 font-semibold">{t("dailyRate")}</th>
            </tr>
          </thead>
          <tbody>
            {PERIODS.map((period) => {
              const price = row[period];
              const active = period === current;
              return (
                <tr
                  key={period}
                  className={`border-t border-line ${
                    active ? "bg-sun/10 font-semibold text-aegean" : "text-aegean/85"
                  }`}
                >
                  <td className="px-4 py-3">
                    <span className="block">{getPeriodLabel(period, locale)}</span>
                    {active ? (
                      <span className="mt-0.5 block text-[11px] font-medium uppercase tracking-wide text-olive">
                        {t("nowBadge")}
                      </span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 tabular-nums">{formatRateCell(price)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-5 space-y-2 text-sm leading-relaxed text-aegean/70">
        {category === "car" ? (
          <>
            <p>{localizeField(rates.pickup.carsFree, locale)}</p>
            <p>{localizeField(rates.pickup.carsRequest, locale)}</p>
          </>
        ) : (
          <p>{localizeField(rates.pickup.scooters, locale)}</p>
        )}
        <p className="text-xs text-aegean/50">{t("pricingNote")}</p>
      </div>
    </section>
  );
}
