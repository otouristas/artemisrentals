import { getCars, getVehicleBySlug } from "@/lib/fleet";
import {
  renderOgImage,
  ogSize,
  ogContentType,
  ogFleetFallback,
  ogRentEyebrow,
} from "@/lib/og";
import { routing } from "@/i18n/routing";

export const alt = "Artemis Rental vehicle";
export const size = ogSize;
export const contentType = ogContentType;
export const dynamic = "force-static";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    getCars().map((car) => ({ locale, slug: car.slug })),
  );
}

export default async function Image({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const vehicle = getVehicleBySlug(slug);
  const title = vehicle?.name ?? ogFleetFallback(locale);
  return renderOgImage({
    title,
    eyebrow: ogRentEyebrow(locale),
    locale,
  });
}
