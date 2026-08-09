import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Hero } from "@/components/Hero";
import { Reveal } from "@/components/Reveal";
import { FleetGrid } from "@/components/FleetGrid";
import { TrustBadges } from "@/components/TrustBadges";
import { TouristasOpenButton } from "@/components/TouristasOpenButton";
import { JsonLd } from "@/components/JsonLd";
import { getCars, getScooters, isScooterBookingEnabled } from "@/lib/fleet";
import { ScooterBookingNotice } from "@/components/ScooterBookingNotice";
import { ReviewCard } from "@/components/ReviewCard";
import { ReviewsSummary } from "@/components/ReviewsSummary";
import { getReviewsWithText, reviewKey, REVIEW_COUNT } from "@/lib/reviews";
import { buildMetadata, absoluteUrl, businessJsonLd } from "@/lib/seo";
import { bcp47 } from "@/lib/i18n-locale";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const seo = await getTranslations({ locale, namespace: "Seo" });
  return buildMetadata({
    locale: locale as Locale,
    title: seo("home.title"),
    description: seo("home.description"),
    path: "",
  });
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Home");
  const reviews = await getTranslations("Reviews");
  // Two rows at lg:grid-cols-3 → up to 6 per category
  const cars = getCars().slice(0, 6);
  const scooters = getScooters().slice(0, 6);
  const loc = locale as Locale;
  const nav = await getTranslations("Nav");

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          "@id": `${absoluteUrl(loc)}/#webpage`,
          url: absoluteUrl(loc),
          name: t("headline"),
          about: businessJsonLd(),
          inLanguage: bcp47(loc),
        }}
      />
      <Hero />

      <section className="section container-site">
        <Reveal>
          <div className="max-w-2xl">
            <h2 className="text-title text-aegean">{t("whyTitle")}</h2>
            <p className="mt-3 text-lead text-aegean/75">{t("whyBody")}</p>
          </div>
        </Reveal>
        <div className="stagger-children mt-10 grid gap-8 md:grid-cols-3">
          {[
            [t("why1Title"), t("why1Body")],
            [t("why2Title"), t("why2Body")],
            [t("why3Title"), t("why3Body")],
          ].map(([title, body]) => (
            <div key={title} className="border-t border-aegean/15 pt-5">
              <h3 className="font-display text-xl text-aegean">{title}</h3>
              <p className="mt-2 text-aegean/70">{body}</p>
            </div>
          ))}
        </div>
        <TrustBadges className="mt-10" />
      </section>

      <section className="section texture-grain bg-aegean/5">
        <div className="container-site">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="text-title text-aegean">{t("fleetTitle")}</h2>
                <p className="mt-3 max-w-xl text-aegean/75">{t("fleetBody")}</p>
              </div>
            </div>
          </Reveal>
          <div className="mt-10 space-y-12">
            <div>
              <div className="mb-5 flex items-end justify-between gap-3">
                <h3 className="font-display text-2xl text-aegean">{nav("cars")}</h3>
                <Link href="/cars" className="link-underline text-sm font-semibold text-olive">
                  {t("viewCars")}
                </Link>
              </div>
              <FleetGrid vehicles={cars} />
            </div>
            <div>
              <div className="mb-5 flex items-end justify-between gap-3">
                <h3 className="font-display text-2xl text-aegean">{nav("scooters")}</h3>
                <Link href="/scooters" className="link-underline text-sm font-semibold text-olive">
                  {t("viewScooters")}
                </Link>
              </div>
              {!isScooterBookingEnabled() ? (
                <div className="mb-5">
                  <ScooterBookingNotice />
                </div>
              ) : null}
              <FleetGrid vehicles={scooters} />
            </div>
          </div>
        </div>
      </section>

      <section className="section container-site">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <h2 className="text-title text-aegean">{t("reviewsTitle")}</h2>
            <ReviewsSummary />
          </div>
        </Reveal>
        <div className="mt-10 grid items-stretch gap-6 md:grid-cols-3">
          {getReviewsWithText()
            .slice(0, 3)
            .map((review, i) => (
              <Reveal key={reviewKey(review)} delay={i * 80}>
                <ReviewCard review={review} locale={locale} expandable={false} />
              </Reveal>
            ))}
        </div>
        <div className="mt-8">
          <Link href="/reviews" className="btn-primary">
            {reviews("seeAll", { count: REVIEW_COUNT })}
          </Link>
        </div>
      </section>

      <section className="relative overflow-hidden py-24">
        <Image
          src="/images/brand/artemis-motos.jpg"
          alt=""
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-aegean/90 via-aegean/75 to-aegean/55" />
        <div className="relative container-site">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sun">
              {t("touristasTitle")}
            </p>
            <h2 className="mt-3 max-w-xl font-display text-3xl text-foam md:text-5xl">
              {t("guideTitle")}
            </h2>
            <p className="mt-4 max-w-lg text-foam/80">{t("touristasBody")}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <TouristasOpenButton className="btn-accent" />
              <Link href="/sifnos-guide" className="btn-ghost">
                {t("guideCta")}
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
