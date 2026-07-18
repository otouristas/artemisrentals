"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  openConsentPreferences,
  readConsent,
  writeConsent,
  type ConsentChoice,
} from "@/lib/consent";

export function CookieBanner() {
  const t = useTranslations("CookieBanner");
  const [visible, setVisible] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
    setVisible(readConsent() == null);

    function onOpen() {
      setVisible(true);
    }
    window.addEventListener("artemis:consent-open", onOpen);
    return () => window.removeEventListener("artemis:consent-open", onOpen);
  }, []);

  function choose(choice: ConsentChoice) {
    writeConsent(choice);
    setVisible(false);
  }

  if (!ready || !visible) return null;

  return (
    <div
      className="pointer-events-none fixed bottom-[5.5rem] left-3 z-50 w-[min(22rem,calc(100vw-1.5rem))] md:bottom-6 md:left-6"
      role="dialog"
      aria-label={t("title")}
      aria-live="polite"
    >
      <div className="cookie-glass pointer-events-auto overflow-hidden rounded-3xl p-4 shadow-[0_16px_48px_rgba(11,42,60,0.22)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-aegean/50">
          {t("eyebrow")}
        </p>
        <p className="mt-1.5 font-display text-lg leading-snug text-aegean">{t("title")}</p>
        <p className="mt-2 text-sm leading-relaxed text-aegean/70">{t("body")}</p>
        <p className="mt-2 text-xs text-aegean/55">
          <Link href="/cookies" className="font-semibold text-aegean underline-offset-2 hover:underline">
            {t("cookiesLink")}
          </Link>
          {" · "}
          <Link href="/privacy" className="font-semibold text-aegean underline-offset-2 hover:underline">
            {t("privacyLink")}
          </Link>
        </p>
        <div className="mt-4 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => choose("all")}
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-aegean px-4 text-sm font-semibold text-foam transition hover:bg-aegean-deep"
          >
            {t("acceptAll")}
          </button>
          <button
            type="button"
            onClick={() => choose("essential")}
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-aegean/15 bg-foam/60 px-4 text-sm font-semibold text-aegean transition hover:bg-foam"
          >
            {t("essentialOnly")}
          </button>
        </div>
      </div>
    </div>
  );
}

export function ManageCookiesButton({ className }: { className?: string }) {
  const t = useTranslations("CookieBanner");
  return (
    <button
      type="button"
      onClick={() => openConsentPreferences()}
      className={className ?? "text-sm font-semibold text-aegean underline-offset-2 hover:underline"}
    >
      {t("manage")}
    </button>
  );
}
