/**
 * Send a sample scooter enquiry email via Resend.
 * Usage: npx tsx scripts/send-test-enquiry.ts
 */
import { readFileSync } from "node:fs";
import { Resend } from "resend";
import {
  buildDeskEnquiryEmail,
  buildGuestEnquiryEmail,
} from "../src/lib/enquiry-email";

function loadEnvFile(path: string) {
  try {
    const raw = readFileSync(path, "utf8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq < 1) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    /* missing file is fine */
  }
}

async function main() {
  loadEnvFile(".env.local");
  loadEnvFile(".env");

  const to = process.argv[2] || "kasiotisg@gmail.com";
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.error(
      "RESEND_API_KEY is not set. Add it to .env.local, then rerun:\n  npx tsx scripts/send-test-enquiry.ts",
    );
    process.exit(1);
  }

  const sample = {
    name: "Giorgio Kasiotis",
    email: to,
    phone: "+30 6977 337213",
    vehicle: "SYM Symphony 125",
    pickup: "2026-07-19",
    returnDate: "2026-07-23",
    pickupLocation: "apollonia" as const,
    returnLocation: "apollonia" as const,
    partySize: 2,
    locale: "en",
    message: "Test scooter enquiry from Touristas / booking email template.",
  };

  const guest = buildGuestEnquiryEmail(sample);
  const desk = buildDeskEnquiryEmail(sample);
  const resend = new Resend(apiKey);
  const from =
    process.env.BOOKING_FROM_EMAIL || "Artemis Rental <onboarding@resend.dev>";

  const guestSend = await resend.emails.send({
    from,
    to,
    subject: `[TEST] ${guest.subject}`,
    html: guest.html,
    text: guest.text,
  });

  const deskSend = await resend.emails.send({
    from,
    to,
    subject: `[TEST DESK] ${desk.subject}`,
    html: desk.html,
    text: desk.text,
  });

  console.log("From:", from);
  console.log("To:", to);
  console.log("Guest email:", guestSend);
  console.log("Desk preview email:", deskSend);

  if (guestSend.error || deskSend.error) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
