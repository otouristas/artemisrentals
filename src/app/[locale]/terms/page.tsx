import { getTranslations, setRequestLocale } from "next-intl/server";
import { business } from "@/lib/site";
import { buildMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Terms" });
  return buildMetadata({
    locale: locale as Locale,
    title: `${t("title")} | Artemis Rental`,
    description: t("lead"),
    path: "/terms",
  });
}

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Terms");
  const isEl = locale === "el";

  const items = isEl
    ? [
        `Ηλικία οδηγού: ${business.terms.minAge}–${business.terms.maxAge} ετών.`,
        `Ισχύουσα άδεια οδήγησης για περισσότερο από ${business.terms.minLicenceYears} έτος.`,
        "Δεν απαιτείται προκαταβολή για την κράτηση.",
        "Παραλαβή/επιστροφή στην Απολλωνία. Καμάρες κατόπιν συνεννόησης.",
        "Οι τιμές είναι ενδεικτικές και επιβεβαιώνονται ανά ημερομηνίες.",
      ]
    : [
        `Driver age: ${business.terms.minAge}–${business.terms.maxAge}.`,
        `Valid driving licence held for more than ${business.terms.minLicenceYears} year.`,
        "No prepayment is required for the booking.",
        "Pickup/return in Apollonia. Kamares on request.",
        "Rates are indicative and confirmed for your dates.",
      ];

  return (
    <div className="mx-auto max-w-3xl px-4 pb-20 pt-28 md:px-6">
      <h1 className="font-display text-4xl text-aegean md:text-5xl">{t("title")}</h1>
      <p className="mt-4 text-lg text-aegean/75">{t("lead")}</p>
      <ul className="mt-8 list-disc space-y-3 pl-5 text-aegean/80">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
