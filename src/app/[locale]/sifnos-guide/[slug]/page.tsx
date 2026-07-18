import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { GuideDiscoverLinks } from "@/components/GuideDiscoverLinks";
import { JsonLd } from "@/components/JsonLd";
import {
  extractToc,
  getGuideArticle,
  getGuideArticles,
  getRelatedArticles,
  markdownToHtml,
} from "@/lib/content";
import { buildMetadata, absoluteUrl } from "@/lib/seo";
import { tripPlannerUrl, SITE_URL } from "@/lib/site";
import fanout from "../../../../../content/seo/fanout.json";
import { routing, type Locale } from "@/i18n/routing";
import { bcp47 } from "@/lib/i18n-locale";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
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
    image: article.cover,
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
  const common = await getTranslations("Common");
  const html = markdownToHtml(article.content);
  const toc = extractToc(article.content);
  const relatedContent = getRelatedArticles(loc, "guide", article);
  const cluster = fanout.clusters.find((c) => c.guideSlug === slug);
  const related = cluster?.queries[loc] ?? [];

  return (
    <article className="container-site page-hero pb-20">
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: article.title,
            description: article.description,
            dateModified: article.dateModified,
            image: article.cover ? `${SITE_URL}${article.cover}` : undefined,
            inLanguage: bcp47(loc),
            mainEntityOfPage: absoluteUrl(loc, `/sifnos-guide/${slug}`),
            author: { "@type": "Organization", name: article.author ?? "Artemis Rental" },
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
      <Breadcrumbs
        locale={loc}
        items={[
          { label: t("title"), href: "/sifnos-guide" },
          { label: article.title },
        ]}
      />
      {article.cover ? (
        <div className="relative mt-4 aspect-[21/9] overflow-hidden rounded-3xl">
          <Image
            src={article.cover}
            alt={article.title}
            fill
            className="object-cover"
            sizes="100vw"
            loading="eager"
            fetchPriority="high"
          />
        </div>
      ) : null}
      <h1 className="mt-8 text-display text-aegean">{article.title}</h1>
      {article.answer && (
        <p className="mt-6 rounded-2xl bg-limestone/70 px-5 py-4 text-lg text-aegean/90">
          {article.answer}
        </p>
      )}

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_220px]">
        <div className="prose-artemis" dangerouslySetInnerHTML={{ __html: html }} />
        {toc.length > 0 ? (
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-aegean/50">
              {common("toc")}
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              {toc.map((item) => (
                <li key={item.id} className={item.level === 3 ? "pl-3" : undefined}>
                  <a href={`#${item.id}`} className="text-aegean/70 hover:text-aegean">
                    {item.text}
                  </a>
                </li>
              ))}
            </ul>
          </aside>
        ) : null}
      </div>

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

      {relatedContent.length > 0 ? (
        <section className="mt-12 border-t border-aegean/12 pt-8">
          <h2 className="font-display text-2xl text-aegean">{common("related")}</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {relatedContent.map((r) => (
              <Link key={r.slug} href={`/sifnos-guide/${r.slug}`} className="border-t border-aegean/12 pt-4">
                <p className="font-display text-lg text-aegean">{r.title}</p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <GuideDiscoverLinks locale={locale} slug={slug} />

      <a
        href={tripPlannerUrl(locale, `Help me plan Sifnos: ${article.title}`)}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-primary mt-10"
      >
        {t("planTrip")}
      </a>
    </article>
  );
}
