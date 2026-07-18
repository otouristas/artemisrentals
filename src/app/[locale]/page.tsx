import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Hero } from "@/components/Hero";
import { VehicleCard } from "@/components/VehicleCard";
import { TouristasOpenButton } from "@/components/TouristasOpenButton";
import { JsonLd } from "@/components/JsonLd";
import { getCars, getScooters } from "@/lib/fleet";
import testimonials from "../../../content/data/testimonials.json";
import { buildMetadata, absoluteUrl, businessJsonLd } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Meta" });
  return buildMetadata({
    locale: locale as Locale,
    title: t("homeTitle"),
    description: t("homeDescription"),
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
  const cars = getCars().slice(0, 3);
  const scooters = getScooters().slice(0, 3);
  const loc = locale as Locale;

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          "@id": `${absoluteUrl(loc)}/#webpage`,
          url: absoluteUrl(loc),
          name: t("brand"),
          about: businessJsonLd(),
          inLanguage: loc === "el" ? "el-GR" : "en-US",
        }}
      />
      <Hero />

      <section className="mx-auto max-w-6xl px-4 py-20 md:px-6">
        <div className="max-w-2xl">
          <h2 className="font-display text-3xl text-aegean md:text-4xl">{t("whyTitle")}</h2>
          <p className="mt-3 text-aegean/75">{t("whyBody")}</p>
        </div>
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
      </section>

      <section className="bg-aegean/5 py-20">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-3xl text-aegean md:text-4xl">{t("fleetTitle")}</h2>
              <p className="mt-3 max-w-xl text-aegean/75">{t("fleetBody")}</p>
            </div>
            <div className="flex gap-3">
              <Link href="/cars" className="text-sm font-semibold text-olive underline-offset-4 hover:underline">
                {t("viewCars")}
              </Link>
              <Link href="/scooters" className="text-sm font-semibold text-olive underline-offset-4 hover:underline">
                {t("viewScooters")}
              </Link>
            </div>
          </div>
          <div className="stagger-children mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...cars, ...scooters].map((v) => (
              <VehicleCard key={v.slug} vehicle={v} />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 md:px-6">
        <h2 className="font-display text-3xl text-aegean md:text-4xl">{t("reviewsTitle")}</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {testimonials.slice(0, 3).map((r) => (
            <blockquote key={r.name} className="rounded-3xl bg-foam/70 p-6 ring-1 ring-aegean/8">
              <p className="text-aegean/80">
                “{r.quote[loc === "el" ? "el" : "en"]}”
              </p>
              <footer className="mt-4 flex items-center gap-3">
                <Image src={r.avatar} alt="" width={40} height={40} className="rounded-full" />
                <div>
                  <p className="font-semibold text-aegean">{r.name}</p>
                  <p className="text-xs text-aegean/55">{r.year}</p>
                </div>
              </footer>
            </blockquote>
          ))}
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
        <div className="relative mx-auto max-w-6xl px-4 md:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sun">
            {t("touristasTitle")}
          </p>
          <h2 className="mt-3 max-w-xl font-display text-3xl text-foam md:text-5xl">
            {t("touristasTitle")}
          </h2>
          <p className="mt-4 max-w-lg text-foam/80">{t("touristasBody")}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <TouristasOpenButton className="rounded-full bg-sun px-6 py-3 text-sm font-semibold text-aegean transition hover:brightness-105" />
            <Link
              href="/sifnos-guide"
              className="rounded-full border border-foam/40 px-6 py-3 text-sm font-semibold text-foam transition hover:bg-foam/10"
            >
              {t("guideCta")}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
