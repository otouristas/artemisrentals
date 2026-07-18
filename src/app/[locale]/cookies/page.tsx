import { getTranslations, setRequestLocale } from "next-intl/server";
import { LegalDoc } from "@/components/LegalDoc";
import { ManageCookiesButton } from "@/components/CookieBanner";
import { buildMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Cookies" });
  return buildMetadata({
    locale: locale as Locale,
    title: `${t("title")} | Artemis Rental`,
    description: t("lead"),
    path: "/cookies",
  });
}

export default async function CookiesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Cookies");
  const loc = locale as Locale;

  const sections = [
    { title: t("s1Title"), body: t("s1Body") },
    { title: t("s2Title"), body: t("s2Body") },
    { title: t("s3Title"), body: t("s3Body") },
    { title: t("s4Title"), body: t("s4Body") },
    { title: t("s5Title"), body: t("s5Body") },
  ];

  return (
    <LegalDoc
      locale={loc}
      title={t("title")}
      lead={t("lead")}
      sections={sections}
      footer={<ManageCookiesButton />}
    />
  );
}
