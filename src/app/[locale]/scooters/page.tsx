import { getTranslations, setRequestLocale } from "next-intl/server";
import { VehicleCard } from "@/components/VehicleCard";
import { getScooters } from "@/lib/fleet";
import { buildMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Fleet" });
  return buildMetadata({
    locale: locale as Locale,
    title: `${t("scootersTitle")} | Artemis Rental`,
    description: t("scootersLead"),
    path: "/scooters",
  });
}

export default async function ScootersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Fleet");
  const scooters = getScooters();

  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 pt-28 md:px-6">
      <h1 className="font-display text-4xl text-aegean md:text-5xl">{t("scootersTitle")}</h1>
      <p className="mt-4 max-w-2xl text-lg text-aegean/75">{t("scootersLead")}</p>
      <div className="stagger-children mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {scooters.map((scooter) => (
          <VehicleCard key={scooter.slug} vehicle={scooter} />
        ))}
      </div>
    </div>
  );
}
