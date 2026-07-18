"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { tripPlannerUrl } from "@/lib/site";

type SuggestionKey = "suggestFleet" | "suggestRates" | "suggestPickup" | "suggestHop";

const SUGGESTIONS: SuggestionKey[] = [
  "suggestFleet",
  "suggestRates",
  "suggestPickup",
  "suggestHop",
];

function textFromParts(parts: unknown): string {
  if (!Array.isArray(parts)) return "";
  return parts
    .filter((p): p is { type: "text"; text: string } => {
      return (
        typeof p === "object" &&
        p !== null &&
        "type" in p &&
        (p as { type: string }).type === "text" &&
        "text" in p
      );
    })
    .map((p) => p.text)
    .join("");
}

function toolCardsFromParts(
  parts: unknown,
): { type: string; url?: string; name?: string; rate?: number }[] {
  if (!Array.isArray(parts)) return [];
  const cards: { type: string; url?: string; name?: string; rate?: number }[] = [];
  for (const part of parts) {
    if (typeof part !== "object" || part === null || !("type" in part)) continue;
    const p = part as {
      type: string;
      state?: string;
      output?: Record<string, unknown>;
      toolName?: string;
    };
    if (!p.type.startsWith("tool-") && p.type !== "tool-invocation") continue;
    const output = p.output;
    if (!output || typeof output !== "object") continue;
    if (typeof output.url === "string") {
      cards.push({
        type: p.type.includes("startBooking") || p.toolName === "startBooking" ? "book" : "planner",
        url: output.url,
      });
    }
    if (typeof output.name === "string") {
      cards.push({ type: "vehicle", name: output.name });
    }
    if (typeof output.dailyRate === "number") {
      cards.push({ type: "rate", rate: output.dailyRate });
    }
  }
  return cards;
}

export function TouristasChat({ locale }: { locale: string }) {
  const t = useTranslations("Chat");
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [pendingPrompt, setPendingPrompt] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: { locale },
      }),
    [locale],
  );
  const { messages, sendMessage, status } = useChat({ transport });
  const streaming = status === "streaming";

  useEffect(() => {
    function onOpen(e: Event) {
      setOpen(true);
      const detail = (e as CustomEvent<{ prompt?: string }>).detail;
      if (detail?.prompt) setPendingPrompt(detail.prompt);
    }
    window.addEventListener("touristas:open", onOpen);
    return () => window.removeEventListener("touristas:open", onOpen);
  }, []);

  useEffect(() => {
    if (!pendingPrompt || !open) return;
    const prompt = pendingPrompt;
    setPendingPrompt(null);
    void sendMessage({ text: prompt });
  }, [pendingPrompt, open, sendMessage]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, streaming, open]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || streaming) return;
    setInput("");
    await sendMessage({ text });
  }

  async function sendSuggestion(key: SuggestionKey) {
    if (streaming) return;
    await sendMessage({ text: t(key) });
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3 md:bottom-6 md:right-6">
      {open && (
        <div className="animate-dock flex h-[min(72vh,600px)] w-[min(94vw,400px)] flex-col overflow-hidden rounded-2xl shadow-2xl ring-1 ring-aegean/20">
          <div className="touristas-panel flex items-start justify-between gap-3 px-4 py-3.5 text-foam">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sun/90 text-aegean">
                <TouristasMark />
              </div>
              <div>
                <p className="font-display text-lg leading-tight">{t("title")}</p>
                <p className="mt-0.5 flex items-center gap-1.5 text-xs text-foam/70">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  {t("statusOnline")}
                </p>
                <p className="mt-1 text-xs text-foam/55">{t("subtitle")}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg px-2 py-1 text-sm text-foam/80 hover:bg-foam/10"
              aria-label={t("close")}
            >
              ✕
            </button>
          </div>

          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto bg-foam px-4 py-3 text-sm">
            <div className="animate-message-in rounded-2xl bg-limestone/80 px-3 py-2.5 text-aegean/90">
              {t("greeting")}
            </div>

            {messages.length === 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {SUGGESTIONS.map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => void sendSuggestion(key)}
                    className="rounded-xl border border-aegean/12 bg-salt px-3 py-1.5 text-left text-xs font-medium text-aegean transition hover:border-sun/40 hover:bg-sun/10"
                  >
                    {t(key)}
                  </button>
                ))}
              </div>
            )}

            {messages.map((m) => {
              const text = textFromParts(m.parts);
              const cards = toolCardsFromParts(m.parts);
              if (!text && cards.length === 0) return null;
              const isUser = m.role === "user";
              return (
                <div key={m.id} className="animate-message-in space-y-2">
                  {text ? (
                    <div
                      className={
                        isUser
                          ? "ml-8 rounded-2xl bg-aegean px-3 py-2 text-foam"
                          : "mr-6 rounded-2xl bg-limestone/80 px-3 py-2 text-aegean"
                      }
                    >
                      {text}
                    </div>
                  ) : null}
                  {!isUser &&
                    cards.map((card, i) => (
                      <ToolCard key={`${m.id}-${i}`} card={card} t={t} />
                    ))}
                </div>
              );
            })}

            {streaming && (
              <div className="mr-6 flex gap-1 rounded-2xl bg-limestone/80 px-3 py-3">
                <span className="typing-dot h-1.5 w-1.5 rounded-full bg-aegean/50" />
                <span className="typing-dot h-1.5 w-1.5 rounded-full bg-aegean/50 [animation-delay:0.15s]" />
                <span className="typing-dot h-1.5 w-1.5 rounded-full bg-aegean/50 [animation-delay:0.3s]" />
              </div>
            )}
          </div>

          <div className="border-t border-aegean/10 bg-foam px-3 py-2.5">
            <a
              href={tripPlannerUrl(locale, "Plan a Cyclades trip including Sifnos")}
              target="_blank"
              rel="noopener noreferrer"
              className="mb-2 block text-center text-xs font-medium text-olive underline-offset-2 hover:underline"
            >
              {t("tripPlanner")}
            </a>
            <form onSubmit={onSubmit} className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t("placeholder")}
                className="flex-1 rounded-xl border border-aegean/15 px-3 py-2.5 text-sm outline-none ring-sun/30 focus:ring"
              />
              <button
                type="submit"
                disabled={streaming}
                className="rounded-xl bg-sun px-4 py-2.5 text-sm font-semibold text-aegean disabled:opacity-50"
              >
                {t("send")}
              </button>
            </form>
            <p className="mt-1.5 text-center text-[10px] text-aegean/45">{t("powered")}</p>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`touristas-beacon animate-dock inline-flex items-center gap-2 rounded-2xl bg-aegean px-4 py-3 text-sm font-semibold text-foam shadow-xl ring-1 ring-foam/20 transition hover:bg-aegean-deep ${open ? "opacity-90" : ""}`}
        aria-label={t("open")}
      >
        <TouristasMark className="h-4 w-4 text-sun" />
        {t("title")}
      </button>
    </div>
  );
}

function TouristasMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className ?? "h-5 w-5"} aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M12 5v2.5M12 16.5V19M5 12h2.5M16.5 12H19"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="12" cy="12" r="2.2" fill="currentColor" />
      <path
        d="M12 7.5c2.2 1.2 3.5 2.6 3.5 4.5S14.2 15.8 12 16.5C9.8 15.8 8.5 14.4 8.5 12S9.8 8.7 12 7.5Z"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.55"
      />
    </svg>
  );
}

function ToolCard({
  card,
  t,
}: {
  card: { type: string; url?: string; name?: string; rate?: number };
  t: (key: string, values?: Record<string, string | number | Date>) => string;
}) {
  if (card.type === "book" && card.url) {
    const href = card.url.replace(/^\/(en|el)/, "") || "/book";
    return (
      <Link
        href={href}
        className="mr-6 block rounded-xl border border-aegean/12 bg-salt px-3 py-2.5 text-sm font-semibold text-aegean hover:border-sun/40"
      >
        {t("toolBook")}
      </Link>
    );
  }
  if (card.type === "planner" && card.url) {
    return (
      <a
        href={card.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mr-6 block rounded-xl border border-olive/20 bg-olive/5 px-3 py-2.5 text-sm font-semibold text-olive hover:bg-olive/10"
      >
        {t("toolPlanner")}
      </a>
    );
  }
  if (card.type === "vehicle" && card.name) {
    return (
      <p className="mr-6 rounded-xl bg-salt px-3 py-2 text-xs text-aegean/75">{card.name}</p>
    );
  }
  if (card.type === "rate" && card.rate != null) {
    return (
      <p className="mr-6 rounded-xl bg-salt px-3 py-2 text-xs font-medium text-olive">
        {t("toolRate", { price: card.rate })}
      </p>
    );
  }
  return null;
}
