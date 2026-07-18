import { answerTouristasLocal, type ChatDraft } from "@/lib/touristas-local";
import { asLocale } from "@/lib/i18n-locale";

export const maxDuration = 30;

type IncomingMessage = {
  role?: string;
  parts?: Array<{ type?: string; text?: string }>;
  content?: string;
};

function lastUserText(messages: IncomingMessage[] | undefined): string {
  if (!Array.isArray(messages)) return "";
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const m = messages[i];
    if (m.role !== "user") continue;
    if (typeof m.content === "string" && m.content.trim()) return m.content.trim();
    if (Array.isArray(m.parts)) {
      const text = m.parts
        .filter((p) => p.type === "text" && typeof p.text === "string")
        .map((p) => p.text!)
        .join("")
        .trim();
      if (text) return text;
    }
  }
  return "";
}

function asDraft(value: unknown): ChatDraft {
  if (!value || typeof value !== "object") return {};
  return value as ChatDraft;
}

/**
 * Local Touristas only: answers from Artemis fleet, rates, FAQs and guide content.
 * Keeps a booking draft across turns for conversational enquiries.
 */
export async function POST(req: Request) {
  const body = (await req.json()) as {
    messages?: IncomingMessage[];
    message?: string;
    locale?: string;
    draft?: ChatDraft;
  };
  const locale = asLocale(body.locale);
  const text =
    (typeof body.message === "string" && body.message.trim()) ||
    lastUserText(body.messages);

  if (!text) {
    return Response.json({ error: "Empty message" }, { status: 400 });
  }

  const reply = answerTouristasLocal(text, locale, asDraft(body.draft));
  return Response.json(reply);
}
