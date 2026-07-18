import { getScooters, getVehicleBySlug } from "@/lib/fleet";
import {
  renderOgImage,
  ogSize,
  ogContentType,
  ogScooterFallback,
  ogScooterEyebrow,
} from "@/lib/og";
import { routing } from "@/i18n/routing";

export const alt = "Artemis Rental scooter";
export const size = ogSize;
export const contentType = ogContentType;
export const dynamic = "force-static";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    getScooters().map((s) => ({ locale, slug: s.slug })),
  );
}

export default async function Image({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const vehicle = getVehicleBySlug(slug);
  const title = vehicle?.name ?? ogScooterFallback(locale);
  return renderOgImage({
    title,
    eyebrow: ogScooterEyebrow(locale),
    locale,
  });
}
