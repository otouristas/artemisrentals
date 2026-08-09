import { getTranslations } from "next-intl/server";
import { GoogleG } from "@/components/GoogleG";
import { StarRating } from "@/components/StarRating";
import { REVIEW_COUNT, REVIEW_PROFILE_URL, REVIEW_RATING } from "@/lib/reviews";
import { cn } from "@/lib/cn";

/** Google-style rating panel: score, stars, count and a link to the profile. */
export async function ReviewsSummary({ className }: { className?: string }) {
  const t = await getTranslations("Reviews");

  return (
    <div
      className={cn(
        "inline-flex flex-wrap items-center gap-5 border border-aegean/12 bg-foam px-6 py-5",
        className,
      )}
    >
      <div className="flex flex-col items-center gap-1">
        <GoogleG className="h-6 w-6" />
        <span className="text-[10px] font-semibold uppercase tracking-wider text-aegean/50">
          Google
        </span>
      </div>

      <div className="h-12 w-px bg-aegean/12" aria-hidden="true" />

      <p className="font-display text-5xl leading-none text-aegean">
        {REVIEW_RATING.toFixed(1)}
      </p>

      <div>
        <StarRating
          rating={REVIEW_RATING}
          label={t("starsLabel", { rating: REVIEW_RATING })}
          starClassName="h-4 w-4"
        />
        <p className="mt-1 text-sm text-aegean/65">{t("basedOn", { count: REVIEW_COUNT })}</p>
        <a
          href={REVIEW_PROFILE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 inline-block text-xs font-semibold text-olive underline-offset-4 hover:underline"
        >
          {t("viewOnGoogle")} ↗
        </a>
      </div>
    </div>
  );
}
