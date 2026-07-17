import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { JsonLd } from "@/components/JsonLd";
import { getGuideArticles } from "@/lib/content";
import { buildMetadata, absoluteUrl } from "@/lib/seo";
import { tripPlannerUrl } from "@/lib/site";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Guide" });
  return buildMetadata({
    locale: locale as Locale,
    title: `${t("title")} | Artemis Rental`,
    description: t("lead"),
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
  const articles = getGuideArticles(locale as Locale);
  const loc = locale as Locale;

  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 pt-28 md:px-6">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: t("title"),
          url: absoluteUrl(loc, "/sifnos-guide"),
          about: { "@type": "TouristDestination", name: "Sifnos" },
        }}
      />
      <h1 className="font-display text-4xl text-aegean md:text-5xl">{t("title")}</h1>
      <p className="mt-4 max-w-2xl text-lg text-aegean/75">{t("lead")}</p>
      <a
        href={tripPlannerUrl(locale, "Plan a Sifnos and Cyclades itinerary")}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 inline-flex text-sm font-semibold text-olive underline-offset-4 hover:underline"
      >
        {t("planTrip")}
      </a>
      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {articles.map((article) => (
          <article key={article.slug} className="border-t border-aegean/15 pt-5">
            <h2 className="font-display text-2xl text-aegean">
              <Link href={`/sifnos-guide/${article.slug}`}>{article.title}</Link>
            </h2>
            <p className="mt-2 text-aegean/70">{article.answer ?? article.description}</p>
            <Link
              href={`/sifnos-guide/${article.slug}`}
              className="mt-4 inline-block text-sm font-semibold text-olive"
            >
              {t("read")} →
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
