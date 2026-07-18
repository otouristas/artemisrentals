import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { TrustBadges } from "@/components/TrustBadges";

export function Hero() {
  const t = useTranslations("Home");

  return (
    <section className="relative min-h-[100svh] overflow-hidden">
      <Image
        src="/images/brand/hero-sifnos.jpg"
        alt="Artemis Rental vehicles in Sifnos"
        fill
        preload
        className="object-cover object-center"
        sizes="100vw"
      />
      <div className="hero-scrim absolute inset-0" />
      <div className="relative mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-end px-4 pb-16 pt-32 md:px-6 md:pb-24">
        <p className="animate-rise font-display text-4xl font-semibold tracking-tight text-foam md:text-6xl lg:text-7xl">
          {t("brand")}
        </p>
        <h1 className="animate-rise-delay mt-4 max-w-2xl font-display text-2xl font-medium text-foam/95 md:text-4xl">
          {t("headline")}
        </h1>
        <p className="animate-rise-delay-2 mt-4 max-w-xl text-base text-foam/85 md:text-lg">
          {t("subhead")}
        </p>
        <div className="animate-rise-delay-2 mt-8 flex flex-wrap gap-3">
          <Link href="/book" className="btn-accent">
            {t("ctaBook")}
          </Link>
          <Link href="/cars" className="btn-ghost">
            {t("ctaFleet")}
          </Link>
        </div>
        <TrustBadges tone="dark" className="animate-rise-delay-2 mt-8" />
      </div>
    </section>
  );
}
