import { getTranslations, setRequestLocale } from "next-intl/server";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ReviewsList } from "@/components/ReviewsList";
import { ReviewsSummary } from "@/components/ReviewsSummary";
import { getReviewLanguages, getReviews, REVIEW_COUNT, REVIEW_PROFILE_URL, REVIEW_RATING } from "@/lib/reviews";
import { buildMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const seo = await getTranslations({ locale, namespace: "Seo" });
  return buildMetadata({
    locale: locale as Locale,
    title: seo("reviews.title"),
    description: seo("reviews.description"),
    path: "/reviews",
    brand: "always",
  });
}

export default async function ReviewsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Reviews");

  return (
    <div className="container-site page-hero pb-20">
      <Breadcrumbs locale={locale as Locale} items={[{ label: t("title") }]} />

      <div className="mt-6 flex flex-wrap items-end justify-between gap-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-aegean/45">
            {t("eyebrow")}
          </p>
          <h1 className="mt-3 text-display text-aegean">{t("title")}</h1>
          <p className="mt-4 max-w-2xl text-lead text-aegean/75">{t("lead")}</p>
        </div>
        <ReviewsSummary />
      </div>

      <div className="mt-12">
        <ReviewsList
          reviews={getReviews()}
          languages={getReviewLanguages()}
          locale={locale}
        />
      </div>

      <div className="mt-12 flex flex-wrap justify-center gap-4">
        <a
          href={REVIEW_PROFILE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary"
        >
          {t("viewOnGoogle")}
        </a>
      </div>

      {/*
        No Review or AggregateRating JSON-LD here. Google has not shown review rich
        results for self-serving LocalBusiness markup since 2019, and separately
        excludes reviews aggregated from third-party sites. The accurate rating lives
        once on the AutoRental node in the layout graph; repeating it per page would
        add no eligibility and risks looking like inflation.
      */}
      <p className="mt-10 text-center text-xs text-aegean/45">
        {t("basedOn", { count: REVIEW_COUNT })} · {REVIEW_RATING.toFixed(1)} / 5
      </p>
    </div>
  );
}
