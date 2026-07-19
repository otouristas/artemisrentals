"use client";

import { ValidationError } from "@formspree/react";
import type { ComponentProps } from "react";
import { useTranslations } from "next-intl";
import { getVehicleBySlug } from "@/lib/fleet";
import {
  CAR_FREE_PICKUPS,
  CAR_REQUEST_PICKUPS,
  isOnRequestPickup,
  type PickupLocation,
} from "@/lib/pickup";
import { BookingSummary } from "./BookingSummary";
import type { BookingState, BookingStatus, Vehicle } from "./types";

const fieldClass =
  "w-full appearance-none border-0 border-b border-aegean/20 bg-transparent px-0 py-2.5 outline-none transition focus:border-aegean";

export function StepDetails({
  state,
  vehicle,
  estimatedTotal,
  status,
  formspreeErrors,
  whatsappHref,
  onChange,
  onBack,
  onSubmit,
}: {
  state: BookingState;
  vehicle: Vehicle | undefined;
  estimatedTotal: number | null;
  status: BookingStatus;
  formspreeErrors?: ComponentProps<typeof ValidationError>["errors"];
  whatsappHref: string;
  onChange: (patch: Partial<BookingState>) => void;
  onBack: () => void;
  onSubmit: () => void;
}) {
  const t = useTranslations("Book");
  const selected = vehicle ?? (state.vehicle ? getVehicleBySlug(state.vehicle) : undefined);
  const category =
    selected?.category === "scooter" || selected?.category === "car"
      ? selected.category
      : undefined;
  const isScooter = category === "scooter";
  const canSubmit = Boolean(state.name.trim() && state.email.trim() && state.phone.trim());
  const showOnRequestNote =
    !isScooter &&
    (isOnRequestPickup(state.pickupLocation) || isOnRequestPickup(state.returnLocation));

  function setPickup(location: PickupLocation) {
    if (isScooter) {
      onChange({ pickupLocation: "apollonia", returnLocation: "apollonia" });
      return;
    }
    onChange({ pickupLocation: location });
  }

  function setReturn(location: PickupLocation) {
    if (isScooter) {
      onChange({ returnLocation: "apollonia" });
      return;
    }
    onChange({ returnLocation: location });
  }

  return (
    <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(300px,22rem)] lg:gap-0">
      <div className="min-w-0 lg:pr-10">
        <h2 className="font-display text-2xl text-aegean md:text-3xl">{t("stepDetailsTitle")}</h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-aegean/60">{t("stepDetailsLead")}</p>

        <section className="mt-10">
          <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-aegean/45">
            {t("contactSection")}
          </h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field
              label={t("name")}
              name="name"
              value={state.name}
              onValue={(v) => onChange({ name: v })}
              required
            />
            <div>
              <Field
                label={t("email")}
                name="email"
                type="email"
                value={state.email}
                onValue={(v) => onChange({ email: v })}
                required
              />
              <ValidationError
                prefix="Email"
                field="email"
                errors={formspreeErrors ?? null}
                className="mt-1.5 text-sm text-olive"
              />
            </div>
            <Field
              label={t("phone")}
              name="phone"
              value={state.phone}
              onValue={(v) => onChange({ phone: v })}
              required
            />
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium text-aegean/75">{t("partySize")}</span>
              <input
                type="number"
                name="partySize"
                min={1}
                max={9}
                inputMode="numeric"
                value={state.partySize}
                onChange={(e) =>
                  onChange({ partySize: Math.min(9, Math.max(1, Number(e.target.value) || 1)) })
                }
                className={fieldClass}
              />
            </label>
          </div>
          <ValidationError
            errors={formspreeErrors ?? null}
            className="mt-3 text-sm text-olive"
          />
        </section>

        <section className="mt-10 border-t border-aegean/10 pt-10">
          <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-aegean/45">
            {t("locationsSection")}
          </h3>
          <p className="mt-2 text-sm text-aegean/55">
            {isScooter ? t("scooterPickupNote") : t("carPickupNote")}
          </p>

          {isScooter ? (
            <p className="mt-5 text-sm font-medium text-aegean">
              {t("places.apollonia")}
            </p>
          ) : (
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <LocationSelect
                label={t("pickupLocation")}
                name="pickupLocation"
                value={state.pickupLocation}
                onChange={setPickup}
                freeLabel={t("pickupFree")}
                requestLabel={t("pickupOnRequest")}
                placeLabel={(id) => t(`places.${id}`)}
              />
              <LocationSelect
                label={t("returnLocation")}
                name="returnLocation"
                value={state.returnLocation}
                onChange={setReturn}
                freeLabel={t("pickupFree")}
                requestLabel={t("pickupOnRequest")}
                placeLabel={(id) => t(`places.${id}`)}
              />
            </div>
          )}

          {showOnRequestNote && (
            <p className="mt-3 text-sm text-olive">{t("onRequestFeeNote")}</p>
          )}

          <label className="mt-6 flex cursor-pointer items-center gap-2.5">
            <input
              type="checkbox"
              checked={state.childSeat}
              onChange={(e) => onChange({ childSeat: e.target.checked })}
              className="h-4 w-4 rounded border-aegean/30 accent-aegean"
            />
            <span className="text-sm font-medium text-aegean/80">{t("childSeat")}</span>
          </label>
        </section>

        <section className="mt-10 border-t border-aegean/10 pt-10">
          <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-aegean/45">
            {t("notesSection")}
          </h3>
          <div className="mt-4 space-y-5">
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium text-aegean/75">{t("arrivalInfo")}</span>
              <input
                value={state.arrivalInfo}
                onChange={(e) => onChange({ arrivalInfo: e.target.value })}
                placeholder={t("arrivalInfoPlaceholder")}
                className={`${fieldClass} placeholder:text-aegean/35`}
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium text-aegean/75">{t("message")}</span>
              <textarea
                id="message"
                name="message"
                rows={3}
                value={state.message}
                onChange={(e) => onChange({ message: e.target.value })}
                className={`${fieldClass} resize-none`}
              />
              <ValidationError
                prefix="Message"
                field="message"
                errors={formspreeErrors ?? null}
                className="mt-1.5 text-sm text-olive"
              />
            </label>
          </div>
        </section>

        <div className="mt-10">
          <button
            type="button"
            onClick={onBack}
            disabled={status === "sending"}
            className="text-sm font-semibold text-aegean/65 underline-offset-4 transition hover:text-aegean hover:underline disabled:opacity-50"
          >
            ← {t("back")}
          </button>
        </div>
      </div>

      <BookingSummary
        state={state}
        vehicle={selected}
        estimatedTotal={estimatedTotal}
        status={status}
        canSubmit={canSubmit}
        whatsappHref={whatsappHref}
        onSubmit={onSubmit}
      />
    </div>
  );
}

function Field({
  label,
  name,
  value,
  onValue,
  type = "text",
  required,
}: {
  label: string;
  name?: string;
  value: string;
  onValue: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block font-medium text-aegean/75">{label}</span>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        value={value}
        onChange={(e) => onValue(e.target.value)}
        className={fieldClass}
      />
    </label>
  );
}

function LocationSelect({
  label,
  name,
  value,
  onChange,
  freeLabel,
  requestLabel,
  placeLabel,
}: {
  label: string;
  name: string;
  value: PickupLocation;
  onChange: (value: PickupLocation) => void;
  freeLabel: string;
  requestLabel: string;
  placeLabel: (id: PickupLocation) => string;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block font-medium text-aegean/75">{label}</span>
      <select
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value as PickupLocation)}
        className={`${fieldClass} cursor-pointer pr-6`}
      >
        <optgroup label={freeLabel}>
          {CAR_FREE_PICKUPS.map((id) => (
            <option key={id} value={id}>
              {placeLabel(id)}
            </option>
          ))}
        </optgroup>
        <optgroup label={requestLabel}>
          {CAR_REQUEST_PICKUPS.map((id) => (
            <option key={id} value={id}>
              {placeLabel(id)}
            </option>
          ))}
        </optgroup>
      </select>
    </label>
  );
}
