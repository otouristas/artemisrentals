"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { GoogleG } from "@/components/GoogleG";
import { StarRating } from "@/components/StarRating";
import { intlLocale } from "@/lib/i18n-locale";
import { cn } from "@/lib/cn";
import type { Review } from "@/lib/reviews";

/** Google's own avatar palette for users without a photo. */
const AVATAR_COLORS = [
  "bg-[#4285F4]",
  "bg-[#EA4335]",
  "bg-[#34A853]",
  "bg-[#A142F4]",
  "bg-[#24C1E0]",
  "bg-[#F4B400] text-aegean",
] as const;

function hashName(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

function formatDate(iso: string, locale: string) {
  const d = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat(intlLocale(locale), {
    year: "numeric",
    month: "long",
  }).format(d);
}

const LONG_TEXT = 260;

export function ReviewCard({
  review,
  locale,
  expandable = true,
  className,
}: {
  review: Review;
  locale: string;
  /** Home teasers clamp without a toggle so the grid stays even. */
  expandable?: boolean;
  className?: string;
}) {
  const t = useTranslations("Reviews");
  const [expanded, setExpanded] = useState(false);
  const color = AVATAR_COLORS[hashName(review.author) % AVATAR_COLORS.length];
  const showToggle = expandable && (review.text?.length ?? 0) > LONG_TEXT;

  return (
    <article
      className={cn(
        "flex h-full flex-col border border-aegean/12 bg-foam p-5",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white",
              color,
            )}
            aria-hidden="true"
          >
            {initials(review.author)}
          </span>
          <div className="min-w-0">
            <p className="truncate font-semibold text-aegean">{review.author}</p>
            <p className="text-xs text-aegean/55">
              <time dateTime={review.date}>{formatDate(review.date, locale)}</time>
              {review.localGuide ? <span> · {t("localGuide")}</span> : null}
            </p>
          </div>
        </div>
        <span
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-aegean/12 bg-salt px-2.5 py-1"
          title={t("verified")}
        >
          <GoogleG className="h-3.5 w-3.5" />
          <span className="text-[10px] font-semibold uppercase tracking-wider text-aegean/60">
            Google
          </span>
        </span>
      </div>

      <StarRating
        rating={review.rating}
        label={t("starsLabel", { rating: review.rating })}
        className="mt-3"
        starClassName="h-4 w-4"
      />

      {review.text ? (
        <>
          <blockquote
            className={cn(
              "mt-3 flex-1 text-sm leading-relaxed text-aegean/80",
              !expanded && "line-clamp-6",
            )}
          >
            {review.text}
            {review.truncated ? <span className="text-aegean/45"> …</span> : null}
          </blockquote>
          {showToggle ? (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="mt-2 self-start text-xs font-semibold text-olive underline-offset-4 hover:underline"
            >
              {expanded ? t("readLess") : t("readMore")}
            </button>
          ) : null}
        </>
      ) : (
        /* Rating-only review. Google shows these with no text and so do we. */
        <p className="mt-3 flex-1 text-sm italic text-aegean/45">{t("ratingOnly")}</p>
      )}

      {review.translatedFrom ? (
        <p className="mt-3 text-[11px] text-aegean/45">
          {t("translatedBy", { lang: t(`lang.${review.translatedFrom}`) })}
        </p>
      ) : null}
    </article>
  );
}
