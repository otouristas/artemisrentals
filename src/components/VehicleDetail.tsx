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
  isScooterBookingEnabled,
  localizeField,
  type Vehicle,
} from "@/lib/fleet";
import { ScooterBookingNotice } from "@/components/ScooterBookingNotice";
import { ReviewCard } from "@/components/ReviewCard";
import { ReviewsSummary } from "@/components/ReviewsSummary";
import { getReviewForVehicle, REVIEW_COUNT, REVIEW_RATING } from "@/lib/reviews";
import {
  ChatIcon,
  CheckIcon,
  EngineIcon,
  FerryIcon,
  FuelIcon,
  GearIcon,
  HelmetIcon,
  PinIcon,
  SeatIcon,
  ShieldIcon,
  StarIcon,
  WalletIcon,
  WrenchIcon,
} from "@/components/icons";
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
  const reviewsT = await getTranslations("Reviews");
  const book = await getTranslations("Book");
  const common = await getTranslations("Common");
  // Prefers a review naming this model, otherwise a general one. Never fabricates
  // per-model coverage: only the Suzuki Ignis is named in a real review.
  const review = getReviewForVehicle(vehicle.slug);
  const lowest = getLowestRate(vehicle.rateKey);
  const { price: todayRate } = getCurrentSeasonRate(vehicle.rateKey);
  const offerPrice = todayRate ?? lowest;
  const related = getRelatedVehicles(vehicle.slug);
  const description = localizeField(
    (vehicle as { description?: { en: string; el: string } }).description,
    locale,
  );
  const seoDescription = localizeField(
    (vehicle as { seoDescription?: Partial<Record<string, string>> }).seoDescription,
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
  const scooterPaused =
    vehicle.category === "scooter" && !isScooterBookingEnabled();

  const specs = [
    { icon: SeatIcon, label: t("seats", { count: vehicle.seats }) },
    { icon: GearIcon, label: vehicle.transmission === "automatic" ? t("automatic") : t("manual") },
    vehicle.engineCc ? { icon: EngineIcon, label: t("cc", { cc: vehicle.engineCc }) } : null,
    { icon: FuelIcon, label: t("petrol") },
  ].filter((s): s is { icon: typeof SeatIcon; label: string } => s != null);

  const included = [
    { icon: ShieldIcon, label: book("includedTpl") },
    { icon: WrenchIcon, label: book("includedMaintenance") },
    vehicle.category === "scooter"
      ? { icon: HelmetIcon, label: book("includedHelmets") }
      : { icon: FerryIcon, label: book("freePortPickup") },
    { icon: WalletIcon, label: common("trustNoPrepay") },
    { icon: ChatIcon, label: book("includedLocalHelp") },
  ];

  return (
    <div className="bg-foam">
      <div className="container-site page-hero pb-28 md:pb-20">
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "Product",
            name: `${vehicle.name} rental Sifnos`,
            description: seoDescription || description || undefined,
            image: `${SITE_URL}${vehicle.image}`,
            brand: { "@type": "Brand", name: "Artemis Rental" },
            url: absoluteUrl(locale, path),
            offers: offerPrice
              ? {
                  "@type": "Offer",
                  priceCurrency: "EUR",
                  price: offerPrice,
                  availability: scooterPaused
                    ? "https://schema.org/OutOfStock"
                    : "https://schema.org/InStock",
                  priceValidUntil: `${new Date().getFullYear()}-12-31`,
                  url: absoluteUrl(locale, path),
                  // Ties the offer back to the AutoRental node in the layout graph,
                  // so the vehicle inherits the business trust signals.
                  seller: { "@id": `${SITE_URL}/#business` },
                  areaServed: { "@type": "Place", name: "Sifnos, Cyclades, Greece" },
                  availableAtOrFrom: {
                    "@type": "Place",
                    name: `Artemis Rental, ${business.address.streetAddress}`,
                    address: { "@type": "PostalAddress", ...business.address },
                  },
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

        <div className="mt-6 overflow-hidden rounded-3xl border border-line bg-foam">
          <div className="relative aspect-[16/10] md:aspect-[21/9]">
            <Image
              src={vehicle.image}
              alt={vehicle.name}
              fill
              className="object-contain object-center p-4 md:p-10"
              sizes="(max-width:1024px) 100vw, 72rem"
              preload
            />
          </div>
        </div>

        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(320px,23rem)] lg:items-start lg:gap-x-14">
          <div className="min-w-0">
            <h1 className="text-4xl font-bold tracking-tight text-aegean md:text-5xl">{vehicle.name}</h1>
            <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[15px] text-aegean/70">
              <a
                href="#reviews"
                className="inline-flex items-center gap-1 font-semibold text-aegean underline-offset-4 hover:underline"
              >
                <StarIcon className="h-4 w-4" />
                {REVIEW_RATING.toFixed(1)}
                <span className="font-normal text-aegean/60">
                  ({reviewsT("basedOn", { count: REVIEW_COUNT })})
                </span>
              </a>
              <span aria-hidden>·</span>
              <span className="inline-flex items-center gap-1">
                <PinIcon className="h-4 w-4" />
                {common("trustPlace")}
              </span>
            </p>

            <ul className="mt-5 flex flex-wrap gap-2">
              {specs.map(({ icon: Icon, label }) => (
                <li key={label} className="chip text-[13px]">
                  <Icon className="h-4 w-4" />
                  {label}
                </li>
              ))}
            </ul>

            <section className="mt-8 flex items-center gap-4 border-t border-line pt-8">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-line bg-surface">
                <Image src="/images/brand/symbol.svg" alt="" width={32} height={32} className="h-8 w-8" />
              </span>
              <div>
                <p className="text-lg font-semibold text-aegean">Artemis Rental</p>
                <p className="text-sm text-aegean/60">
                  {common("trustFamily")} · {common("trustSince", { year: business.since })}
                </p>
              </div>
            </section>

            {description || highlights.length > 0 ? (
              <section className="mt-8 border-t border-line pt-8">
                {description ? (
                  <p className="max-w-2xl text-[17px] leading-relaxed text-aegean/75">{description}</p>
                ) : null}
                {highlights.length > 0 && (
                  <ul className="mt-5 flex flex-wrap gap-2">
                    {highlights.filter(Boolean).map((h) => (
                      <li key={h} className="rounded-md bg-surface px-2.5 py-1 text-xs font-medium text-aegean/80">
                        {h}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ) : null}

            <section className="mt-8 border-t border-line pt-8">
              <h2 className="text-xl font-semibold text-aegean">{book("includedTitle")}</h2>
              <ul className="mt-5 grid gap-4 sm:grid-cols-2">
                {included.map(({ icon: Icon, label }) => (
                  <li key={label} className="flex items-start gap-3 text-[15px] text-aegean/80">
                    <Icon className="mt-0.5 h-5 w-5 shrink-0 text-aegean" />
                    {label}
                  </li>
                ))}
              </ul>
            </section>

            <div className="mt-8">
              <VehiclePricingTable
                rateKey={vehicle.rateKey}
                category={vehicle.category as "car" | "scooter"}
                locale={locale}
              />
            </div>

            <section className="mt-8 border-t border-line pt-8">
              <h2 className="text-xl font-semibold text-aegean">{t("termsTitle")}</h2>
              <ul className="mt-4 space-y-2.5 text-[15px] leading-relaxed text-aegean/75">
                {[
                  t("termsAge", { min: business.terms.minAge, max: business.terms.maxAge }),
                  t("termsLicence", { years: business.terms.minLicenceYears }),
                  vehicle.category === "scooter" ? t("termsPickupScooter") : t("termsPickupCar"),
                  t("termsTpl"),
                  t("termsNoPrepay"),
                ].map((line) => (
                  <li key={line} className="flex items-start gap-2.5">
                    <CheckIcon className="mt-1 h-4 w-4 shrink-0 text-olive" />
                    {line}
                  </li>
                ))}
              </ul>
              <Link
                href="/terms"
                className="mt-4 inline-block text-sm font-semibold text-aegean underline underline-offset-4"
              >
                {t("termsFull")}
              </Link>
              <p className="mt-3 text-xs text-aegean/45">{terms("fuelBody")}</p>
            </section>

            <section id="reviews" className="mt-8 scroll-mt-28 border-t border-line pt-8">
              <h2 className="text-xl font-semibold text-aegean">{reviewsT("vehicleTitle")}</h2>
              <ReviewsSummary className="mt-5" />
              {review ? (
                <div className="mt-5 max-w-xl">
                  <ReviewCard review={review} locale={locale} expandable={false} />
                </div>
              ) : null}
            </section>
          </div>

          <aside className="lg:sticky lg:top-28 lg:self-start">
            {scooterPaused ? (
              <ScooterBookingNotice variant="panel" />
            ) : (
              <div className="panel p-5 shadow-[0_12px_32px_rgba(11,42,60,0.08)] md:p-6">
                <VehicleBookingCalendar
                  vehicleSlug={vehicle.slug}
                  rateKey={vehicle.rateKey}
                  fromPrice={offerPrice}
                />
              </div>
            )}
          </aside>
        </div>

        {related.length > 0 && (
          <section className="mt-16 border-t border-line pt-12">
            <h2 className="text-2xl font-semibold text-aegean">{t("relatedTitle")}</h2>
            <div className="stagger-children mt-6 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
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
