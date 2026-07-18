import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Reveal } from "@/components/Reveal";
import { TrustBadges } from "@/components/TrustBadges";
import { JsonLd } from "@/components/JsonLd";
import { business } from "@/lib/site";
import { aboutPageJsonLd, buildMetadata } from "@/lib/seo";
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
  const loc = locale as Locale;

  const timeline = [
    { title: t("t1988Title"), body: t("t1988Body") },
    { title: t("t2000Title"), body: t("t2000Body") },
    { title: t("t2020Title"), body: t("t2020Body") },
  ];

  const photos = [
    { src: "/images/brand/artemis-cars.jpg", alt: "Artemis cars in Sifnos" },
    { src: "/images/brand/artemis-motos.jpg", alt: "Artemis scooters in Sifnos" },
    { src: "/images/brand/hero-sifnos.jpg", alt: "Sifnos landscape near Apollonia" },
  ];

  return (
    <div className="pb-20">
      <JsonLd data={aboutPageJsonLd(loc)} />
      <div className="container-site page-hero">
        <Breadcrumbs locale={loc} items={[{ label: t("title") }]} />
        <h1 className="text-display text-aegean">{t("title")}</h1>
        <p className="mt-4 max-w-2xl text-lead text-aegean/75">{t("lead")}</p>
        <TrustBadges className="mt-6" />
      </div>

      <section className="section container-site">
        <Reveal>
          <h2 className="text-title text-aegean">{t("storyTitle")}</h2>
          <div className="prose-artemis mt-6">
            <p>{t("story1", { year: business.since })}</p>
            <p>{t("story2")}</p>
          </div>
        </Reveal>
      </section>

      <section className="section texture-grain bg-aegean/5">
        <div className="container-site">
          <Reveal>
            <h2 className="text-title text-aegean">{t("timelineTitle")}</h2>
          </Reveal>
          <ol className="mt-10 grid gap-8 md:grid-cols-3">
            {timeline.map((item, i) => (
              <Reveal key={item.title} delay={i * 90}>
                <li className="border-t border-aegean/15 pt-5">
                  <p className="font-display text-3xl text-sun">{item.title}</p>
                  <p className="mt-3 text-aegean/75">{item.body}</p>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section className="section container-site">
        <Reveal>
          <h2 className="text-title text-aegean">{t("photosTitle")}</h2>
        </Reveal>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {photos.map((photo, i) => (
            <Reveal key={photo.src} delay={i * 70}>
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width:768px) 100vw, 33vw"
                />
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="container-site pb-8">
        <div className="rounded-3xl bg-aegean px-6 py-10 text-foam md:px-10">
          <h2 className="font-display text-3xl md:text-4xl">{t("ctaTitle")}</h2>
          <p className="mt-3 max-w-xl text-foam/80">{t("ctaBody")}</p>
          <Link href="/book" className="btn-accent mt-8">
            {t("ctaBook")}
          </Link>
        </div>
      </section>
    </div>
  );
}
