import { renderOgImage, ogSize, ogContentType, ogHomeTitle } from "@/lib/og";
import { routing } from "@/i18n/routing";

export const alt = "Artemis Rental: Sifnos";
export const size = ogSize;
export const contentType = ogContentType;
export const dynamic = "force-static";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return renderOgImage({ title: ogHomeTitle(locale), locale });
}
