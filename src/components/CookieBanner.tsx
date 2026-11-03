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
      className="pointer-events-none fixed inset-x-3 bottom-[5.5rem] z-50 md:inset-x-auto md:bottom-6 md:left-6 md:w-[22rem]"
      role="dialog"
      aria-label={t("title")}
      aria-live="polite"
    >
      {/* Compact on phones so it never hides the booking form behind it. */}
      <div className="cookie-glass pointer-events-auto overflow-hidden rounded-2xl p-3 shadow-[0_16px_48px_rgba(11,42,60,0.22)] md:rounded-3xl md:p-4">
        <p className="hidden text-[11px] font-semibold uppercase tracking-[0.16em] text-aegean/50 md:block">
          {t("eyebrow")}
        </p>
        <p className="font-display text-base leading-snug text-aegean md:mt-1.5 md:text-lg">{t("title")}</p>
        <p className="mt-1 text-xs leading-relaxed text-aegean/70 md:mt-2 md:text-sm">
          {t("body")}{" "}
          <Link href="/cookies" className="font-semibold text-aegean underline-offset-2 hover:underline">
            {t("cookiesLink")}
          </Link>
          {" · "}
          <Link href="/privacy" className="font-semibold text-aegean underline-offset-2 hover:underline">
            {t("privacyLink")}
          </Link>
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2 md:mt-4 md:grid-cols-1">
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
