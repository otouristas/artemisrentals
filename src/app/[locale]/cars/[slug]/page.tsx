import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { VehicleDetail } from "@/components/VehicleDetail";
import { getCars, getVehicleBySlug, localizeField } from "@/lib/fleet";
import { buildMetadata } from "@/lib/seo";
import { routing, type Locale } from "@/i18n/routing";

export function generateStaticParams() {
  return getCars().flatMap((car) =>
    routing.locales.map((locale) => ({ locale, slug: car.slug })),
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
  const seoDescription = localizeField(
    (vehicle as { seoDescription?: { en: string; el: string } }).seoDescription,
    locale,
  );
  return buildMetadata({
    locale: locale as Locale,
    title: `Rent ${vehicle.name} in Sifnos | Artemis Rental`,
    description:
      seoDescription ||
      `Rent a ${vehicle.name} in Sifnos with Artemis Rental. Free pickup at Kamares port and Apollonia.`,
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
  return <VehicleDetail vehicle={vehicle} locale={locale as Locale} />;
}
