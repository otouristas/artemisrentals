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
import { siteGraphJsonLd } from "@/lib/seo";
import { ensureLivePricing } from "@/lib/live-fleet";
import { LivePricingBridge } from "@/components/LivePricingBridge";

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
  const livePricing = await ensureLivePricing();

  return (
    <html
      lang={locale}
      className={`${inter.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col font-sans antialiased" suppressHydrationWarning>
        <NextIntlClientProvider messages={messages}>
          <LivePricingBridge rows={livePricing} />
          <JsonLd data={siteGraphJsonLd()} />
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
