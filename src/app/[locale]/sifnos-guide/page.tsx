import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { PexelsCover } from "@/components/PexelsCover";
import { getGuideArticles } from "@/lib/content";
import { buildMetadata, absoluteUrl, itemListJsonLd } from "@/lib/seo";
import { getDiscoverHubLinks } from "@/lib/guide-discover";
import { sifnosGuideDcUrl, tripPlannerUrl } from "@/lib/site";
import type { Locale } from "@/i18n/routing";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const seo = await getTranslations({ locale, namespace: "Seo" });
  return buildMetadata({
    locale: locale as Locale,
    title: seo("guide.title"),
    description: seo("guide.description"),
    path: "/sifnos-guide",
  });
}

export default async function GuideIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Guide");
  const footer = await getTranslations("Footer");
  const articles = getGuideArticles(locale as Locale);
  const loc = locale as Locale;
  const dcLinks = getDiscoverHubLinks(locale);

  return (
    <div className="container-site page-hero pb-20">
      <Breadcrumbs locale={loc} items={[{ label: t("title") }]} />
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: t("title"),
            url: absoluteUrl(loc, "/sifnos-guide"),
            about: { "@type": "TouristDestination", name: "Sifnos" },
          },
          itemListJsonLd({
            locale: loc,
            name: t("title"),
            path: "/sifnos-guide",
            items: articles.map((a) => ({
              name: a.title,
              url: absoluteUrl(loc, `/sifnos-guide/${a.slug}`),
            })),
          }),
        ]}
      />
      <h1 className="text-display text-aegean">{t("title")}</h1>
      <p className="mt-4 max-w-2xl text-lead text-aegean/75">{t("lead")}</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <a
          href={tripPlannerUrl(locale, "Plan a Sifnos and Cyclades itinerary")}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary"
        >
          {t("planTrip")}
        </a>
        <a
          href={sifnosGuideDcUrl(locale)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center rounded-full border border-aegean/20 px-5 py-3 text-sm font-semibold text-aegean transition hover:bg-aegean/5"
        >
          {t("externalDc")}
        </a>
      </div>
      <div className="mt-8 flex flex-wrap gap-2">
        {dcLinks.map((link) => (
          <a
            key={link.labelKey}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-aegean/12 bg-foam/70 px-3 py-1.5 text-xs font-medium text-aegean/75 transition hover:border-aegean/30 hover:text-aegean"
          >
            {footer(link.labelKey)} ↗
          </a>
        ))}
      </div>
      <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <article key={article.slug} className="overflow-hidden rounded-2xl outline outline-aegean/10">
            <div className="relative aspect-[16/10] bg-limestone/50">
              {article.cover ? (
                <PexelsCover
                  src={article.cover}
                  alt={article.title}
                  href={`/sifnos-guide/${article.slug}`}
                  sizes="(max-width:768px) 100vw, 33vw"
                  locale={locale}
                />
              ) : (
                <Link href={`/sifnos-guide/${article.slug}`} className="absolute inset-0" />
              )}
            </div>
            <Link href={`/sifnos-guide/${article.slug}`} className="block p-5">
              <h2 className="font-display text-xl text-aegean">{article.title}</h2>
              <p className="mt-2 line-clamp-3 text-sm text-aegean/70">
                {article.answer ?? article.description}
              </p>
              <span className="mt-4 inline-block text-sm font-semibold text-olive">
                {t("read")} →
              </span>
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
