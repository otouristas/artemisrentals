import { getTranslations, setRequestLocale } from "next-intl/server";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqAccordion } from "@/components/FaqAccordion";
import { JsonLd } from "@/components/JsonLd";
import faqs from "../../../../content/data/faqs.json";
import { buildMetadata, absoluteUrl } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";

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
  const book = await getTranslations("Book");
  const loc = locale as Locale;
  const items = (faqs as Record<string, { q: string; a: string }[]>)[loc] ?? faqs.en;

  return (
    <div className="container-site page-hero max-w-3xl pb-20">
      <Breadcrumbs locale={loc} items={[{ label: t("title") }]} />
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
      <h1 className="text-display text-aegean">{t("title")}</h1>
      <p className="mt-4 text-lead text-aegean/75">{t("lead")}</p>
      <FaqAccordion items={items} />
      <div className="mt-12 rounded-2xl bg-aegean px-6 py-8 text-foam">
        <p className="font-display text-2xl">{book("title")}</p>
        <p className="mt-2 text-foam/75">{book("lead")}</p>
        <Link href="/book" className="btn-accent mt-6">
          {book("submit")}
        </Link>
      </div>
    </div>
  );
}
