import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { VehicleDetail } from "@/components/VehicleDetail";
import { getScooters, getVehicleBySlug, localizeField } from "@/lib/fleet";
import { buildMetadata } from "@/lib/seo";
import { routing, type Locale } from "@/i18n/routing";

export function generateStaticParams() {
  return getScooters().flatMap((s) =>
    routing.locales.map((locale) => ({ locale, slug: s.slug })),
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
    title: `${vehicle.name} | Artemis Rental Sifnos`,
    description:
      seoDescription || `Rent a ${vehicle.name} scooter in Sifnos with Artemis Rental.`,
    path: `/scooters/${slug}`,
    image: vehicle.image,
  });
}

export default async function ScooterDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const vehicle = getVehicleBySlug(slug);
  if (!vehicle || vehicle.category !== "scooter") notFound();
  return <VehicleDetail vehicle={vehicle} locale={locale as Locale} />;
}
