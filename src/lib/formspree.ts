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

/** Flat field map Formspree stores / emails. */
export function buildFormspreeEnquiryPayload(data: FormspreeEnquiryInput) {
  return {
    name: data.name,
    email: data.email,
    phone: data.phone,
    vehicle: data.vehicle ?? "",
    pickup: data.pickup ?? "",
    returnDate: data.returnDate ?? "",
    pickupLocation: data.pickupLocation ?? "",
    returnLocation: data.returnLocation ?? "",
    childSeat: data.childSeat ? "yes" : "no",
    arrivalInfo: data.arrivalInfo ?? "",
    partySize: data.partySize ?? 1,
    message: data.message ?? "",
    estimatedTotal: data.estimatedTotal ?? "",
    locale: data.locale ?? "",
    source: data.source ?? "website",
    _subject: `Booking enquiry from ${data.name}`,
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
