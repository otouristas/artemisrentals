import { Suspense } from "react";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Inter } from "next/font/google";
import { routing } from "@/i18n/routing";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MobileBookBar } from "@/components/MobileBookBar";
import { TouristasFloatingChat } from "@/components/TouristasFloatingChat";
import { WhatsAppFab } from "@/components/WhatsAppFab";
import { Analytics } from "@/components/Analytics";
import { AnalyticsEvents } from "@/components/AnalyticsEvents";
import { CookieBanner } from "@/components/CookieBanner";
import { ScrollToTop } from "@/components/ScrollToTop";
import { JsonLd } from "@/components/JsonLd";
import { allInLanguages, businessJsonLd, absoluteUrl } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";
import type { Locale } from "@/i18n/routing";

const inter = Inter({
  subsets: ["latin", "greek"],
  variable: "--font-inter",
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const messages = await getMessages();

  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      businessJsonLd(),
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: "Artemis Rental",
        inLanguage: allInLanguages(),
        publisher: { "@id": `${SITE_URL}/#business` },
        potentialAction: {
          "@type": "SearchAction",
          target: `${absoluteUrl(locale as Locale, "/sifnos-guide")}?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };

  return (
    <html
      lang={locale}
      className={`${inter.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col font-sans antialiased" suppressHydrationWarning>
        <NextIntlClientProvider messages={messages}>
          <JsonLd data={graph} />
          <Header />
          <main className="flex-1">{children}</main>
          <Footer locale={locale} />
          <MobileBookBar />
          <WhatsAppFab />
          <TouristasFloatingChat locale={locale} />
          <CookieBanner />
          <Analytics />
          <AnalyticsEvents />
          <Suspense fallback={null}>
            <ScrollToTop />
          </Suspense>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
