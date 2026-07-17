import { z } from "zod";
import { Resend } from "resend";
import { business } from "@/lib/site";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(5),
  vehicle: z.string().optional(),
  pickup: z.string().min(4),
  returnDate: z.string().min(4),
  message: z.string().optional(),
  locale: z.string().optional(),
});

export async function POST(req: Request) {
  const json = await req.json();
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return Response.json({ error: "Invalid form" }, { status: 400 });
  }

  const data = parsed.data;
  const summary = [
    `New Artemis booking enquiry`,
    `Name: ${data.name}`,
    `Email: ${data.email}`,
    `Phone: ${data.phone}`,
    `Vehicle: ${data.vehicle || "any"}`,
    `Pickup: ${data.pickup}`,
    `Return: ${data.returnDate}`,
    `Locale: ${data.locale || "en"}`,
    `Message: ${data.message || "-"}`,
  ].join("\n");

  if (!process.env.RESEND_API_KEY) {
    console.info("[book-enquiry]", summary);
    return Response.json({
      ok: true,
      mode: "log",
      message: "Enquiry logged (RESEND_API_KEY not set)",
    });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const from = process.env.BOOKING_FROM_EMAIL ?? "Artemis Rental <onboarding@resend.dev>";

  await resend.emails.send({
    from,
    to: business.email,
    replyTo: data.email,
    subject: `Booking enquiry — ${data.name} — ${data.pickup}`,
    text: summary,
  });

  await resend.emails.send({
    from,
    to: data.email,
    subject:
      data.locale === "el"
        ? "Λάβαμε το αίτημά σας — Artemis Rental"
        : "We received your enquiry — Artemis Rental",
    text:
      data.locale === "el"
        ? `Γεια σας ${data.name},\n\nΕυχαριστούμε για το αίτημα ενοικίασης. Θα επικοινωνήσουμε σύντομα.\n\nArtemis Rental\n${business.phones[0].display}`
        : `Hi ${data.name},\n\nThanks for your rental enquiry. We will get back to you shortly.\n\nArtemis Rental\n${business.phones[0].display}`,
  });

  return Response.json({ ok: true });
}
