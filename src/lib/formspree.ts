import { buildDeskEnquiryEmail, type EnquiryEmailData } from "@/lib/enquiry-email";
import { ALL_CAR_PICKUPS } from "@/lib/pickup";

/** Public Formspree form for Artemis booking / contact enquiries. */
export const FORMSPREE_FORM_ID = "xaqrovvz";

export const FORMSPREE_ENDPOINT = `https://formspree.io/f/${FORMSPREE_FORM_ID}`;

export type FormspreeEnquiryInput = {
  name: string;
  email: string;
  phone: string;
  vehicle?: string;
  pickup?: string;
  returnDate?: string;
  pickupLocation?: string;
  returnLocation?: string;
  childSeat?: boolean;
  arrivalInfo?: string;
  partySize?: number;
  message?: string;
  estimatedTotal?: number;
  locale?: string;
  source?: string;
};

function asPickup(value: string | undefined): EnquiryEmailData["pickupLocation"] {
  if (!value) return undefined;
  return (ALL_CAR_PICKUPS as readonly string[]).includes(value)
    ? (value as NonNullable<EnquiryEmailData["pickupLocation"]>)
    : undefined;
}

function toEnquiryEmailData(data: FormspreeEnquiryInput): EnquiryEmailData {
  return {
    name: data.name,
    email: data.email,
    phone: data.phone,
    vehicle: data.vehicle,
    pickup: data.pickup ?? "",
    returnDate: data.returnDate ?? "",
    pickupLocation: asPickup(data.pickupLocation),
    returnLocation: asPickup(data.returnLocation),
    childSeat: data.childSeat,
    arrivalInfo: data.arrivalInfo,
    partySize: data.partySize,
    estimatedTotal: data.estimatedTotal,
    message: data.message,
    locale: data.locale,
  };
}

/**
 * Flat field map for Formspree.
 * Includes the same beautiful desk HTML/text as Resend (`html` / `text` / `_subject`).
 * In Formspree → Project → Templates, use {{{html}}} so the notification matches Resend.
 */
export function buildFormspreeEnquiryPayload(data: FormspreeEnquiryInput) {
  const enquiry = toEnquiryEmailData(data);
  const desk = buildDeskEnquiryEmail(enquiry);

  return {
    name: data.name,
    email: data.email,
    phone: data.phone,
    people: data.partySize ?? 1,
    vehicle: data.vehicle ?? "",
    pickup: enquiry.pickup,
    returnDate: enquiry.returnDate,
    pickupLocation: enquiry.pickupLocation ?? "apollonia",
    returnLocation: enquiry.returnLocation ?? enquiry.pickupLocation ?? "apollonia",
    childSeat: data.childSeat ? "yes" : "no",
    arrivalInfo: data.arrivalInfo ?? "",
    message: data.message ?? "",
    estimatedTotal: data.estimatedTotal ?? "",
    locale: data.locale ?? "",
    source: data.source ?? "website",
    html: desk.html,
    text: desk.text,
    _subject: desk.subject,
  };
}

/** Server-side Formspree submit (Touristas /api/book path). Soft-fail friendly. */
export async function submitToFormspree(data: FormspreeEnquiryInput) {
  const payload = buildFormspreeEnquiryPayload(data);
  try {
    const res = await fetch(FORMSPREE_ENDPOINT, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.info("[formspree]", { ok: false, status: res.status, body: body.slice(0, 300) });
      return { ok: false as const, status: res.status };
    }
    console.info("[formspree]", { ok: true, email: data.email });
    return { ok: true as const };
  } catch (error) {
    console.info("[formspree]", {
      ok: false,
      error: error instanceof Error ? error.message : "unknown",
    });
    return { ok: false as const, status: 0 };
  }
}
