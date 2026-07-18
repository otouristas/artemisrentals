import { getTranslations, setRequestLocale } from "next-intl/server";
import { FleetGrid } from "@/components/FleetGrid";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { TrustBadges } from "@/components/TrustBadges";
import { JsonLd } from "@/components/JsonLd";
import { getCars } from "@/lib/fleet";
import { buildMetadata, absoluteUrl, itemListJsonLd } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";
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
    <div className="container-site page-hero pb-20">
      <Breadcrumbs locale={loc} items={[{ label: t("carsTitle") }]} />
      <JsonLd
        data={itemListJsonLd({
          locale: loc,
          name: t("carsTitle"),
          path: "/cars",
          items: cars.map((car) => ({
            name: car.name,
            url: absoluteUrl(loc, `/cars/${car.slug}`),
            image: `${SITE_URL}${car.image}`,
          })),
        })}
      />
      <h1 className="text-display text-aegean">{t("carsTitle")}</h1>
      <p className="mt-4 max-w-2xl text-lead text-aegean/75">{t("carsLead")}</p>
      <TrustBadges className="mt-6" />
      <div className="mt-12">
        <FleetGrid vehicles={cars} />
      </div>
    </div>
  );
}
