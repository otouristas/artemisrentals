import type { Vehicle } from "@/lib/fleet";
import type { PickupLocation } from "@/lib/pickup";

export type { Vehicle, PickupLocation };

export type BookingStep = 1 | 2 | 3;

export const BOOKING_STEPS: BookingStep[] = [1, 2, 3];

export interface BookingState {
  /** Vehicle slug, empty string means "not sure yet". */
  vehicle: string;
  /** ISO date (yyyy-mm-dd), empty string means unset. */
  from: string;
  /** ISO date (yyyy-mm-dd), empty string means unset. */
  to: string;
  name: string;
  email: string;
  phone: string;
  pickupLocation: PickupLocation;
  returnLocation: PickupLocation;
  childSeat: boolean;
  arrivalInfo: string;
  partySize: number;
  message: string;
}

export type BookingStatus = "idle" | "sending" | "success" | "error";

/** Clamp URL/legacy step values into the 3-step wizard (step 4 → 3). */
export function normalizeBookingStep(value: number | string | undefined | null): BookingStep {
  const n = typeof value === "string" ? Number(value) : value;
  if (n === 2) return 2;
  if (n === 3 || n === 4) return 3;
  return 1;
}
