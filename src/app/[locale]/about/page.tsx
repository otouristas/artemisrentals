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
  const t = await getTranslations({ locale, namespace: "About" });
  return buildMetadata({
    locale: locale as Locale,
    title: `${t("title")} | Artemis Rental`,
    description: t("lead"),
    path: "/about",
  });
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("About");
  const isEl = locale === "el";

  return (
    <div className="mx-auto max-w-3xl px-4 pb-20 pt-28 md:px-6">
      <h1 className="font-display text-4xl text-aegean md:text-5xl">{t("title")}</h1>
      <p className="mt-4 text-lg text-aegean/75">{t("lead")}</p>
      <div className="prose-artemis mt-8">
        {isEl ? (
          <>
            <p>
              Η Artemis Rental δραστηριοποιείται στις ενοικιάσεις αυτοκινήτων και scooter στη Σίφνο από το {business.since},
              με βάση την Απολλωνία. Είμαστε οικογενειακή επιχείρηση — όχι ανώνυμο call center.
            </p>
            <p>
              Προσφέρουμε καλοσυντηρημένα οχήματα, δίκαιες εποχιακές τιμές και πρακτική βοήθεια για παραλίες,
              χωριά και αφίξεις ferry στις Καμάρες.
            </p>
          </>
        ) : (
          <>
            <p>
              Artemis Rental has been renting cars and scooters on Sifnos since {business.since},
              based in Apollonia. We are a family desk — not an anonymous call centre.
            </p>
            <p>
              We offer well-kept vehicles, fair seasonal rates, and practical help with beaches,
              villages, and ferry arrivals in Kamares.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
