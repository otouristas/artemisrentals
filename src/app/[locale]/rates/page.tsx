import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { TrustBadges } from "@/components/TrustBadges";
import {
  formatRateCell,
  getCars,
  getCurrentSeason,
  getRatesMeta,
  getScooters,
  localizeField,
  type PeriodId,
} from "@/lib/fleet";
import { buildMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Rates" });
  return buildMetadata({
    locale: locale as Locale,
    title: `${t("title")} | Artemis Rental`,
    description: t("lead"),
    path: "/rates",
  });
}

function RatesTable({
  vehicles,
  categoryPath,
  periods,
  current,
  vehicleLabel,
  locale,
  nowLabel,
}: {
  vehicles: ReturnType<typeof getCars> | ReturnType<typeof getScooters>;
  categoryPath: "cars" | "scooters";
  periods: ReturnType<typeof getRatesMeta>["periods"];
  current: PeriodId;
  vehicleLabel: string;
  locale: Locale;
  nowLabel: string;
}) {
  const rates = getRatesMeta();

  return (
    <div className="overflow-x-auto rounded-3xl bg-foam/80 outline outline-aegean/10">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-aegean text-foam">
          <tr>
            <th className="px-4 py-3 font-semibold">{vehicleLabel}</th>
            {periods.map((p) => (
              <th
                key={p.id}
                className={`px-4 py-3 font-medium ${p.id === current ? "bg-sun/25 text-foam" : ""}`}
              >
                <span className="block">{localizeField(p.label, locale)}</span>
                {p.id === current ? (
                  <span className="mt-1 block text-[10px] font-semibold uppercase tracking-wide text-sun">
                    {nowLabel}
                  </span>
                ) : null}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {vehicles.map((vehicle) => {
            const row = vehicle.rateKey
              ? rates.vehicles[vehicle.rateKey as keyof typeof rates.vehicles]
              : null;
            if (!row) return null;
            return (
              <tr key={vehicle.slug} className="border-t border-aegean/8 odd:bg-salt/40">
                <td className="px-4 py-3 font-medium text-aegean">
                  <Link href={`/${categoryPath}/${vehicle.slug}`} className="hover:underline">
                    {vehicle.name}
                  </Link>
                </td>
                {periods.map((p) => {
                  const value = row[p.id as PeriodId];
                  return (
                    <td
                      key={p.id}
                      className={`px-4 py-3 tabular-nums ${
                        p.id === current ? "bg-sun/10 font-semibold text-aegean" : "text-aegean/80"
                      }`}
                    >
                      {formatRateCell(value)}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default async function RatesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Rates");
  const rates = getRatesMeta();
  const cars = getCars();
  const scooters = getScooters();
  const loc = locale as Locale;
  const current = getCurrentSeason();

  return (
    <div className="container-site page-hero pb-20">
      <Breadcrumbs locale={loc} items={[{ label: t("title") }]} />
      <h1 className="text-display text-aegean">{t("title")}</h1>
      <p className="mt-4 max-w-2xl text-lead text-aegean/75">{t("lead")}</p>
      <TrustBadges className="mt-6" />

      <h2 className="mt-12 font-display text-2xl text-aegean">{t("carsHeading")}</h2>
      <div className="mt-4">
        <RatesTable
          vehicles={cars}
          categoryPath="cars"
          periods={rates.periods}
          current={current}
          vehicleLabel={t("vehicle")}
          locale={loc}
          nowLabel={t("now")}
        />
      </div>

      <h2 className="mt-12 font-display text-2xl text-aegean">{t("scootersHeading")}</h2>
      <p className="mt-2 max-w-2xl text-sm text-aegean/65">{t("scootersNote")}</p>
      <div className="mt-4">
        <RatesTable
          vehicles={scooters}
          categoryPath="scooters"
          periods={rates.periods}
          current={current}
          vehicleLabel={t("vehicle")}
          locale={loc}
          nowLabel={t("now")}
        />
      </div>

      <div className="mt-10 max-w-3xl space-y-2 text-aegean/75">
        <p>{localizeField(rates.pickup.carsFree, loc)}</p>
        <p>{localizeField(rates.pickup.carsRequest, loc)}</p>
        <p>{localizeField(rates.pickup.scooters, loc)}</p>
        <p className="pt-2 text-sm text-aegean/60">{t("note")}</p>
        <p className="text-sm text-aegean/60">{localizeField(rates.note, loc)}</p>
      </div>

      <Link href="/book" className="btn-primary mt-8">
        {t("cta")}
      </Link>
    </div>
  );
}
