import { getTranslations, setRequestLocale } from "next-intl/server";
import { BookingForm } from "@/components/BookingForm";
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

  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 pt-28 md:px-6">
      <h1 className="font-display text-4xl text-aegean md:text-5xl">{t("title")}</h1>
      <p className="mt-4 max-w-2xl text-lg text-aegean/75">{t("lead")}</p>
      <div className="mt-10">
        <BookingForm
          locale={locale}
          defaultVehicle={vehicle}
          defaultFrom={from}
          defaultTo={to}
        />
      </div>
    </div>
  );
}
