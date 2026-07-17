import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { JsonLd } from "@/components/JsonLd";
import { getCars, getVehicleBySlug, getLowestRate, getRateRow } from "@/lib/fleet";
import { buildMetadata, absoluteUrl } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";
import type { Locale } from "@/i18n/routing";

export function generateStaticParams() {
  return getCars().flatMap((car) =>
    (["en", "el"] as const).map((locale) => ({ locale, slug: car.slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const vehicle = getVehicleBySlug(slug);
  if (!vehicle) return {};
  return buildMetadata({
    locale: locale as Locale,
    title: `${vehicle.name} | Artemis Rental Sifnos`,
    description: `Rent a ${vehicle.name} in Sifnos with Artemis Rental. Pickup in Apollonia, Kamares on request.`,
    path: `/cars/${slug}`,
    image: vehicle.image,
  });
}

export default async function CarDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const vehicle = getVehicleBySlug(slug);
  if (!vehicle || vehicle.category !== "car") notFound();
  const t = await getTranslations("Fleet");
  const lowest = getLowestRate(vehicle.rateKey);
  const rates = getRateRow(vehicle.rateKey);
  const loc = locale as Locale;

  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 pt-28 md:px-6">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: vehicle.name,
          image: `${SITE_URL}${vehicle.image}`,
          brand: "Artemis Rental",
          url: absoluteUrl(loc, `/cars/${slug}`),
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
      <Link href="/cars" className="text-sm font-medium text-olive">
        ← {t("backToCars")}
      </Link>
      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-limestone">
          <Image src={vehicle.image} alt={vehicle.name} fill className="object-cover" sizes="(max-width:1024px) 100vw, 50vw" priority />
        </div>
        <div>
          <h1 className="font-display text-4xl text-aegean md:text-5xl">{vehicle.name}</h1>
          <p className="mt-4 text-lg font-semibold text-olive">
            {lowest ? t("fromDay", { price: lowest }) : t("contactForPrice")}
          </p>
          <h2 className="mt-8 font-display text-2xl text-aegean">{t("specs")}</h2>
          <ul className="mt-3 space-y-2 text-aegean/80">
            {vehicle.engineCc && <li>{t("cc", { cc: vehicle.engineCc })}</li>}
            <li>{t("seats", { count: vehicle.seats })}</li>
            <li>{vehicle.transmission === "automatic" ? t("automatic") : t("manual")}</li>
            <li>{t("petrol")}</li>
          </ul>
          {rates && (
            <p className="mt-4 text-sm text-aegean/65">
              {t("relatedRates")}: €{rates.low}–€{rates.peak}/day
            </p>
          )}
          <Link
            href={`/book?vehicle=${vehicle.slug}`}
            className="mt-8 inline-flex rounded-full bg-aegean px-6 py-3 text-sm font-semibold text-foam"
          >
            {t("bookThis")}
          </Link>
        </div>
      </div>
    </div>
  );
}
