import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { JsonLd } from "@/components/JsonLd";
import { getBlogPost, getBlogPosts, markdownToHtml } from "@/lib/content";
import { buildMetadata, absoluteUrl } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";

export function generateStaticParams() {
  return (["en", "el"] as const).flatMap((locale) =>
    getBlogPosts(locale).map((p) => ({ locale, slug: p.slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const post = getBlogPost(locale as Locale, slug);
  if (!post) return {};
  return buildMetadata({
    locale: locale as Locale,
    title: `${post.title} | Artemis Rental`,
    description: post.description,
    path: `/blog/${slug}`,
    type: "article",
  });
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const loc = locale as Locale;
  const post = getBlogPost(loc, slug);
  if (!post) notFound();
  const t = await getTranslations("Blog");
  const html = markdownToHtml(post.content);

  return (
    <article className="mx-auto max-w-3xl px-4 pb-20 pt-28 md:px-6">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          description: post.description,
          datePublished: post.datePublished,
          dateModified: post.dateModified ?? post.datePublished,
          author: { "@type": "Organization", name: "Artemis Rental" },
          mainEntityOfPage: absoluteUrl(loc, `/blog/${slug}`),
          inLanguage: loc === "el" ? "el-GR" : "en-US",
        }}
      />
      <Link href="/blog" className="text-sm font-medium text-olive">
        ← {t("title")}
      </Link>
      <h1 className="mt-4 font-display text-4xl text-aegean md:text-5xl">{post.title}</h1>
      <p className="mt-3 text-sm text-aegean/55">
        {t("minRead", { minutes: post.readingMinutes })}
        {post.datePublished ? ` · ${post.datePublished}` : ""}
      </p>
      <div className="prose-artemis mt-10" dangerouslySetInnerHTML={{ __html: html }} />
    </article>
  );
}
