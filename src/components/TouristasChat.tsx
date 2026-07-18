"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { TouristasLauncher } from "@/components/TouristasLauncher";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { ChatMarkdown } from "@/components/chat-markdown";
import { whatsappUrl } from "@/lib/site";
import { buildWhatsAppEnquiryText } from "@/lib/whatsapp-enquiry";
import type {
  ChatDraft,
  ChatFollowUp,
  LocalChatCard,
  LocalChatReply,
} from "@/lib/touristas-local";

const STARTER_KEYS = ["suggestBook", "suggestFleet", "suggestDates", "suggestGuide"] as const;

const TOURISTAS_AI_URL = "https://touristas.ai";
const DRAFT_STORAGE_KEY = "artemis-touristas-draft";
const EXPANDED_KEY = "touristas:expanded";

type VehicleSummary = {
  slug?: string;
  name: string;
  category?: string;
  seats?: number;
  transmission?: string;
  engineCc?: number;
  image?: string;
  path?: string;
  fromPrice?: number | null;
  bookUrl?: string;
  whatsappUrl?: string;
};

type ChatMessage =
  | { id: string; role: "user"; text: string }
  | {
      id: string;
      role: "assistant";
      text: string;
      cards: LocalChatCard[];
      followUps?: ChatFollowUp[];
    };

function stripLocalePrefix(path: string) {
  return path.replace(/^\/(en|el|it|fr|de|sv|nl)(?=\/|$)/, "") || "/";
}

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function bookHrefFromDraft(draft: ChatDraft) {
  const params = new URLSearchParams();
  if (draft.vehicleSlug) params.set("vehicle", draft.vehicleSlug);
  if (draft.from) params.set("from", draft.from);
  if (draft.to) params.set("to", draft.to);
  if (draft.partySize && draft.partySize > 1) params.set("party", String(draft.partySize));
  const qs = params.toString();
  return qs ? `/book?${qs}` : "/book";
}

function draftSummaryBits(draft: ChatDraft, locale: string) {
  const bits: string[] = [];
  if (draft.vehicleName) bits.push(draft.vehicleName);
  else if (draft.category) bits.push(draft.category);
  if (draft.from && draft.to) bits.push(`${draft.from} → ${draft.to}`);
  else if (draft.from) bits.push(draft.from);
  if (draft.partySize) {
    const people: Record<string, string> = {
      en: `${draft.partySize} people`,
      el: `${draft.partySize} άτομα`,
      it: `${draft.partySize} persone`,
      fr: `${draft.partySize} personnes`,
      de: `${draft.partySize} Personen`,
      sv: `${draft.partySize} personer`,
      nl: `${draft.partySize} personen`,
    };
    bits.push(people[locale] ?? people.en);
  }
  if (draft.name) bits.push(draft.name);
  if (draft.email) bits.push(draft.email);
  if (draft.phone) bits.push(draft.phone);
  return bits;
}

export function TouristasChat({
  locale,
  autoOpen = false,
  autoPrompt,
  onAutoOpenConsumed,
}: {
  locale: string;
  autoOpen?: boolean;
  autoPrompt?: string;
  onAutoOpenConsumed?: () => void;
}) {
  const t = useTranslations("Chat");
  const pathname = usePathname();
  const router = useRouter();
  const prefersReduced = useReducedMotion();
  const [open, setOpen] = useState(autoOpen);
  const [expanded, setExpanded] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState<ChatDraft>({});
  const [followUps, setFollowUps] = useState<ChatFollowUp[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const pathWhenOpened = useRef<string | null>(null);
  const draftRef = useRef<ChatDraft>({});

  useEffect(() => {
    draftRef.current = draft;
    try {
      if (draft && Object.keys(draft).length > 0) {
        sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
      }
    } catch {
      /* ignore */
    }
  }, [draft]);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(DRAFT_STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as ChatDraft;
      if (saved && typeof saved === "object") {
        setDraft(saved);
        draftRef.current = saved;
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(EXPANDED_KEY) === "1") setExpanded(true);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    function onOpen(e: Event) {
      setOpen(true);
      pathWhenOpened.current = pathname;
      const detail = (e as CustomEvent<{ prompt?: string }>).detail;
      if (detail?.prompt) {
        queueMicrotask(() => {
          void ask(detail.prompt!);
        });
      }
    }
    window.addEventListener("touristas:open", onOpen);
    return () => window.removeEventListener("touristas:open", onOpen);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale, pathname]);

  useEffect(() => {
    if (!autoOpen) return;
    pathWhenOpened.current = pathname;
    setOpen(true);
    onAutoOpenConsumed?.();
    if (autoPrompt) {
      queueMicrotask(() => {
        void ask(autoPrompt);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoOpen, autoPrompt]);

  useEffect(() => {
    if (!open) {
      pathWhenOpened.current = null;
      return;
    }
    if (pathWhenOpened.current == null) {
      pathWhenOpened.current = pathname;
      return;
    }
    if (pathname !== pathWhenOpened.current) {
      setOpen(false);
    }
  }, [pathname, open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (e.shiftKey) {
          if (!open) {
            pathWhenOpened.current = pathname;
            setOpen(true);
            setExpanded(true);
            try {
              sessionStorage.setItem(EXPANDED_KEY, "1");
            } catch {
              /* ignore */
            }
            return;
          }
          setExpanded((prev) => {
            const next = !prev;
            try {
              sessionStorage.setItem(EXPANDED_KEY, next ? "1" : "0");
            } catch {
              /* ignore */
            }
            return next;
          });
          return;
        }
        if (open) {
          pathWhenOpened.current = null;
          setOpen(false);
        } else {
          pathWhenOpened.current = pathname;
          setOpen(true);
        }
        return;
      }
      if (e.key === "Escape" && open) {
        pathWhenOpened.current = null;
        setOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, pathname]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusTimer = window.setTimeout(() => inputRef.current?.focus(), 180);
    return () => {
      document.body.style.overflow = prev;
      window.clearTimeout(focusTimer);
    };
  }, [open]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy, open]);

  async function ask(text: string, draftOverride?: ChatDraft) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    const draftForRequest = draftOverride ?? draftRef.current;
    setError(null);
    setBusy(true);
    setFollowUps([]);
    setMessages((prev) => [...prev, { id: uid(), role: "user", text: trimmed }]);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          locale,
          draft: draftForRequest,
        }),
      });
      if (!res.ok) {
        throw new Error(t("unavailable"));
      }
      const data = (await res.json()) as LocalChatReply;
      const nextDraft = data.draft ?? draftForRequest;
      setDraft(nextDraft);
      draftRef.current = nextDraft;
      try {
        sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(nextDraft));
      } catch {
        /* ignore */
      }
      const nextFollowUps = Array.isArray(data.followUps) ? data.followUps : [];
      setFollowUps(nextFollowUps);
      setMessages((prev) => [
        ...prev,
        {
          id: uid(),
          role: "assistant",
          text: data.text,
          cards: Array.isArray(data.cards) ? data.cards : [],
          followUps: nextFollowUps,
        },
      ]);

      if (data.submitEnquiry) {
        const bookRes = await fetch("/api/book", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data.submitEnquiry),
        });
        if (!bookRes.ok) {
          setError(t("unavailable"));
        }
      }
    } catch {
      setError(t("unavailable"));
    } finally {
      setBusy(false);
    }
  }

  function clearChat() {
    if (busy) return;
    setMessages([]);
    setDraft({});
    draftRef.current = {};
    setFollowUps([]);
    setInput("");
    setError(null);
    try {
      sessionStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }

  function closeChat() {
    pathWhenOpened.current = null;
    setOpen(false);
  }

  function toggleOpen() {
    if (open) {
      closeChat();
      return;
    }
    pathWhenOpened.current = pathname;
    setOpen(true);
  }

  function toggleExpanded() {
    setExpanded((prev) => {
      const next = !prev;
      try {
        sessionStorage.setItem(EXPANDED_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  }

  function onFollowUp(item: ChatFollowUp) {
    if (item.type === "message") {
      void ask(item.label, draftRef.current);
      return;
    }
    if (item.type === "book") {
      closeChat();
      router.push(bookHrefFromDraft(draftRef.current));
      return;
    }
    if (item.type === "whatsapp") {
      const d = draftRef.current;
      const url = whatsappUrl(
        buildWhatsAppEnquiryText({
          locale: locale as "en" | "el" | "it" | "fr" | "de" | "sv" | "nl",
          vehicleName: d.vehicleName,
          from: d.from,
          to: d.to,
          partySize: d.partySize,
        }),
      );
      closeChat();
      window.open(url, "_blank", "noopener,noreferrer");
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    setInput("");
    await ask(text);
  }

  const progressBits = draftSummaryBits(draft, locale);
  // Only the current turn's chips. Never reuse older follow-ups (that caused date loops).
  const latestFollowUps = followUps;

  const panelClass = expanded
    ? "fixed inset-0 z-[9999] flex flex-col bg-foam md:inset-4 md:overflow-hidden md:rounded-[2rem] md:shadow-2xl md:ring-1 md:ring-aegean/15"
    : "fixed inset-0 z-[9999] flex flex-col bg-foam md:inset-auto md:bottom-6 md:right-6 md:h-[min(92vh,820px)] md:w-[min(100vw-2rem,480px)] md:overflow-hidden md:rounded-[2rem] md:shadow-2xl md:ring-1 md:ring-aegean/15";

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            key="touristas-panel"
            role="dialog"
            aria-modal="true"
            aria-label={t("title")}
            className={panelClass}
            initial={
              prefersReduced
                ? false
                : { opacity: 0, y: 24, scale: 0.96 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={
              prefersReduced
                ? undefined
                : { opacity: 0, y: 16, scale: 0.97 }
            }
            transition={
              prefersReduced
                ? { duration: 0 }
                : { type: "spring", damping: 26, stiffness: 320 }
            }
          >
            <header className="touristas-panel shrink-0 px-3 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] text-foam md:px-4 md:pt-3.5">
              <div className="flex items-center gap-3">
                <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sun text-aegean">
                  <TouristasMark className="h-5 w-5" />
                  <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#0f3348] bg-emerald-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-display text-lg leading-none">{t("title")}</p>
                  <p className="mt-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-foam/70">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    {t("statusLive")}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-0.5">
                  <button
                    type="button"
                    onClick={toggleExpanded}
                    className="hidden h-11 w-11 items-center justify-center rounded-xl text-foam/85 transition hover:bg-foam/10 md:inline-flex"
                    aria-label={expanded ? t("collapse") : t("expand")}
                    title={expanded ? t("collapse") : t("expand")}
                  >
                    {expanded ? (
                      <MinimizeIcon className="h-4 w-4" />
                    ) : (
                      <MaximizeIcon className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={clearChat}
                    disabled={messages.length === 0 || busy}
                    className="inline-flex h-11 items-center gap-1.5 rounded-xl px-3 text-sm font-medium text-foam/85 transition hover:bg-foam/10 disabled:cursor-not-allowed disabled:opacity-35"
                    aria-label={t("clear")}
                    title={t("clear")}
                  >
                    <TrashIcon className="h-4 w-4" />
                    <span className="hidden sm:inline">{t("clear")}</span>
                  </button>
                  <button
                    type="button"
                    onClick={closeChat}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-foam transition hover:bg-foam/15"
                    aria-label={t("close")}
                  >
                    <CloseIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <p className="mt-2 truncate text-xs text-foam/55">{t("subtitle")}</p>
              {progressBits.length > 0 && (
                <p className="mt-2 truncate text-[11px] text-sun/90">
                  {progressBits.join(" · ")}
                </p>
              )}
            </header>

            <div
              ref={listRef}
              className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain bg-foam px-4 py-4 text-sm"
            >
              <div className="animate-message-in rounded-2xl bg-salt px-3.5 py-3 text-aegean/90 ring-1 ring-aegean/8">
                {t("greeting")}
              </div>

              {messages.length === 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {STARTER_KEYS.map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => void ask(t(key))}
                      className="rounded-full bg-aegean/[0.05] px-3.5 py-2 text-left text-xs font-medium text-aegean ring-1 ring-aegean/10 transition hover:bg-aegean/[0.09]"
                    >
                      {t(key)}
                    </button>
                  ))}
                </div>
              )}

              {messages.map((m) => (
                <div key={m.id} className="animate-message-in space-y-2">
                  <div
                    className={
                      m.role === "user"
                        ? "ml-10 rounded-2xl bg-aegean px-3.5 py-2.5 text-foam"
                        : "mr-6 rounded-2xl bg-salt px-3.5 py-2.5 text-aegean ring-1 ring-aegean/8 whitespace-pre-wrap [&_p+p]:mt-2"
                    }
                  >
                    {m.role === "user" ? (
                      m.text
                    ) : (
                      <ChatMarkdown text={m.text} onNavigate={closeChat} />
                    )}
                  </div>
                  {m.role === "assistant" &&
                    m.cards.map((card, i) => (
                      <LocalCardView
                        key={`${m.id}-${i}`}
                        card={card}
                        t={t}
                        locale={locale}
                        onNavigate={closeChat}
                      />
                    ))}
                </div>
              ))}

              {!busy && latestFollowUps.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {latestFollowUps.map((item) => (
                    <button
                      key={`${item.type}-${item.label}`}
                      type="button"
                      onClick={() => onFollowUp(item)}
                      className="rounded-full bg-aegean/[0.05] px-3.5 py-2 text-left text-xs font-medium text-aegean ring-1 ring-aegean/10 transition hover:bg-aegean/[0.09]"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              )}

              {busy && (
                <div className="mr-6 flex gap-1.5 rounded-2xl bg-salt px-3.5 py-3.5 ring-1 ring-aegean/8">
                  <span className="typing-dot h-1.5 w-1.5 rounded-full bg-aegean/50" />
                  <span className="typing-dot h-1.5 w-1.5 rounded-full bg-aegean/50 [animation-delay:0.15s]" />
                  <span className="typing-dot h-1.5 w-1.5 rounded-full bg-aegean/50 [animation-delay:0.3s]" />
                </div>
              )}

              {error && (
                <div className="mr-6 rounded-2xl border border-red-300/50 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
                  {error}
                </div>
              )}
            </div>

            <footer className="shrink-0 border-t border-aegean/10 bg-foam px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 md:px-4">
              <form onSubmit={onSubmit} className="flex items-end gap-2">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={
                    draft.bookingActive
                      ? !draft.from || !draft.to
                        ? t("placeholderDates")
                        : !draft.name
                          ? t("placeholderName")
                          : !draft.email
                            ? t("placeholderEmail")
                            : !draft.phone
                              ? t("placeholderPhone")
                              : t("placeholder")
                      : t("placeholder")
                  }
                  className="min-h-12 flex-1 rounded-2xl border border-aegean/12 bg-salt px-4 py-3 text-sm outline-none ring-aegean/20 focus:ring-2"
                />
                <button
                  type="submit"
                  disabled={busy || !input.trim()}
                  className="inline-flex h-12 shrink-0 items-center justify-center rounded-2xl bg-aegean px-5 text-sm font-semibold text-foam transition hover:bg-aegean-deep disabled:opacity-40"
                >
                  {t("send")}
                </button>
              </form>
              <div className="mt-2.5 space-y-1 text-center">
                <p className="text-[11px] text-aegean/45">
                  {t("poweredBy")}{" "}
                  <a
                    href={TOURISTAS_AI_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-aegean/70 underline-offset-2 hover:text-aegean hover:underline"
                  >
                    {t("poweredBrand")}
                  </a>
                </p>
                <p className="text-[10px] leading-snug text-aegean/40">{t("disclaimer")}</p>
              </div>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>

      <TouristasLauncher open={open} onToggle={toggleOpen} />
    </>
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
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className ?? "h-5 w-5"} aria-hidden>
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MaximizeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className ?? "h-4 w-4"} aria-hidden>
      <path
        d="M9 4H5v4M15 4h4v4M5 15v4h4M19 15v4h-4"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MinimizeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className ?? "h-4 w-4"} aria-hidden>
      <path
        d="M9 8H5V4M15 8h4V4M5 16v4h4M19 16v4h-4"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className ?? "h-4 w-4"} aria-hidden>
      <path
        d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-8 0 1 12a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1l1-12M10 11v6M14 11v6"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FleetVehicleCard({
  vehicle,
  t,
  dates,
  onNavigate,
}: {
  vehicle: VehicleSummary;
  t: (key: string, values?: Record<string, string | number | Date>) => string;
  dates?: { from?: string | null; to?: string | null };
  onNavigate?: () => void;
}) {
  const detailHref = vehicle.path ? stripLocalePrefix(vehicle.path) : undefined;
  const bookHref = vehicle.bookUrl
    ? stripLocalePrefix(vehicle.bookUrl)
    : vehicle.slug
      ? `/book?vehicle=${encodeURIComponent(vehicle.slug)}${
          dates?.from ? `&from=${dates.from}` : ""
        }${dates?.to ? `&to=${dates.to}` : ""}`
      : "/book";

  const specs = [
    vehicle.transmission,
    vehicle.seats ? t("seatsShort", { count: vehicle.seats }) : undefined,
    vehicle.engineCc ? `${vehicle.engineCc}cc` : undefined,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <article className="overflow-hidden rounded-xl border border-aegean/12 bg-foam shadow-sm">
      <div className="flex gap-3 p-2.5">
        <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-lg bg-salt ring-1 ring-aegean/8">
          {vehicle.image ? (
            <Image
              src={vehicle.image}
              alt={vehicle.name}
              fill
              className="object-contain object-center p-1"
              sizes="96px"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-[10px] text-aegean/40">
              Artemis
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1 py-0.5">
          {vehicle.category ? (
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-aegean/45">
              {vehicle.category}
            </p>
          ) : null}
          {detailHref ? (
            <Link
              href={detailHref}
              onClick={onNavigate}
              className="mt-0.5 block font-display text-sm leading-tight text-aegean hover:underline"
            >
              {vehicle.name}
            </Link>
          ) : (
            <p className="mt-0.5 font-display text-sm leading-tight text-aegean">{vehicle.name}</p>
          )}
          {specs ? <p className="mt-1 text-[11px] text-aegean/55">{specs}</p> : null}
          <p className="mt-1.5 text-xs font-semibold text-aegean">
            {vehicle.fromPrice != null
              ? t("fromDayShort", { price: vehicle.fromPrice })
              : t("askRate")}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-1.5 border-t border-aegean/8 bg-salt/50 p-2">
        <Link
          href={bookHref}
          onClick={onNavigate}
          className="inline-flex items-center justify-center rounded-lg bg-aegean px-2 py-2 text-[11px] font-semibold text-foam transition hover:bg-aegean-deep"
        >
          {t("toolBook")}
        </Link>
        {vehicle.whatsappUrl ? (
          <a
            href={vehicle.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onNavigate}
            className="inline-flex items-center justify-center gap-1 rounded-lg bg-[#25D366] px-2 py-2 text-[11px] font-semibold text-white transition hover:brightness-110"
          >
            <WhatsAppIcon className="h-3 w-3" />
            {t("toolWhatsApp")}
          </a>
        ) : (
          <Link
            href={detailHref || "/cars"}
            onClick={onNavigate}
            className="inline-flex items-center justify-center rounded-lg border border-aegean/15 bg-foam px-2 py-2 text-[11px] font-semibold text-aegean"
          >
            {t("toolView")}
          </Link>
        )}
      </div>
    </article>
  );
}

function LocalCardView({
  card,
  t,
  locale,
  onNavigate,
}: {
  card: LocalChatCard;
  t: (key: string, values?: Record<string, string | number | Date>) => string;
  locale: string;
  onNavigate?: () => void;
}) {
  if (card.kind === "recommend") {
    return (
      <div className="mr-6 space-y-2">
        <p className="px-0.5 text-xs font-semibold text-aegean/65">{t("toolRecommend")}</p>
        {(card.from || card.to) && (
          <p className="px-0.5 text-[11px] text-aegean/50">
            {[card.from, card.to].filter(Boolean).join(" → ")}
          </p>
        )}
        <div className="grid gap-2">
          {card.vehicles.map((v, i) => (
            <FleetVehicleCard
              key={`${v.slug}-${i}`}
              vehicle={v}
              t={t}
              dates={{ from: card.from, to: card.to }}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      </div>
    );
  }

  if (card.kind === "prefill") {
    const href = stripLocalePrefix(card.url) || "/book";
    return (
      <div className="mr-6 space-y-2">
        {card.vehicle ? (
          <FleetVehicleCard vehicle={card.vehicle} t={t} onNavigate={onNavigate} />
        ) : null}
        <div className="grid grid-cols-2 gap-1.5">
          <Link
            href={href}
            onClick={onNavigate}
            className="inline-flex items-center justify-center rounded-xl bg-aegean px-3 py-2.5 text-xs font-semibold text-foam hover:bg-aegean-deep"
          >
            {t("toolPrefill")}
          </Link>
          <a
            href={card.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onNavigate}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#25D366] px-3 py-2.5 text-xs font-semibold text-white hover:brightness-110"
          >
            <WhatsAppIcon className="h-3.5 w-3.5" />
            {t("toolWhatsApp")}
          </a>
        </div>
      </div>
    );
  }

  if (card.kind === "rate") {
    return card.dailyEur != null ? (
      <p className="mr-6 rounded-xl bg-salt px-3 py-2 text-xs font-medium text-aegean">
        {t("toolRate", { price: card.dailyEur })}
      </p>
    ) : null;
  }

  if (card.kind === "guide") {
    return (
      <div className="mr-6 space-y-1.5 rounded-xl border border-aegean/12 bg-salt/60 p-2.5">
        <p className="px-0.5 text-xs font-semibold text-aegean/70">{t("toolGuide")}</p>
        <div className="grid gap-1">
          {card.results.map((r) => (
            <Link
              key={r.slug}
              href={stripLocalePrefix(r.path)}
              locale={locale as "en" | "el" | "it" | "fr" | "de" | "sv" | "nl"}
              onClick={onNavigate}
              className="rounded-lg bg-salt px-2.5 py-2 text-xs font-medium text-aegean underline-offset-2 hover:underline"
            >
              {r.title}
            </Link>
          ))}
        </div>
      </div>
    );
  }

  return null;
}
