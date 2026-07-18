import { getBlogPost, getBlogPosts } from "@/lib/content";
import { renderOgImage, ogSize, ogContentType } from "@/lib/og";
import { routing, type Locale } from "@/i18n/routing";

export const alt = "Artemis Rental blog";
export const size = ogSize;
export const contentType = ogContentType;
export const dynamic = "force-static";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    getBlogPosts(locale).map((p) => ({ locale, slug: p.slug })),
  );
}

export default async function Image({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const post = getBlogPost(locale as Locale, slug);
  return renderOgImage({
    title: post?.title ?? "Artemis Rental Blog",
    eyebrow: "Blog",
    locale,
  });
}
