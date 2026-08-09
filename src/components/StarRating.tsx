import { cn } from "@/lib/cn";

/** Google's star gold. */
const STAR_GOLD = "#FBBC04";

function Star({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill={STAR_GOLD} className={className} aria-hidden="true" focusable="false">
      <path d="M12 2.5l2.9 5.88 6.49.94-4.7 4.58 1.11 6.46L12 17.31l-5.8 3.05 1.11-6.46-4.7-4.58 6.49-.94L12 2.5z" />
    </svg>
  );
}

/**
 * Star row. Server-safe. `label` is the accessible text; pass a localised string
 * from the caller so this component stays free of translation lookups.
 */
export function StarRating({
  rating,
  label,
  className,
  starClassName = "h-4 w-4",
}: {
  rating: number;
  label: string;
  className?: string;
  starClassName?: string;
}) {
  const count = Math.max(0, Math.min(5, Math.round(rating)));
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)} role="img" aria-label={label}>
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} className={starClassName} />
      ))}
    </span>
  );
}
