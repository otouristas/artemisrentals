import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
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
  const t = await getTranslations({ locale, namespace: "Fleet" });
  const seoDescription = localizeField(
    (vehicle as { seoDescription?: Partial<Record<Locale, string>> }).seoDescription,
    locale,
  );
  return buildMetadata({
    locale: locale as Locale,
    title: t("vehicleTitle", { name: vehicle.name }),
    description: seoDescription || t("vehicleDescription", { name: vehicle.name }),
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
