import { getTranslations, setRequestLocale } from "next-intl/server";
import { JsonLd } from "@/components/JsonLd";
import faqs from "../../../../content/data/faqs.json";
import { buildMetadata, absoluteUrl } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "FAQ" });
  return buildMetadata({
    locale: locale as Locale,
    title: `${t("title")} | Artemis Rental`,
    description: t("lead"),
    path: "/faq",
  });
}

export default async function FaqPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("FAQ");
  const loc = locale as Locale;
  const items = faqs[loc];

  return (
    <div className="mx-auto max-w-3xl px-4 pb-20 pt-28 md:px-6">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          url: absoluteUrl(loc, "/faq"),
          mainEntity: items.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }}
      />
      <h1 className="font-display text-4xl text-aegean md:text-5xl">{t("title")}</h1>
      <p className="mt-4 text-lg text-aegean/75">{t("lead")}</p>
      <div className="mt-10 space-y-6">
        {items.map((f) => (
          <section key={f.q} className="border-t border-aegean/15 pt-5">
            <h2 className="font-display text-xl text-aegean">{f.q}</h2>
            <p className="mt-2 text-aegean/75">{f.a}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
