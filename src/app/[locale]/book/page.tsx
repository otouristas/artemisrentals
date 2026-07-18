import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { BookingWizard } from "@/components/booking/BookingWizard";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { TrustBadges } from "@/components/TrustBadges";
import { buildMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Book" });
  return buildMetadata({
    locale: locale as Locale,
    title: `${t("title")} | Artemis Rental`,
    description: t("lead"),
    path: "/book",
  });
}

export default async function BookPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ vehicle?: string; from?: string; to?: string }>;
}) {
  const { locale } = await params;
  const { vehicle, from, to } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("Book");
  const loc = locale as Locale;
  const compact = Boolean(vehicle);

  return (
    <div className={`container-site pb-28 md:pb-20 ${compact ? "pt-24 md:pt-28" : "page-hero"}`}>
      <Breadcrumbs locale={loc} items={[{ label: t("title") }]} />
      {compact ? (
        <h1 className="mt-3 font-display text-2xl text-aegean md:text-3xl">{t("title")}</h1>
      ) : (
        <>
          <h1 className="text-display text-aegean">{t("title")}</h1>
          <p className="mt-4 max-w-2xl text-lead text-aegean/75">{t("lead")}</p>
          <TrustBadges className="mt-6" />
        </>
      )}
      <div className={compact ? "mt-5" : "mt-10"}>
        <Suspense fallback={<div className="h-40 animate-pulse rounded-2xl bg-limestone/50" />}>
          <BookingWizard
            key={[vehicle, from, to].filter(Boolean).join("|") || "book"}
            locale={locale}
            defaultVehicle={vehicle}
            defaultFrom={from}
            defaultTo={to}
          />
        </Suspense>
      </div>
    </div>
  );
}
