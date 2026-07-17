import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { JsonLd } from "@/components/JsonLd";
import { getGuideArticle, getGuideArticles, markdownToHtml } from "@/lib/content";
import { buildMetadata, absoluteUrl } from "@/lib/seo";
import { tripPlannerUrl } from "@/lib/site";
import fanout from "../../../../../content/seo/fanout.json";
import type { Locale } from "@/i18n/routing";

export function generateStaticParams() {
  return (["en", "el"] as const).flatMap((locale) =>
    getGuideArticles(locale).map((a) => ({ locale, slug: a.slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const article = getGuideArticle(locale as Locale, slug);
  if (!article) return {};
  return buildMetadata({
    locale: locale as Locale,
    title: `${article.title} | Artemis Rental`,
    description: article.description,
    path: `/sifnos-guide/${slug}`,
    type: "article",
  });
}

export default async function GuideArticlePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const loc = locale as Locale;
  const article = getGuideArticle(loc, slug);
  if (!article) notFound();
  const t = await getTranslations("Guide");
  const html = markdownToHtml(article.content);
  const cluster = fanout.clusters.find((c) => c.guideSlug === slug);
  const related = cluster?.queries[loc] ?? [];

  return (
    <article className="mx-auto max-w-3xl px-4 pb-20 pt-28 md:px-6">
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: article.title,
            description: article.description,
            dateModified: article.dateModified,
            inLanguage: loc === "el" ? "el-GR" : "en-US",
            mainEntityOfPage: absoluteUrl(loc, `/sifnos-guide/${slug}`),
            author: { "@type": "Organization", name: "Artemis Rental" },
          },
          ...(related.length
            ? [
                {
                  "@context": "https://schema.org",
                  "@type": "FAQPage",
                  mainEntity: related.map((q) => ({
                    "@type": "Question",
                    name: q,
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: article.answer ?? article.description,
                    },
                  })),
                },
              ]
            : []),
        ]}
      />
      <Link href="/sifnos-guide" className="text-sm font-medium text-olive">
        ← {t("title")}
      </Link>
      <h1 className="mt-4 font-display text-4xl text-aegean md:text-5xl">{article.title}</h1>
      {article.answer && (
        <p className="mt-6 rounded-2xl bg-limestone/70 px-5 py-4 text-lg text-aegean/90">
          {article.answer}
        </p>
      )}
      <div
        className="prose-artemis mt-10"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      {related.length > 0 && (
        <section className="mt-12 border-t border-aegean/15 pt-8">
          <h2 className="font-display text-2xl text-aegean">{t("related")}</h2>
          <ul className="mt-4 space-y-2">
            {related.map((q) => (
              <li key={q} className="text-aegean/80">
                • {q}
              </li>
            ))}
          </ul>
        </section>
      )}
      <a
        href={tripPlannerUrl(locale, `Help me plan Sifnos: ${article.title}`)}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-10 inline-flex rounded-full bg-aegean px-6 py-3 text-sm font-semibold text-foam"
      >
        {t("planTrip")}
      </a>
    </article>
  );
}
