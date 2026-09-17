import { pexelsCreditHtml, type PexelsCredit } from "@/lib/pexels";
import { cn } from "@/lib/cn";

export function PexelsPhotoCredit({
  credit,
  locale,
  variant = "caption",
}: {
  credit: PexelsCredit;
  locale: string;
  variant?: "caption" | "overlay";
}) {
  return (
    <p
      className={cn(
        variant === "overlay"
          ? "pexels-credit-overlay"
          : "text-xs leading-relaxed text-aegean/55",
      )}
      dangerouslySetInnerHTML={{ __html: pexelsCreditHtml(locale, credit) }}
    />
  );
}
