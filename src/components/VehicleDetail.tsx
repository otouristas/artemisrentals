import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { VehicleCard } from "@/components/VehicleCard";
import { VehicleBookingCalendar } from "@/components/VehicleBookingCalendar";
import { JsonLd } from "@/components/JsonLd";
import {
  getLowestRate,
  getRateRow,
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
  const rates = getRateRow(vehicle.rateKey);
  const related = getRelatedVehicles(vehicle.slug);
  const description = localizeField(
    (vehicle as { description?: { en: string; el: string } }).description,
    locale,
  );
  const highlights =
    (vehicle as { highlights?: { en: string[]; el: string[] } }).highlights?.[
      locale === "el" ? "el" : "en"
    ] ?? [];
  const backHref = vehicle.category === "car" ? "/cars" : "/scooters";
  const backLabel = vehicle.category === "car" ? t("backToCars") : t("backToScooters");
  const path =
    vehicle.category === "car" ? `/cars/${vehicle.slug}` : `/scooters/${vehicle.slug}`;

  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 pt-28 md:px-6">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: vehicle.name,
          description: description || undefined,
          image: `${SITE_URL}${vehicle.image}`,
          brand: "Artemis Rental",
          url: absoluteUrl(locale, path),
          offers: lowest
            ? {
                "@type": "Offer",
                priceCurrency: "EUR",
                price: lowest,
                availability: "https://schema.org/InStock",
              }
            : undefined,
        }}
      />
      <Link href={backHref} className="text-sm font-medium text-olive">
        ← {backLabel}
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-limestone/80 p-4">
          <Image
            src={vehicle.image}
            alt={vehicle.name}
            fill
            className="object-contain p-4"
            sizes="(max-width:1024px) 100vw, 50vw"
            priority
          />
        </div>
        <div>
          <h1 className="font-display text-4xl text-aegean md:text-5xl">{vehicle.name}</h1>
          <p className="mt-4 text-lg font-semibold text-olive">
            {lowest ? t("fromDay", { price: lowest }) : t("contactForPrice")}
          </p>
          {description ? <p className="mt-4 text-aegean/80">{description}</p> : null}
          {highlights.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-2">
              {highlights.filter(Boolean).map((h) => (
                <li
                  key={h}
                  className="rounded-full border border-aegean/12 bg-salt px-3 py-1 text-xs font-medium text-aegean/80"
                >
                  {h}
                </li>
              ))}
            </ul>
          )}
          <h2 className="mt-8 font-display text-2xl text-aegean">{t("specs")}</h2>
          <ul className="mt-3 space-y-2 text-aegean/80">
            {vehicle.engineCc ? <li>{t("cc", { cc: vehicle.engineCc })}</li> : null}
            <li>{t("seats", { count: vehicle.seats })}</li>
            <li>{vehicle.transmission === "automatic" ? t("automatic") : t("manual")}</li>
            <li>{t("petrol")}</li>
          </ul>
          {rates && (
            <p className="mt-4 text-sm text-aegean/65">
              {t("relatedRates")}: €{rates.low}–€{rates.peak}/day
            </p>
          )}
        </div>
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <VehicleBookingCalendar vehicleSlug={vehicle.slug} rateKey={vehicle.rateKey} />
        <div className="rounded-2xl bg-aegean px-5 py-6 text-foam">
          <h2 className="font-display text-2xl">{t("termsTitle")}</h2>
          <ul className="mt-4 space-y-2 text-sm text-foam/85">
            <li>
              {t("termsAge", {
                min: business.terms.minAge,
                max: business.terms.maxAge,
              })}
            </li>
            <li>{t("termsLicence", { years: business.terms.minLicenceYears })}</li>
            <li>
              {t("termsPickup", {
                default: business.terms.pickupDefault,
                alternate: business.terms.pickupAlternate,
              })}
            </li>
            <li>{t("termsNoPrepay")}</li>
          </ul>
          <Link
            href="/terms"
            className="mt-5 inline-block text-sm font-semibold text-sun underline-offset-4 hover:underline"
          >
            {t("termsFull")}
          </Link>
          <p className="mt-4 text-xs text-foam/55">{terms("fuelBody")}</p>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="font-display text-3xl text-aegean">{t("relatedTitle")}</h2>
          <div className="stagger-children mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((v) => (
              <VehicleCard key={v.slug} vehicle={v} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
