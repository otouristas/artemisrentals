"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { tripPlannerUrl } from "@/lib/site";

export function TouristasChat({ locale }: { locale: string }) {
  const t = useTranslations("Chat");
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const transport = useMemo(() => new DefaultChatTransport({ api: "/api/chat" }), []);
  const { messages, sendMessage, status } = useChat({ transport });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || status === "streaming") return;
    setInput("");
    await sendMessage({ text });
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3 md:bottom-6 md:right-6">
      {open && (
        <div className="animate-dock flex h-[min(70vh,560px)] w-[min(92vw,380px)] flex-col overflow-hidden rounded-3xl bg-foam shadow-2xl ring-1 ring-aegean/15">
          <div className="flex items-start justify-between gap-3 bg-aegean px-4 py-3 text-foam">
            <div>
              <p className="font-display text-lg">{t("title")}</p>
              <p className="text-xs text-foam/70">{t("subtitle")}</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full px-2 py-1 text-sm text-foam/80 hover:bg-foam/10"
              aria-label={t("close")}
            >
              ✕
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3 text-sm">
            <p className="rounded-2xl bg-limestone/80 px-3 py-2 text-aegean/90">{t("greeting")}</p>
            {messages.map((m) => {
              const text = m.parts
                ?.filter((p): p is { type: "text"; text: string } => p.type === "text")
                .map((p) => p.text)
                .join("") ?? "";
              if (!text) return null;
              return (
                <div
                  key={m.id}
                  className={
                    m.role === "user"
                      ? "ml-8 rounded-2xl bg-aegean px-3 py-2 text-foam"
                      : "mr-6 rounded-2xl bg-limestone/80 px-3 py-2 text-aegean"
                  }
                >
                  {text}
                </div>
              );
            })}
          </div>

          <div className="border-t border-aegean/10 px-3 py-2">
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
                className="flex-1 rounded-full border border-aegean/15 px-3 py-2 text-sm outline-none ring-sun/30 focus:ring"
              />
              <button
                type="submit"
                disabled={status === "streaming"}
                className="rounded-full bg-sun px-4 py-2 text-sm font-semibold text-aegean disabled:opacity-50"
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
        className="animate-dock rounded-full bg-aegean px-5 py-3 text-sm font-semibold text-foam shadow-xl ring-1 ring-foam/20 transition hover:bg-aegean-deep"
        aria-label={t("open")}
      >
        {t("title")}
      </button>
    </div>
  );
}
