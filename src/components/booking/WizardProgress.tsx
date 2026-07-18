"use client";

import { useTranslations } from "next-intl";
import { BOOKING_STEPS, type BookingStep } from "./types";

export function WizardProgress({
  step,
  furthestStep,
  onStepClick,
}: {
  step: BookingStep;
  furthestStep: BookingStep;
  onStepClick: (step: BookingStep) => void;
}) {
  const t = useTranslations("Book");

  const labels: Record<BookingStep, string> = {
    1: t("stepVehicle"),
    2: t("stepDates"),
    3: t("stepDetails"),
  };

  return (
    <ol className="flex items-center">
      {BOOKING_STEPS.map((s, i) => {
        const isActive = s === step;
        const isDone = s < step;
        const isReachable = s <= furthestStep;

        return (
          <li key={s} className={i < BOOKING_STEPS.length - 1 ? "flex flex-1 items-center" : "flex items-center"}>
            <button
              type="button"
              disabled={!isReachable}
              onClick={() => isReachable && onStepClick(s)}
              aria-current={isActive ? "step" : undefined}
              className="group flex items-center gap-2.5 disabled:cursor-not-allowed"
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition ${
                  isActive
                    ? "bg-aegean text-foam"
                    : isDone
                      ? "bg-sun text-aegean"
                      : "bg-limestone/70 text-aegean/50"
                } ${isReachable && !isActive ? "group-hover:opacity-80" : ""}`}
              >
                {isDone ? "✓" : s}
              </span>
              <span
                className={`hidden text-sm font-medium sm:inline ${
                  isActive ? "text-aegean" : isReachable ? "text-aegean/70" : "text-aegean/40"
                }`}
              >
                {labels[s]}
              </span>
            </button>
            {i < BOOKING_STEPS.length - 1 && (
              <span
                className={`mx-3 h-px flex-1 ${s < furthestStep ? "bg-sun/60" : "bg-aegean/15"}`}
                aria-hidden="true"
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
