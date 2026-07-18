import { getTranslations, setRequestLocale } from "next-intl/server";
import { FleetGrid } from "@/components/FleetGrid";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { TrustBadges } from "@/components/TrustBadges";
import { JsonLd } from "@/components/JsonLd";
import { getScooters } from "@/lib/fleet";
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
  const loc = locale as Locale;

  return (
    <div className="container-site page-hero pb-20">
      <Breadcrumbs locale={loc} items={[{ label: t("scootersTitle") }]} />
      <JsonLd
        data={itemListJsonLd({
          locale: loc,
          name: t("scootersTitle"),
          path: "/scooters",
          items: scooters.map((s) => ({
            name: s.name,
            url: absoluteUrl(loc, `/scooters/${s.slug}`),
            image: `${SITE_URL}${s.image}`,
          })),
        })}
      />
      <h1 className="text-display text-aegean">{t("scootersTitle")}</h1>
      <p className="mt-4 max-w-2xl text-lead text-aegean/75">{t("scootersLead")}</p>
      <TrustBadges className="mt-6" />
      <div className="mt-12">
        <FleetGrid vehicles={scooters} />
      </div>
    </div>
  );
}
