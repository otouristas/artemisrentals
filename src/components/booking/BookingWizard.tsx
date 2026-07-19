"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "@formspree/react";
import { getAllVehicles, getVehicleBySlug, estimateRateForDate } from "@/lib/fleet";
import { trackEvent } from "@/lib/analytics";
import { buildFormspreeEnquiryPayload, FORMSPREE_FORM_ID } from "@/lib/formspree";
import { whatsappUrl } from "@/lib/site";
import { asLocale } from "@/lib/i18n-locale";
import { buildWhatsAppEnquiryText } from "@/lib/whatsapp-enquiry";
import { WizardProgress } from "./WizardProgress";
import { StepVehicle } from "./StepVehicle";
import { StepDates } from "./StepDates";
import { StepDetails } from "./StepDetails";
import {
  normalizeBookingStep,
  type BookingState,
  type BookingStatus,
  type BookingStep,
} from "./types";

const LAST_STEP: BookingStep = 3;

function parseISODate(value?: string) {
  if (!value) return undefined;
  const d = new Date(`${value}T00:00:00`);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

function computeEstimatedTotal(rateKey: string | null, from: string, to: string) {
  if (!rateKey) return null;
  const start = parseISODate(from);
  const end = parseISODate(to);
  if (!start || !end || end < start) return null;
  let total = 0;
  const cursor = new Date(start);
  while (cursor <= end) {
    const rate = estimateRateForDate(rateKey, cursor);
    if (rate == null) return null;
    total += rate;
    cursor.setDate(cursor.getDate() + 1);
  }
  return total;
}

function updateUrlParams(patch: Record<string, string | undefined>) {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams(window.location.search);
  for (const [key, value] of Object.entries(patch)) {
    if (value) params.set(key, value);
    else params.delete(key);
  }
  const query = params.toString();
  const newUrl = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`;
  window.history.replaceState(window.history.state, "", newUrl);
}

export function BookingWizard({
  locale,
  defaultVehicle,
  defaultFrom,
  defaultTo,
}: {
  locale: string;
  defaultVehicle?: string;
  defaultFrom?: string;
  defaultTo?: string;
}) {
  const vehicles = useMemo(() => getAllVehicles(), []);
  const hasDeepLink = Boolean(defaultVehicle && defaultFrom && defaultTo);

  const [step, setStep] = useState<BookingStep>(hasDeepLink ? 3 : 1);
  const [furthestStep, setFurthestStep] = useState<BookingStep>(hasDeepLink ? 3 : 1);

  const [state, setState] = useState<BookingState>({
    vehicle: defaultVehicle ?? "",
    from: defaultFrom ?? "",
    to: defaultTo ?? "",
    name: "",
    email: "",
    phone: "",
    pickupLocation: "apollonia",
    returnLocation: "apollonia",
    childSeat: false,
    arrivalInfo: "",
    partySize: 1,
    message: "",
  });

  const [status, setStatus] = useState<BookingStatus>("idle");
  /** Formspree form id xaqrovvz — same as useForm("xaqrovvz") in Formspree's React docs. */
  const [formspree, handleFormspree, resetFormspree] = useForm(FORMSPREE_FORM_ID);

  const selectedVehicle = state.vehicle ? getVehicleBySlug(state.vehicle) : undefined;
  const rateKey = selectedVehicle?.rateKey ?? null;

  const estimatedTotal = useMemo(
    () => computeEstimatedTotal(rateKey, state.from, state.to),
    [rateKey, state.from, state.to],
  );

  useEffect(() => {
    const raw = new URLSearchParams(window.location.search).get("step");
    if (raw == null) return;
    const normalized = normalizeBookingStep(raw);
    setStep(normalized);
    setFurthestStep((prev) => (normalized > prev ? normalized : prev));
  }, []);

  useEffect(() => {
    updateUrlParams({
      vehicle: state.vehicle || undefined,
      from: state.from || undefined,
      to: state.to || undefined,
      pickup: state.pickupLocation !== "apollonia" ? state.pickupLocation : undefined,
      party: state.partySize > 1 ? String(state.partySize) : undefined,
      childSeat: state.childSeat ? "1" : undefined,
      step: step !== 1 ? String(step) : undefined,
    });
  }, [state.vehicle, state.from, state.to, state.pickupLocation, state.partySize, state.childSeat, step]);

  function updateState(patch: Partial<BookingState>) {
    setState((prev) => {
      const next = { ...prev, ...patch };
      if (patch.vehicle !== undefined) {
        const v = patch.vehicle ? getVehicleBySlug(patch.vehicle) : undefined;
        if (v?.category === "scooter") {
          next.pickupLocation = "apollonia";
          next.returnLocation = "apollonia";
        }
      }
      return next;
    });
  }

  function goToStep(next: BookingStep) {
    setStep(next);
    setFurthestStep((prev) => (next > prev ? next : prev));
  }

  function goNext() {
    goToStep(Math.min(LAST_STEP, step + 1) as BookingStep);
  }

  function goBack() {
    goToStep(Math.max(1, step - 1) as BookingStep);
  }

  /** Guest → desk link (manual). Auto ack is business → guest via Cloud API. */
  function enquiryWhatsAppUrl() {
    return whatsappUrl(
      buildWhatsAppEnquiryText({
        locale: asLocale(locale),
        name: state.name.trim() || undefined,
        vehicleName: selectedVehicle?.name,
        from: state.from || undefined,
        to: state.to || undefined,
        partySize: state.partySize,
      }),
    );
  }

  async function submit() {
    if (status === "sending" || formspree.submitting) return;
    resetFormspree();
    setStatus("sending");
    try {
      await handleFormspree(
        buildFormspreeEnquiryPayload({
          name: state.name,
          email: state.email,
          phone: state.phone,
          vehicle: state.vehicle || undefined,
          pickup: state.from,
          returnDate: state.to,
          pickupLocation: state.pickupLocation,
          returnLocation: state.returnLocation,
          childSeat: state.childSeat,
          arrivalInfo: state.arrivalInfo || undefined,
          partySize: state.partySize,
          message: state.message || undefined,
          estimatedTotal: estimatedTotal ?? undefined,
          locale,
          source: "booking-wizard",
        }),
      );
    } catch {
      setStatus("error");
    }
  }

  // After useForm finishes (succeeded / errors), continue with Resend + WhatsApp via /api/book.
  useEffect(() => {
    if (status !== "sending" || formspree.submitting) return;

    if (formspree.errors) {
      setStatus("error");
      return;
    }
    if (!formspree.succeeded) return;

    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/book", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: state.name,
            email: state.email,
            phone: state.phone,
            vehicle: state.vehicle || undefined,
            pickup: state.from,
            returnDate: state.to,
            pickupLocation: state.pickupLocation,
            returnLocation: state.returnLocation,
            childSeat: state.childSeat,
            arrivalInfo: state.arrivalInfo || undefined,
            partySize: state.partySize,
            message: state.message || undefined,
            estimatedTotal: estimatedTotal ?? undefined,
            locale,
            formspreeClient: true,
            source: "booking-wizard",
          }),
        });
        if (cancelled) return;
        if (res.ok) {
          trackEvent("generate_lead", {
            method: "form",
            vehicle: state.vehicle || undefined,
            locale,
          });
          setStatus("success");
        } else {
          // Formspree already received the lead; still show success for the guest.
          trackEvent("generate_lead", {
            method: "form",
            vehicle: state.vehicle || undefined,
            locale,
          });
          setStatus("success");
        }
      } catch {
        if (!cancelled) {
          trackEvent("generate_lead", {
            method: "form",
            vehicle: state.vehicle || undefined,
            locale,
          });
          setStatus("success");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    status,
    formspree.submitting,
    formspree.succeeded,
    formspree.errors,
    state.name,
    state.email,
    state.phone,
    state.vehicle,
    state.from,
    state.to,
    state.pickupLocation,
    state.returnLocation,
    state.childSeat,
    state.arrivalInfo,
    state.partySize,
    state.message,
    estimatedTotal,
    locale,
  ]);

  return (
    <div>
      <WizardProgress step={step} furthestStep={furthestStep} onStepClick={goToStep} />

      <div className="mt-5 md:mt-8">
        {step === 1 && (
          <StepVehicle
            vehicles={vehicles}
            value={state.vehicle}
            onChange={(vehicle) => updateState({ vehicle })}
            onNext={goNext}
          />
        )}
        {step === 2 && (
          <StepDates
            from={state.from}
            to={state.to}
            rateKey={rateKey}
            onChange={(from, to) => updateState({ from, to })}
            onNext={goNext}
            onBack={goBack}
          />
        )}
        {step === 3 && (
          <StepDetails
            state={state}
            vehicle={selectedVehicle}
            estimatedTotal={estimatedTotal}
            status={status}
            formspreeErrors={formspree.errors}
            whatsappHref={enquiryWhatsAppUrl()}
            onChange={updateState}
            onBack={goBack}
            onSubmit={submit}
          />
        )}
      </div>
    </div>
  );
}
