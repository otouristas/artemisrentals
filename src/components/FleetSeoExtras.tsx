import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { JsonLd } from "@/components/JsonLd";

export async function FleetSeoExtras({
  variant,
}: {
  variant: "cars" | "scooters";
}) {
  const t = await getTranslations("FleetSeo");
  const prefix = variant === "cars" ? "cars" : "scooters";

  const faqs = [
    { q: t(`${prefix}Faq1Q`), a: t(`${prefix}Faq1A`) },
    { q: t(`${prefix}Faq2Q`), a: t(`${prefix}Faq2A`) },
    { q: t(`${prefix}Faq3Q`), a: t(`${prefix}Faq3A`) },
  ];

  return (
    <section className="mt-16 border-t border-aegean/10 pt-12">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((item) => ({
            "@type": "Question",
            name: item.q,
            acceptedAnswer: { "@type": "Answer", text: item.a },
          })),
        }}
      />
      <h2 className="text-title text-aegean">{t(`${prefix}ExtrasTitle`)}</h2>
      <p className="mt-3 max-w-2xl text-aegean/75">{t(`${prefix}ExtrasLead`)}</p>
      <ul className="mt-6 max-w-2xl space-y-3 text-sm leading-relaxed text-aegean/75">
        <li>{t(`${prefix}Point1`)}</li>
        <li>{t(`${prefix}Point2`)}</li>
        <li>{t(`${prefix}Point3`)}</li>
      </ul>
      <div className="mt-6 flex flex-wrap gap-4 text-sm font-semibold">
        <Link href="/rates" className="text-olive underline-offset-4 hover:underline">
          {t("linkRates")}
        </Link>
        <Link href="/book" className="text-olive underline-offset-4 hover:underline">
          {t("linkBook")}
        </Link>
        <Link
          href="/sifnos-guide/kamares-port"
          className="text-olive underline-offset-4 hover:underline"
        >
          {t("linkKamares")}
        </Link>
        <Link
          href="/sifnos-guide/rent-a-car-sifnos"
          className="text-olive underline-offset-4 hover:underline"
        >
          {t("linkRentGuide")}
        </Link>
      </div>

      <div className="mt-12">
        <h3 className="font-display text-2xl text-aegean">{t("faqTitle")}</h3>
        <dl className="mt-6 max-w-2xl space-y-6">
          {faqs.map((item) => (
            <div key={item.q}>
              <dt className="font-semibold text-aegean">{item.q}</dt>
              <dd className="mt-2 text-sm leading-relaxed text-aegean/70">{item.a}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
