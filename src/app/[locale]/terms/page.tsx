import { getTranslations, setRequestLocale } from "next-intl/server";
import { Breadcrumbs } from "@/components/Breadcrumbs";
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
  const loc = locale as Locale;

  const included = [
    t("includedTpl"),
    t("includedMaintenance"),
    t("includedHelmets"),
    t("includedCarFree"),
    t("includedCarRequest"),
    t("includedScooter"),
    t("includedHelp"),
  ];

  const sections = [
    {
      title: t("ageTitle"),
      body: t("ageBody", {
        min: business.terms.minAge,
        max: business.terms.maxAge,
        years: business.terms.minLicenceYears,
      }),
    },
    { title: t("pickupTitle"), body: t("pickupBody") },
    { title: t("fuelTitle"), body: t("fuelBody") },
    { title: t("insuranceTitle"), body: t("insuranceBody") },
    { title: t("paymentTitle"), body: t("paymentBody") },
    { title: t("cancelTitle"), body: t("cancelBody") },
    { title: t("scooterTitle"), body: t("scooterBody") },
    { title: t("privacyTitle"), body: t("privacyBody") },
  ];

  return (
    <div className="container-site page-hero max-w-3xl pb-20">
      <Breadcrumbs locale={loc} items={[{ label: t("title") }]} />
      <h1 className="text-display text-aegean">{t("title")}</h1>
      <p className="mt-4 text-lead text-aegean/75">{t("lead")}</p>

      <section className="mt-10 rounded-2xl border border-aegean/10 bg-foam/70 p-6">
        <h2 className="font-display text-2xl text-aegean">{t("includedTitle")}</h2>
        <ul className="mt-4 space-y-2">
          {included.map((item) => (
            <li key={item} className="flex gap-2 text-aegean/80">
              <span className="text-sun" aria-hidden>
                ✓
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

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
