"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { getCurrentSeasonRate, getLowestRate, isScooterBookingEnabled, rentalDays } from "@/lib/fleet";
import { minFreeUnits, useAvailability } from "@/lib/use-availability";
import { parseISODate } from "@/lib/dates";
import { intlLocale } from "@/lib/i18n-locale";
import type { Vehicle } from "./types";

function dayCount(from?: Date, to?: Date) {
  return from && to ? rentalDays(from, to) : 0;
}

export function StepVehicle({
  vehicles,
  value,
  from,
  to,
  totalFor,
  onChange,
  onEditDates,
  onNext,
}: {
  vehicles: Vehicle[];
  value: string;
  from: string;
  to: string;
  totalFor: (rateKey: string | null) => number | null;
  onChange: (slug: string) => void;
  onEditDates: () => void;
  onNext: () => void;
}) {
  const t = useTranslations("Book");
  const tFleet = useTranslations("Fleet");
  const locale = useLocale();
  const fromDate = parseISODate(from);
  const toDate = parseISODate(to);
  const days = dayCount(fromDate, toDate);
  const dateFmt = new Intl.DateTimeFormat(intlLocale(locale), { day: "numeric", month: "short" });
  const dateRange = fromDate && toDate ? `${dateFmt.format(fromDate)} – ${dateFmt.format(toDate)}` : "";
  const availability = useAvailability(days ? from : null, days ? to : null);
  const freeFor = (slug: string) =>
    availability.live ? minFreeUnits(availability.vehicles[slug], from, to) : null;
  const scootersOpen = isScooterBookingEnabled();
  const selectedVehicle = vehicles.find((v) => v.slug === value);
  const [category, setCategory] = useState<"car" | "scooter">(() =>
    selectedVehicle?.category === "scooter" && scootersOpen ? "scooter" : "car",
  );
  const [browsing, setBrowsing] = useState(() => !value);

  useEffect(() => {
    if (!scootersOpen && selectedVehicle?.category === "scooter") {
      onChange("");
      setCategory("car");
      setBrowsing(true);
    }
  }, [scootersOpen, selectedVehicle?.category, onChange]);

  useEffect(() => {
    if (selectedVehicle?.category === "scooter" || selectedVehicle?.category === "car") {
      setCategory(
        selectedVehicle.category === "scooter" && !scootersOpen
          ? "car"
          : selectedVehicle.category,
      );
    }
  }, [selectedVehicle?.category, value, scootersOpen]);

  useEffect(() => {
    if (value) setBrowsing(false);
  }, [value]);

  const filtered = vehicles.filter((v) => v.category === category);
  const selectedRate = selectedVehicle
    ? getCurrentSeasonRate(selectedVehicle.rateKey).price ??
      getLowestRate(selectedVehicle.rateKey)
    : null;
  const preselected = Boolean(selectedVehicle) && !browsing;

  return (
    <div>
      {!preselected ? (
        <>
          <h2 className="font-display text-2xl text-aegean">{t("stepVehicleTitle")}</h2>
          <p className="mt-1 text-sm text-aegean/65">{t("stepVehicleLead")}</p>
        </>
      ) : (
        <h2 className="font-display text-xl text-aegean">{t("stepVehicleReady")}</h2>
      )}

      {dateRange ? (
        <div className="mt-4 flex w-fit flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-line bg-surface py-2 pl-4 pr-2 text-sm">
          <span className="font-semibold text-aegean">{dateRange}</span>
          <span className="text-aegean/60">{t("nights", { count: days })}</span>
          <button
            type="button"
            onClick={onEditDates}
            className="rounded-full px-2 py-0.5 font-semibold text-aegean/70 underline-offset-2 hover:text-aegean hover:underline"
          >
            {t("changeDates")}
          </button>
        </div>
      ) : null}

      {selectedVehicle ? (
        <div className="mt-4 rounded-2xl border-2 border-aegean bg-foam p-3 sm:p-4">
          <div className="flex items-center gap-3">
            <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-xl bg-foam sm:h-[4.5rem] sm:w-28">
              <Image
                src={selectedVehicle.image}
                alt={selectedVehicle.name}
                fill
                className="object-cover object-center"
                sizes="112px"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-olive">
                {t("selectedLabel")}
              </p>
              <p className="truncate font-display text-lg leading-tight text-aegean sm:text-xl">
                {selectedVehicle.name}
              </p>
              <p className="mt-0.5 truncate text-xs text-aegean/65 sm:text-sm">
                {tFleet("seats", { count: selectedVehicle.seats })} ·{" "}
                {selectedVehicle.transmission === "automatic"
                  ? tFleet("automatic")
                  : tFleet("manual")}
                {selectedRate ? ` · €${selectedRate}/day` : ""}
              </p>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-3">
            <button type="button" onClick={onNext} className="btn-primary min-h-12 flex-1">
              {t("next")}
            </button>
            <button
              type="button"
              onClick={() => setBrowsing((v) => !v)}
              className="shrink-0 px-1 text-sm font-semibold text-aegean/70 underline-offset-2 hover:text-aegean hover:underline"
            >
              {browsing ? t("hideFleet") : t("changeVehicle")}
            </button>
          </div>
        </div>
      ) : null}

      {(browsing || !selectedVehicle) && (
        <>
          <div className="mt-5 inline-flex rounded-full bg-limestone/60 p-1">
            <button
              type="button"
              onClick={() => setCategory("car")}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                category === "car" ? "bg-aegean text-foam" : "text-aegean/70 hover:text-aegean"
              }`}
            >
              {t("categoryCars")}
            </button>
            <button
              type="button"
              onClick={() => setCategory("scooter")}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                category === "scooter" ? "bg-aegean text-foam" : "text-aegean/70 hover:text-aegean"
              }`}
            >
              {t("categoryScooters")}
            </button>
          </div>

          {category === "scooter" && !scootersOpen ? (
            <aside
              className="mt-5 border border-sun/40 bg-sun/10 px-4 py-4 text-sm leading-relaxed text-aegean"
              role="status"
            >
              <p className="font-semibold">{tFleet("scooterUnavailableTitle")}</p>
              <p className="mt-1 text-aegean/75">{tFleet("scooterUnavailableBody")}</p>
            </aside>
          ) : null}

          <div
            className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            role="radiogroup"
            aria-label={t("stepVehicleTitle")}
          >
            {category === "scooter" && !scootersOpen
              ? null
              : filtered.map((v) => {
              const selected = value === v.slug;
              const lowest = getLowestRate(v.rateKey);
              const total = days ? totalFor(v.rateKey) : null;
              const free = days ? freeFor(v.slug) : null;
              const soldOut = free === 0;
              return (
                <button
                  key={v.slug}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  aria-disabled={soldOut || undefined}
                  disabled={soldOut}
                  onClick={() => {
                    onChange(v.slug);
                    setBrowsing(false);
                  }}
                  className={`card-premium relative flex flex-col overflow-hidden text-left transition disabled:cursor-not-allowed disabled:opacity-55 ${
                    selected ? "border-aegean ring-1 ring-aegean" : ""
                  }`}
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-aegean/[0.04]">
                    <Image
                      src={v.image}
                      alt={v.name}
                      fill
                      className="pointer-events-none object-cover object-center"
                      sizes="(max-width:768px) 50vw, 30vw"
                    />
                    {selected ? (
                      <span className="absolute right-3 top-3 rounded-full bg-aegean px-2.5 py-1 text-[11px] font-semibold text-foam">
                        ✓
                      </span>
                    ) : null}
                  </div>
                  <div className="p-4">
                    <p className="font-display text-lg text-aegean">{v.name}</p>
                    {free !== null ? (
                      <p
                        className={`mt-1 inline-flex items-center gap-1.5 text-xs font-semibold ${
                          soldOut ? "text-red-700" : free <= 2 ? "text-sun" : "text-olive"
                        }`}
                      >
                        <span
                          aria-hidden
                          className={`h-1.5 w-1.5 rounded-full ${soldOut ? "bg-red-700" : free <= 2 ? "bg-sun" : "bg-olive"}`}
                        />
                        {soldOut ? t("availSoldOut") : free <= 2 ? t("availFew", { count: free }) : t("availAvailable")}
                      </p>
                    ) : null}
                    <p className="mt-1 text-xs text-aegean/60">
                      {tFleet("seats", { count: v.seats })} ·{" "}
                      {v.transmission === "automatic" ? tFleet("automatic") : tFleet("manual")}
                    </p>
                    {total != null ? (
                      <p className="mt-2 text-sm text-aegean/60">
                        <span className="font-display text-xl font-semibold text-olive">~€{total}</span>{" "}
                        {t("totalForDays", { count: days })}
                      </p>
                    ) : (
                      <p className="mt-2 text-sm font-semibold text-olive">
                        {lowest ? tFleet("fromDay", { price: lowest }) : tFleet("contactForPrice")}
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            role="radio"
            aria-checked={value === ""}
            onClick={() => onChange("")}
            className={`card-premium mt-4 flex w-full items-center gap-3 p-4 text-left ${
              value === "" ? "border-aegean ring-1 ring-aegean" : ""
            }`}
          >
            <span
              className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                value === "" ? "border-aegean bg-aegean" : "border-aegean/30"
              }`}
              aria-hidden
            >
              {value === "" ? <span className="h-1.5 w-1.5 rounded-full bg-foam" /> : null}
            </span>
            <span className="text-sm font-medium text-aegean">{t("vehicleAny")}</span>
          </button>

          {!selectedVehicle ? (
            <div className="mt-8 flex justify-end">
              <button type="button" onClick={onNext} className="btn-primary min-h-12 px-8">
                {t("next")}
              </button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
