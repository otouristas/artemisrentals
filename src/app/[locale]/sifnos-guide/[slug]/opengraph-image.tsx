import { getGuideArticle, getGuideArticles } from "@/lib/content";
import { renderOgImage, ogSize, ogContentType, ogGuideEyebrow } from "@/lib/og";
import { routing, type Locale } from "@/i18n/routing";

export const alt = "Sifnos Guide: Artemis Rental";
export const size = ogSize;
export const contentType = ogContentType;
export const dynamic = "force-static";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    getGuideArticles(locale).map((a) => ({ locale, slug: a.slug })),
  );
}

export default async function Image({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const article = getGuideArticle(locale as Locale, slug);
  return renderOgImage({
    title: article?.title ?? "Sifnos Guide",
    eyebrow: ogGuideEyebrow(locale),
    locale,
  });
}
