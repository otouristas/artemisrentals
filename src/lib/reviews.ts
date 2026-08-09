import data from "../../content/data/reviews.json";

export type Review = {
  author: string;
  /** ISO date. Approximate when `dateApproximate` is set, since Google exposes relative labels only. */
  date: string;
  dateApproximate?: boolean;
  relativeLabel?: string;
  rating: number;
  /** Absent for rating-only reviews. Never synthesise one. */
  text?: string;
  /** Google cut the published text off with "… More". */
  truncated?: boolean;
  /** Shown as Google's translation of an original in this language. */
  translatedFrom?: string;
  localGuide?: boolean;
  /** Set when the reviewer named a specific vehicle. */
  vehicleSlug?: string;
  lang: string;
  source: string;
};

const reviews = data.reviews as Review[];

export const REVIEW_PROFILE_URL = data.profileUrl;
export const REVIEW_RATING = data.ratingValue;
export const REVIEW_COUNT = data.reviewCount;

/** Newest first. Reviews with text lead within the same day so the page opens with substance. */
export function getReviews(): Review[] {
  return [...reviews].sort((a, b) => {
    const byDate = b.date.localeCompare(a.date);
    if (byDate !== 0) return byDate;
    return Number(Boolean(b.text)) - Number(Boolean(a.text));
  });
}

export function getReviewsWithText(): Review[] {
  return getReviews().filter((r) => Boolean(r.text));
}

/** Distinct language codes present, for the filter control. */
export function getReviewLanguages(): string[] {
  return Array.from(new Set(reviews.map((r) => r.lang))).sort();
}

/**
 * A review to show on a vehicle page. Prefers one that names the model, otherwise
 * falls back to a general five-star review. Returns undefined rather than inventing
 * per-model coverage we do not have.
 */
export function getReviewForVehicle(slug: string): Review | undefined {
  const named = getReviewsWithText().find((r) => r.vehicleSlug === slug);
  if (named) return named;
  return getReviewsWithText().find((r) => !r.vehicleSlug);
}

/** Stable identity for React keys: authors are not guaranteed unique. */
export function reviewKey(review: Review): string {
  return `${review.author}|${review.date}|${review.text?.slice(0, 24) ?? "no-text"}`;
}
