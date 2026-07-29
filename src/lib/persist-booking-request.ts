import { createClient } from "@supabase/supabase-js";

export type PersistEnquiryInput = {
  name: string;
  email: string;
  phone: string;
  vehicle?: string;
  pickup: string;
  returnDate: string;
  pickupLocation?: string;
  returnLocation?: string;
  childSeat?: boolean;
  arrivalInfo?: string;
  partySize?: number;
  estimatedTotal?: number;
  message?: string;
  locale?: string;
  source?: string;
};

/**
 * Persist a website enquiry into booking_requests (service role).
 * Soft-fails: never throws; returns ok:false on skip/error.
 */
export async function persistBookingRequest(data: PersistEnquiryInput) {
  if (process.env.BOOKING_REQUESTS_PERSIST !== "true") {
    return { ok: false as const, skipped: "persist_disabled" as const };
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.info("[booking-request]", {
      ok: false,
      skipped: "missing_supabase_env",
    });
    return { ok: false as const, skipped: "missing_supabase_env" as const };
  }

  try {
    const supabase = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: row, error } = await supabase
      .from("booking_requests")
      .insert({
        customer_name: data.name,
        customer_email: data.email,
        customer_phone: data.phone,
        requested_vehicle: data.vehicle?.trim() || null,
        check_in: data.pickup,
        check_out: data.returnDate,
        pickup_location: data.pickupLocation ?? null,
        return_location: data.returnLocation ?? data.pickupLocation ?? null,
        child_seat: Boolean(data.childSeat),
        party_size: data.partySize ?? null,
        arrival_info: data.arrivalInfo?.trim() || null,
        message: data.message?.trim() || null,
        estimated_total:
          data.estimatedTotal != null ? Number(data.estimatedTotal) : null,
        locale: data.locale ?? null,
        source: data.source ?? "website",
        status: "new",
      })
      .select("id")
      .single();

    if (error) {
      console.info("[booking-request]", {
        ok: false,
        error: error.message,
      });
      return { ok: false as const, error: error.message };
    }

    console.info("[booking-request]", { ok: true, id: row.id });
    return { ok: true as const, id: row.id as string };
  } catch (error) {
    console.info("[booking-request]", {
      ok: false,
      error: error instanceof Error ? error.message : "unknown",
    });
    return { ok: false as const, error: "exception" };
  }
}
