"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { ReviewCard } from "@/components/ReviewCard";
import { intlLocale } from "@/lib/i18n-locale";
import { reviewKey, type Review } from "@/lib/reviews";
import { cn } from "@/lib/cn";

const PAGE_SIZE = 9;

type Order = "newest" | "oldest";

export function ReviewsList({
  reviews,
  languages,
  locale,
}: {
  reviews: Review[];
  languages: string[];
  locale: string;
}) {
  const t = useTranslations("Reviews");
  const [order, setOrder] = useState<Order>("newest");
  const [lang, setLang] = useState("all");
  const [visible, setVisible] = useState(PAGE_SIZE);

  const displayNames = useMemo(() => {
    try {
      return new Intl.DisplayNames([intlLocale(locale)], { type: "language" });
    } catch {
      return null;
    }
  }, [locale]);

  const filtered = useMemo(() => {
    const base = lang === "all" ? reviews : reviews.filter((r) => r.lang === lang);
    return order === "oldest" ? [...base].reverse() : base;
  }, [reviews, lang, order]);

  const shown = filtered.slice(0, visible);
  const hasMore = visible < filtered.length;

  const langLabel = (code: string) =>
    code === "all" ? t("allLanguages") : (displayNames?.of(code) ?? code.toUpperCase());

  const select = (next: () => void) => {
    next();
    setVisible(PAGE_SIZE);
  };

  return (
    <div>
      <div className="flex flex-col gap-4 border border-aegean/12 bg-salt/60 p-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-aegean/50">
            {t("sortLabel")}
          </span>
          <div className="inline-flex border border-aegean/12 bg-foam p-0.5">
            {(["newest", "oldest"] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => select(() => setOrder(value))}
                aria-pressed={order === value}
                className={cn(
                  "px-3 py-1.5 text-xs font-semibold transition",
                  order === value
                    ? "bg-aegean text-foam"
                    : "text-aegean/60 hover:text-aegean",
                )}
              >
                {value === "newest" ? t("sortNewest") : t("sortOldest")}
              </button>
            ))}
          </div>
        </div>

        {languages.length > 1 ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-aegean/50">
              {t("filterLanguage")}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {["all", ...languages].map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => select(() => setLang(code))}
                  aria-pressed={lang === code}
                  className={cn(
                    "border px-3 py-1 text-xs font-semibold transition",
                    lang === code
                      ? "border-aegean bg-aegean/10 text-aegean"
                      : "border-aegean/12 bg-foam text-aegean/60 hover:border-aegean/30 hover:text-aegean",
                  )}
                >
                  {langLabel(code)}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <p className="text-xs font-medium text-aegean/55 sm:ml-auto">
          {t("showingOf", { shown: shown.length, total: filtered.length })}
        </p>
      </div>

      <div className="mt-6 grid items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((review) => (
          <ReviewCard key={reviewKey(review)} review={review} locale={locale} />
        ))}
      </div>

      {hasMore ? (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={() => setVisible((v) => v + PAGE_SIZE)}
            className="btn-primary"
          >
            {t("loadMore")}
          </button>
        </div>
      ) : null}
    </div>
  );
}
