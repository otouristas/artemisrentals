import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { HeroDateSearch } from "@/components/HeroDateSearch";
import { StarIcon } from "@/components/icons";
import { business } from "@/lib/site";
import { REVIEW_COUNT, REVIEW_RATING } from "@/lib/reviews";

export function Hero() {
  const t = useTranslations("Home");
  const tCommon = useTranslations("Common");
  const tReviews = useTranslations("Reviews");

  return (
    <section className="relative overflow-hidden">
      <Image
        src="/images/brand/hero-sifnos.jpg"
        alt="Artemis Rental vehicles in Sifnos"
        fill
        preload
        className="object-cover object-center"
        sizes="100vw"
      />
      <div className="hero-scrim absolute inset-0" />
      <div className="relative mx-auto flex min-h-[88svh] max-w-6xl flex-col justify-end px-4 pb-12 pt-32 md:min-h-[78vh] md:px-6 md:pb-20">
        <p className="animate-rise text-sm font-semibold uppercase tracking-[0.18em] text-foam/80">
          {t("brand")}
        </p>
        <h1 className="animate-rise-delay mt-3 max-w-3xl text-4xl font-bold leading-[1.05] tracking-tight text-foam md:text-6xl lg:text-7xl">
          {t("headline")}
        </h1>
        <p className="animate-rise-delay-2 mt-4 max-w-xl text-base text-foam/85 md:text-lg">
          {t("subhead")}
        </p>

        <div className="animate-rise-delay-2 mt-8">
          <HeroDateSearch />
        </div>

        <div className="animate-rise-delay-2 mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-foam/90">
          <span className="inline-flex items-center gap-1.5 font-semibold text-foam">
            <StarIcon className="h-4 w-4 text-sun" />
            {REVIEW_RATING.toFixed(1)}
            <span className="font-normal text-foam/80">
              ({tReviews("basedOn", { count: REVIEW_COUNT })})
            </span>
          </span>
          <span aria-hidden className="text-foam/40">·</span>
          <span>{tCommon("trustSince", { year: business.since })}</span>
          <span aria-hidden className="text-foam/40">·</span>
          <span>{tCommon("trustNoPrepay")}</span>
          <span aria-hidden className="hidden text-foam/40 sm:inline">·</span>
          <Link href="/cars" className="font-semibold text-foam underline-offset-4 hover:underline">
            {t("ctaFleet")}
          </Link>
        </div>
      </div>
    </section>
  );
}
