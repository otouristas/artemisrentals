import { getTranslations, setRequestLocale } from "next-intl/server";
import { VehicleCard } from "@/components/VehicleCard";
import { JsonLd } from "@/components/JsonLd";
import { getCars } from "@/lib/fleet";
import { buildMetadata, absoluteUrl } from "@/lib/seo";
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
    title: `${t("carsTitle")} | Artemis Rental`,
    description: t("carsLead"),
    path: "/cars",
  });
}

export default async function CarsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Fleet");
  const cars = getCars();
  const loc = locale as Locale;

  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 pt-28 md:px-6">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: t("carsTitle"),
          url: absoluteUrl(loc, "/cars"),
        }}
      />
      <h1 className="font-display text-4xl text-aegean md:text-5xl">{t("carsTitle")}</h1>
      <p className="mt-4 max-w-2xl text-lg text-aegean/75">{t("carsLead")}</p>
      <div className="stagger-children mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cars.map((car) => (
          <VehicleCard key={car.slug} vehicle={car} />
        ))}
      </div>
    </div>
  );
}
