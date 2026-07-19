import type { Locale } from "@/i18n/routing";
import { phoneToWhatsAppDigits } from "@/lib/whatsapp-enquiry";

export type WhatsAppSendResult =
  | { ok: true; mode: "sent"; messageId?: string }
  | { ok: false; mode: "skipped" | "error"; reason: string };

function cloudConfig() {
  const token = process.env.WHATSAPP_ACCESS_TOKEN?.trim();
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim();
  const apiVersion = process.env.WHATSAPP_API_VERSION?.trim() || "v21.0";
  if (!token || !phoneNumberId) return null;
  return { token, phoneNumberId, apiVersion };
}

/** Short ack: business → guest after web enquiry. */
export function buildWhatsAppGuestAckText({
  locale,
  name,
}: {
  locale: Locale;
  name: string;
}) {
  const who = name.trim() || "there";
  const templates: Record<Locale, string> = {
    en: `Hello ${who}, thank you for your rental request with Artemis Rental.\n\nWe received it and will get back to you as soon as possible.\n\nArtemis Rental, Apollonia, Sifnos`,
    el: `Γεια σας ${who}, ευχαριστούμε για το αίτημα ενοικίασης στην Artemis Rental.\n\nΤο λάβαμε και θα επικοινωνήσουμε μαζί σας το συντομότερο δυνατό.\n\nArtemis Rental, Απολλωνία, Σίφνος`,
    it: `Ciao ${who}, grazie per la richiesta di noleggio con Artemis Rental.\n\nL’abbiamo ricevuta e ti risponderemo il prima possibile.\n\nArtemis Rental, Apollonia, Sifnos`,
    fr: `Bonjour ${who}, merci pour votre demande de location chez Artemis Rental.\n\nNous l’avons bien reçue et nous vous recontacterons dès que possible.\n\nArtemis Rental, Apollonia, Sifnos`,
    de: `Hallo ${who}, danke für Ihre Mietanfrage bei Artemis Rental.\n\nWir haben sie erhalten und melden uns so schnell wie möglich.\n\nArtemis Rental, Apollonia, Sifnos`,
    sv: `Hej ${who}, tack för din hyresförfrågan till Artemis Rental.\n\nVi har mottagit den och återkommer så snart som möjligt.\n\nArtemis Rental, Apollonia, Sifnos`,
    nl: `Hallo ${who}, bedankt voor je verhuuraanvraag bij Artemis Rental.\n\nWe hebben deze ontvangen en nemen zo snel mogelijk contact met je op.\n\nArtemis Rental, Apollonia, Sifnos`,
  };
  return templates[locale] ?? templates.en;
}

/**
 * Send a WhatsApp message FROM the Artemis Business number TO the guest.
 * Uses Meta Cloud API. Fails soft if guest has no WhatsApp / API unset / send error.
 *
 * For first contact outside the 24h window, set WHATSAPP_TEMPLATE_NAME to an
 * approved template (body vars: {{1}}=name). Otherwise sends free-form text
 * (works in the customer-care window / test setups).
 */
export async function sendWhatsAppGuestAck({
  phone,
  name,
  locale,
}: {
  phone: string;
  name: string;
  locale: Locale;
}): Promise<WhatsAppSendResult> {
  const config = cloudConfig();
  if (!config) {
    return {
      ok: false,
      mode: "skipped",
      reason: "WHATSAPP_ACCESS_TOKEN or WHATSAPP_PHONE_NUMBER_ID not set",
    };
  }

  const to = phoneToWhatsAppDigits(phone);
  if (!to) {
    return { ok: false, mode: "skipped", reason: "invalid guest phone" };
  }

  const templateName = process.env.WHATSAPP_TEMPLATE_NAME?.trim();
  const templateLang =
    process.env.WHATSAPP_TEMPLATE_LANG?.trim() ||
    (locale === "el" ? "el" : "en");

  const body = templateName
    ? {
        messaging_product: "whatsapp",
        to,
        type: "template",
        template: {
          name: templateName,
          language: { code: templateLang },
          components: [
            {
              type: "body",
              parameters: [{ type: "text", text: name.trim() || "guest" }],
            },
          ],
        },
      }
    : {
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: {
          preview_url: false,
          body: buildWhatsAppGuestAckText({ locale, name }),
        },
      };

  const url = `https://graph.facebook.com/${config.apiVersion}/${config.phoneNumberId}/messages`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const json = (await res.json().catch(() => ({}))) as {
      messages?: { id?: string }[];
      error?: { message?: string; code?: number };
    };

    if (!res.ok) {
      const reason = json.error?.message || `WhatsApp API ${res.status}`;
      console.warn("[whatsapp-guest-ack]", { to, reason, code: json.error?.code });
      return { ok: false, mode: "error", reason };
    }

    return {
      ok: true,
      mode: "sent",
      messageId: json.messages?.[0]?.id,
    };
  } catch (err) {
    const reason = err instanceof Error ? err.message : "WhatsApp network error";
    console.warn("[whatsapp-guest-ack]", { to, reason });
    return { ok: false, mode: "error", reason };
  }
}
