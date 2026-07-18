import { useTranslations } from "next-intl";
import { business } from "@/lib/site";
import { cn } from "@/lib/cn";

export function TrustBadges({
  className,
  tone = "light",
}: {
  className?: string;
  tone?: "light" | "dark";
}) {
  const t = useTranslations("Common");
  const items = [
    t("trustSince", { year: business.since }),
    t("trustPlace"),
    t("trustNoPrepay"),
    t("trustFamily"),
  ];

  return (
    <ul className={cn("flex flex-wrap gap-2", className)}>
      {items.map((label) => (
        <li
          key={label}
          className={cn(
            "rounded-full px-3 py-1.5 text-xs font-medium tracking-wide",
            tone === "dark"
              ? "border border-foam/20 bg-foam/10 text-foam/90"
              : "border border-aegean/12 bg-foam/70 text-aegean/80",
          )}
        >
          {label}
        </li>
      ))}
    </ul>
  );
}
