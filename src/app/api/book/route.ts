import { z } from "zod";
import { Resend } from "resend";
import { business } from "@/lib/site";
import { ALL_CAR_PICKUPS } from "@/lib/pickup";
import { asLocale } from "@/lib/i18n-locale";
import {
  buildDeskEnquiryEmail,
  buildGuestEnquiryEmail,
} from "@/lib/enquiry-email";
import { sendWhatsAppGuestAck } from "@/lib/whatsapp-cloud";

const pickupEnum = z.enum(ALL_CAR_PICKUPS);

const schema = z.object({
  name: z.string().min(2),
  email: z.email(),
  phone: z.string().min(5),
  vehicle: z.string().optional(),
  pickup: z.string().min(4),
  returnDate: z.string().min(4),
  pickupLocation: pickupEnum.optional(),
  returnLocation: pickupEnum.optional(),
  childSeat: z.boolean().optional(),
  arrivalInfo: z.string().optional(),
  partySize: z.coerce.number().int().min(1).max(20).optional(),
  estimatedTotal: z.coerce.number().min(0).optional(),
  message: z.string().optional(),
  locale: z.string().optional(),
});

/**
 * On enquiry:
 * 1. Email → Artemis desk (if RESEND_API_KEY)
 * 2. Email → guest confirmation (if RESEND_API_KEY)
 * 3. WhatsApp → guest ack from Artemis Business number (if Cloud API configured)
 *    Soft-fails if guest has no WhatsApp / API error.
 */
export async function POST(req: Request) {
  const json = await req.json();
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return Response.json({ error: "Invalid form" }, { status: 400 });
  }

  const data = parsed.data;
  const locale = asLocale(data.locale);
  const payload = { ...data, locale };

  const requestEmail = buildDeskEnquiryEmail(payload);
  const confirmationEmail = buildGuestEnquiryEmail(payload);

  const emails: {
    mode: "sent" | "log";
    request: { to: string; subject: string };
    confirmation: { to: string; subject: string };
  } = {
    mode: "log",
    request: { to: business.email, subject: requestEmail.subject },
    confirmation: { to: data.email, subject: confirmationEmail.subject },
  };

  if (!process.env.RESEND_API_KEY) {
    console.info("[book-enquiry:request]", {
      to: business.email,
      subject: requestEmail.subject,
      text: requestEmail.text,
    });
    console.info("[book-enquiry:confirmation]", {
      to: data.email,
      subject: confirmationEmail.subject,
      text: confirmationEmail.text,
    });
  } else {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const from =
      process.env.BOOKING_FROM_EMAIL ??
      "Artemis Rental <onboarding@resend.dev>";

    await resend.emails.send({
      from,
      to: business.email,
      replyTo: data.email,
      subject: requestEmail.subject,
      html: requestEmail.html,
      text: requestEmail.text,
    });

    await resend.emails.send({
      from,
      to: data.email,
      subject: confirmationEmail.subject,
      html: confirmationEmail.html,
      text: confirmationEmail.text,
    });

    emails.mode = "sent";
  }

  // Business WhatsApp → guest (never blocks the enquiry if this fails)
  const whatsapp = await sendWhatsAppGuestAck({
    phone: data.phone,
    name: data.name,
    locale,
  });

  if (whatsapp.ok) {
    console.info("[book-enquiry:whatsapp]", {
      to: data.phone,
      messageId: whatsapp.messageId,
    });
  } else {
    console.info("[book-enquiry:whatsapp]", {
      to: data.phone,
      skipped: whatsapp.reason,
    });
  }

  return Response.json({
    ok: true,
    mode: emails.mode,
    emails: {
      request: emails.request,
      confirmation: emails.confirmation,
    },
    whatsapp,
  });
}
