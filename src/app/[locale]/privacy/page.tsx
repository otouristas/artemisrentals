import { getTranslations, setRequestLocale } from "next-intl/server";
import { LegalDoc } from "@/components/LegalDoc";
import { business } from "@/lib/site";
import { buildMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Privacy" });
  return buildMetadata({
    locale: locale as Locale,
    title: `${t("title")} | Artemis Rental`,
    description: t("lead"),
    path: "/privacy",
  });
}

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Privacy");
  const loc = locale as Locale;

  const sections = [
    { title: t("s1Title"), body: t("s1Body", { name: business.name, email: business.email }) },
    { title: t("s2Title"), body: t("s2Body") },
    { title: t("s3Title"), body: t("s3Body") },
    { title: t("s4Title"), body: t("s4Body") },
    { title: t("s5Title"), body: t("s5Body") },
    { title: t("s6Title"), body: t("s6Body", { email: business.email, phone: business.phones[0].display }) },
  ];

  return <LegalDoc locale={loc} title={t("title")} lead={t("lead")} sections={sections} />;
}
