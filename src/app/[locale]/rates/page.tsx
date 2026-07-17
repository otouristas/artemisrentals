import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getCars, getRatesMeta } from "@/lib/fleet";
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
  const loc = locale as "en" | "el";

  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 pt-28 md:px-6">
      <h1 className="font-display text-4xl text-aegean md:text-5xl">{t("title")}</h1>
      <p className="mt-4 max-w-2xl text-lg text-aegean/75">{t("lead")}</p>

      <div className="mt-10 overflow-x-auto rounded-3xl bg-foam/80 ring-1 ring-aegean/10">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-aegean text-foam">
            <tr>
              <th className="px-4 py-3 font-semibold">{t("vehicle")}</th>
              {rates.periods.map((p) => (
                <th key={p.id} className="px-4 py-3 font-medium">
                  {p.label[loc]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cars.map((car) => {
              const row = car.rateKey
                ? rates.cars[car.rateKey as keyof typeof rates.cars]
                : null;
              if (!row) return null;
              return (
                <tr key={car.slug} className="border-t border-aegean/8 odd:bg-salt/40">
                  <td className="px-4 py-3 font-medium text-aegean">{car.name}</td>
                  <td className="px-4 py-3">€{row.low}</td>
                  <td className="px-4 py-3">€{row.shoulder}</td>
                  <td className="px-4 py-3">€{row.mid}</td>
                  <td className="px-4 py-3">€{row.peak}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-6 text-aegean/70">{t("note")}</p>
      <p className="mt-2 text-aegean/70">{rates.note[loc]}</p>
      <Link
        href="/book"
        className="mt-8 inline-flex rounded-full bg-aegean px-6 py-3 text-sm font-semibold text-foam"
      >
        {t("cta")}
      </Link>
    </div>
  );
}
