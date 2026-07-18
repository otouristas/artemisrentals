import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { VehicleCard } from "@/components/VehicleCard";
import { VehicleBookingCalendar } from "@/components/VehicleBookingCalendar";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { VehiclePricingTable } from "@/components/VehiclePricingTable";
import {
  getCurrentSeasonRate,
  getLowestRate,
  getRelatedVehicles,
  localizeField,
  type Vehicle,
} from "@/lib/fleet";
import { absoluteUrl } from "@/lib/seo";
import { business, SITE_URL } from "@/lib/site";
import type { Locale } from "@/i18n/routing";

export async function VehicleDetail({
  vehicle,
  locale,
}: {
  vehicle: Vehicle;
  locale: Locale;
}) {
  const t = await getTranslations("Fleet");
  const terms = await getTranslations("Terms");
  const lowest = getLowestRate(vehicle.rateKey);
  const { price: todayRate } = getCurrentSeasonRate(vehicle.rateKey);
  const offerPrice = todayRate ?? lowest;
  const related = getRelatedVehicles(vehicle.slug);
  const description = localizeField(
    (vehicle as { description?: { en: string; el: string } }).description,
    locale,
  );
  const highlightsField = (
    vehicle as { highlights?: Partial<Record<string, string[]>> }
  ).highlights;
  const highlights =
    highlightsField?.[locale] ?? highlightsField?.en ?? [];
  const backHref = vehicle.category === "car" ? "/cars" : "/scooters";
  const backLabel = vehicle.category === "car" ? t("backToCars") : t("backToScooters");
  const path =
    vehicle.category === "car" ? `/cars/${vehicle.slug}` : `/scooters/${vehicle.slug}`;

  const specs = [
    vehicle.engineCc ? t("cc", { cc: vehicle.engineCc }) : null,
    t("seats", { count: vehicle.seats }),
    vehicle.transmission === "automatic" ? t("automatic") : t("manual"),
    t("petrol"),
  ].filter(Boolean) as string[];

  return (
    <div className="bg-foam">
      <div className="container-site page-hero pb-28 md:pb-20">
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "Product",
            name: vehicle.name,
            description: description || undefined,
            image: `${SITE_URL}${vehicle.image}`,
            brand: "Artemis Rental",
            url: absoluteUrl(locale, path),
            offers: offerPrice
              ? {
                  "@type": "Offer",
                  priceCurrency: "EUR",
                  price: offerPrice,
                  availability: "https://schema.org/InStock",
                }
              : undefined,
          }}
        />

        <Breadcrumbs
          locale={locale}
          items={[
            { label: backLabel, href: backHref },
            { label: vehicle.name },
          ]}
        />

        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(320px,24rem)] lg:items-start lg:gap-x-12 lg:gap-y-0">
          <div className="min-w-0">
            <div className="relative aspect-[5/4] overflow-hidden bg-foam ring-1 ring-aegean/10">
              <Image
                src={vehicle.image}
                alt={vehicle.name}
                fill
                className="object-contain object-center p-4 md:p-8"
                sizes="(max-width:1024px) 100vw, 55vw"
                preload
              />
            </div>

            <h1 className="mt-8 text-display text-aegean">{vehicle.name}</h1>

            {description ? (
              <p className="mt-4 max-w-2xl text-lg leading-relaxed text-aegean/75">{description}</p>
            ) : null}

            {highlights.length > 0 && (
              <ul className="mt-5 flex flex-wrap gap-2">
                {highlights.filter(Boolean).map((h) => (
                  <li
                    key={h}
                    className="bg-salt px-3 py-1 text-xs font-medium text-aegean/80 ring-1 ring-aegean/10"
                  >
                    {h}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <aside className="lg:sticky lg:top-28 lg:row-span-2 lg:self-start">
            <div className="border border-aegean/12 bg-foam p-5 md:p-6">
              <VehicleBookingCalendar
                vehicleSlug={vehicle.slug}
                rateKey={vehicle.rateKey}
                fromPrice={offerPrice}
              />
            </div>
          </aside>

          <div className="min-w-0">
            <section className="border-t border-aegean/10 pt-8">
              <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-aegean/45">
                {t("specs")}
              </h2>
              <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-aegean/80">
                {specs.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>

            <div className="mt-10">
              <VehiclePricingTable
                rateKey={vehicle.rateKey}
                category={vehicle.category as "car" | "scooter"}
                locale={locale}
              />
            </div>

            <section className="mt-10 border-t border-aegean/10 pt-8">
              <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-aegean/45">
                {t("termsTitle")}
              </h2>
              <ul className="mt-4 space-y-2 text-sm leading-relaxed text-aegean/70">
                <li>
                  {t("termsAge", {
                    min: business.terms.minAge,
                    max: business.terms.maxAge,
                  })}
                </li>
                <li>{t("termsLicence", { years: business.terms.minLicenceYears })}</li>
                <li>
                  {vehicle.category === "scooter" ? t("termsPickupScooter") : t("termsPickupCar")}
                </li>
                <li>{t("termsTpl")}</li>
                <li>{t("termsNoPrepay")}</li>
              </ul>
              <Link
                href="/terms"
                className="mt-4 inline-block text-sm font-semibold text-aegean underline-offset-4 hover:underline"
              >
                {t("termsFull")}
              </Link>
              <p className="mt-3 text-xs text-aegean/45">{terms("fuelBody")}</p>
            </section>
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-20 border-t border-aegean/10 pt-14">
            <h2 className="text-title text-aegean">{t("relatedTitle")}</h2>
            <div className="stagger-children mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((v) => (
                <VehicleCard key={v.slug} vehicle={v} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
