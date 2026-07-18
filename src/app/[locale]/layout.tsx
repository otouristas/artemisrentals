import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Fraunces, Figtree } from "next/font/google";
import { routing } from "@/i18n/routing";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { TouristasChat } from "@/components/TouristasChat";
import { WhatsAppFab } from "@/components/WhatsAppFab";
import { JsonLd } from "@/components/JsonLd";
import { businessJsonLd, absoluteUrl } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
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
        inLanguage: ["en-US", "el-GR"],
        publisher: { "@id": `${SITE_URL}/#business` },
        potentialAction: {
          "@type": "SearchAction",
          target: `${absoluteUrl(locale as "en" | "el", "/sifnos-guide")}?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };

  return (
    <html lang={locale} className={`${fraunces.variable} ${figtree.variable} h-full`}>
      <body className="flex min-h-full flex-col antialiased">
        <NextIntlClientProvider messages={messages}>
          <JsonLd data={graph} />
          <Header />
          <main className="flex-1">{children}</main>
          <Footer locale={locale} />
          <WhatsAppFab />
          <TouristasChat locale={locale} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
