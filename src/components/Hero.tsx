import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function Hero() {
  const t = useTranslations("Home");

  return (
    <section className="relative min-h-[100svh] overflow-hidden">
      <Image
        src="/images/brand/hero-sifnos.jpg"
        alt="Artemis Rental vehicles in Sifnos"
        fill
        priority
        className="object-cover object-center"
        sizes="100vw"
      />
      <div className="hero-scrim absolute inset-0" />
      <div className="relative mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-end px-4 pb-20 pt-32 md:px-6 md:pb-28">
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
          <Link
            href="/book"
            className="rounded-full bg-sun px-6 py-3 text-sm font-semibold text-aegean transition hover:brightness-105"
          >
            {t("ctaBook")}
          </Link>
          <Link
            href="/cars"
            className="rounded-full border border-foam/40 bg-foam/10 px-6 py-3 text-sm font-semibold text-foam backdrop-blur-sm transition hover:bg-foam/20"
          >
            {t("ctaFleet")}
          </Link>
        </div>
      </div>
    </section>
  );
}
