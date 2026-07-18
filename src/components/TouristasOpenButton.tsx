"use client";

import { useTranslations } from "next-intl";

export function TouristasOpenButton({
  label,
  prompt,
  className,
}: {
  label?: string;
  prompt?: string;
  className?: string;
}) {
  const t = useTranslations("Home");

  return (
    <button
      type="button"
      onClick={() => {
        window.dispatchEvent(
          new CustomEvent("touristas:open", {
            detail: prompt ? { prompt } : undefined,
          }),
        );
      }}
      className={
        className ??
        "rounded-full border border-foam/40 px-6 py-3 text-sm font-semibold text-foam transition hover:bg-foam/10"
      }
    >
      {label ?? t("askTouristas")}
    </button>
  );
}
