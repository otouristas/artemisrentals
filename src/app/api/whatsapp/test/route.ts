import { z } from "zod";
import { asLocale } from "@/lib/i18n-locale";
import { sendWhatsAppGuestAck } from "@/lib/whatsapp-cloud";

const schema = z.object({
  phone: z.string().min(8),
  name: z.string().min(1).default("Test"),
  locale: z.string().optional(),
});

/**
 * Dev helper: POST { phone, name? } to send the guest ack FROM Artemis Business WA.
 * Disabled in production unless WHATSAPP_TEST_ENABLED=1.
 */
export async function POST(req: Request) {
  const allow =
    process.env.NODE_ENV !== "production" ||
    process.env.WHATSAPP_TEST_ENABLED === "1";
  if (!allow) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const json = await req.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return Response.json({ error: "Invalid body" }, { status: 400 });
  }

  const result = await sendWhatsAppGuestAck({
    phone: parsed.data.phone,
    name: parsed.data.name,
    locale: asLocale(parsed.data.locale),
  });

  return Response.json({ ok: result.ok, whatsapp: result });
}
