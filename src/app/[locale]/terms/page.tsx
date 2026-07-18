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

  const sections = [
    {
      title: t("ageTitle"),
      body: t("ageBody", {
        min: business.terms.minAge,
        max: business.terms.maxAge,
        years: business.terms.minLicenceYears,
      }),
    },
    {
      title: t("pickupTitle"),
      body: t("pickupBody", {
        default: business.terms.pickupDefault,
        alternate: business.terms.pickupAlternate,
      }),
    },
    { title: t("fuelTitle"), body: t("fuelBody") },
    { title: t("insuranceTitle"), body: t("insuranceBody") },
    { title: t("paymentTitle"), body: t("paymentBody") },
    { title: t("cancelTitle"), body: t("cancelBody") },
    { title: t("scooterTitle"), body: t("scooterBody") },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 pb-20 pt-28 md:px-6">
      <h1 className="font-display text-4xl text-aegean md:text-5xl">{t("title")}</h1>
      <p className="mt-4 text-lg text-aegean/75">{t("lead")}</p>
      <div className="mt-10 space-y-8">
        {sections.map((s) => (
          <section key={s.title} className="border-t border-aegean/12 pt-6">
            <h2 className="font-display text-2xl text-aegean">{s.title}</h2>
            <p className="mt-3 text-aegean/80">{s.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
