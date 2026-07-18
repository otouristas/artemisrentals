"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { cn } from "@/lib/cn";
import { GUIDE_NAV } from "@/lib/guide-nav";
import { LOCALE_NATIVE_NAMES } from "@/lib/i18n-locale";
import { business, whatsappUrl } from "@/lib/site";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";

const links = [
  { href: "/cars", key: "cars" as const },
  { href: "/scooters", key: "scooters" as const },
  { href: "/rates", key: "rates" as const },
  { href: "/blog", key: "blog" as const },
  { href: "/faq", key: "faq" as const },
  { href: "/about", key: "about" as const },
];

export function Header() {
  const t = useTranslations("Nav");
  const locale = useLocale();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [mobileGuideOpen, setMobileGuideOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const guideRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);
  const currentLocale = locale as Locale;
  const isHome = pathname === "/" || pathname === "";
  const guideActive = pathname.startsWith("/sifnos-guide");

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setOpen(false);
    setGuideOpen(false);
    setMobileGuideOpen(false);
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!guideOpen) return;
    const onPointer = (e: MouseEvent) => {
      if (!guideRef.current?.contains(e.target as Node)) setGuideOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setGuideOpen(false);
    };
    window.addEventListener("mousedown", onPointer);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onPointer);
      window.removeEventListener("keydown", onKey);
    };
  }, [guideOpen]);

  useEffect(() => {
    if (!langOpen) return;
    const onPointer = (e: MouseEvent) => {
      if (!langRef.current?.contains(e.target as Node)) setLangOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLangOpen(false);
    };
    window.addEventListener("mousedown", onPointer);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onPointer);
      window.removeEventListener("keydown", onKey);
    };
  }, [langOpen]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-all duration-300",
        scrolled || !isHome || open
          ? "glass-nav shadow-[0_8px_30px_rgba(11,42,60,0.18)]"
          : "bg-gradient-to-b from-aegean/80 via-aegean/35 to-transparent",
      )}
    >
      <div className="container-site flex items-center justify-between gap-4 py-4 md:py-5">
        <Link href="/" className="flex items-center gap-3 text-foam">
          <Image
            src="/images/brand/artemis-auto-rental-white.svg"
            alt="Artemis Rental"
            width={140}
            height={40}
            className="h-9 w-auto"
            preload
          />
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {links.slice(0, 3).map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "text-sm font-medium text-foam/85 transition hover:text-foam",
                pathname.startsWith(l.href) && "text-foam",
              )}
            >
              {t(l.key)}
            </Link>
          ))}

          <div className="relative" ref={guideRef}>
            <button
              type="button"
              className={cn(
                "inline-flex items-center gap-1 text-sm font-medium text-foam/85 transition hover:text-foam",
                guideActive && "text-foam",
              )}
              aria-expanded={guideOpen}
              aria-haspopup="menu"
              onClick={() => setGuideOpen((v) => !v)}
            >
              {t("guide")}
              <svg
                viewBox="0 0 16 16"
                className={cn("h-3.5 w-3.5 transition", guideOpen && "rotate-180")}
                fill="none"
                aria-hidden
              >
                <path
                  d="M4 6l4 4 4-4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            {guideOpen && (
              <div
                role="menu"
                className="absolute left-0 top-full z-50 mt-3 w-64 overflow-hidden rounded-2xl border border-foam/15 bg-aegean/95 py-2 shadow-2xl backdrop-blur-xl"
              >
                {GUIDE_NAV.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    role="menuitem"
                    className={cn(
                      "block px-4 py-2.5 text-sm text-foam/85 transition hover:bg-foam/10 hover:text-foam",
                      (pathname === item.href ||
                        (item.href !== "/sifnos-guide" && pathname.startsWith(item.href))) &&
                        "bg-foam/10 font-semibold text-sun",
                    )}
                    onClick={() => setGuideOpen(false)}
                  >
                    {t(item.key)}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {links.slice(3).map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "text-sm font-medium text-foam/85 transition hover:text-foam",
                pathname.startsWith(l.href) && "text-foam",
              )}
            >
              {t(l.key)}
            </Link>
          ))}
          <Link href="/book" className="btn-accent px-4 py-2">
            {t("book")}
          </Link>
          <a
            href={whatsappUrl(t("whatsappPrefill"))}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#25D366] transition hover:brightness-110"
            aria-label={t("whatsapp")}
          >
            <WhatsAppIcon className="h-4 w-4" />
            <span className="sr-only xl:not-sr-only">{t("whatsappShort")}</span>
          </a>
          <div className="relative" ref={langRef}>
            <button
              type="button"
              className="text-sm font-semibold uppercase tracking-wide text-foam/80 transition hover:text-foam"
              aria-expanded={langOpen}
              aria-haspopup="menu"
              aria-label={t("switchLang", { lang: LOCALE_NATIVE_NAMES[currentLocale] })}
              onClick={() => setLangOpen((v) => !v)}
            >
              {currentLocale}
            </button>
            {langOpen && (
              <div
                role="menu"
                className="absolute right-0 top-full z-50 mt-3 w-44 overflow-hidden rounded-2xl border border-foam/15 bg-aegean/95 py-2 shadow-2xl backdrop-blur-xl"
              >
                {routing.locales.map((loc) => (
                  <Link
                    key={loc}
                    href={pathname || "/"}
                    locale={loc}
                    role="menuitem"
                    className={cn(
                      "block px-4 py-2.5 text-sm text-foam/85 transition hover:bg-foam/10 hover:text-foam",
                      loc === currentLocale && "bg-foam/10 font-semibold text-sun",
                    )}
                    onClick={() => setLangOpen(false)}
                  >
                    {LOCALE_NATIVE_NAMES[loc]}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        <div className="flex items-center gap-2 lg:hidden">
          <Link
            href="/book"
            className="btn-accent px-3.5 py-2 text-sm"
          >
            {t("bookNow")}
          </Link>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-foam/30 text-foam"
            aria-label={open ? t("closeMenu") : t("openMenu")}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? (
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
                <path
                  d="M6 6l12 12M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
                <path
                  d="M5 7h14M5 12h14M5 17h14"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {open && (
        <div
          className="animate-menu fixed inset-0 z-50 flex flex-col bg-aegean text-foam lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label={t("openMenu")}
        >
          <div className="flex items-center justify-between gap-3 px-5 py-5">
            <Image
              src="/images/brand/artemis-auto-rental-white.svg"
              alt="Artemis Rental"
              width={140}
              height={40}
              className="h-9 w-auto"
            />
            <div className="flex items-center gap-2">
              <div className="relative">
                <details className="group">
                  <summary className="inline-flex h-10 list-none items-center justify-center rounded-full border border-foam/30 px-3.5 text-sm font-semibold uppercase tracking-wide text-foam [&::-webkit-details-marker]:hidden">
                    {currentLocale}
                  </summary>
                  <div className="absolute right-0 top-full z-50 mt-2 w-44 overflow-hidden rounded-2xl border border-foam/15 bg-aegean py-2 shadow-2xl">
                    {routing.locales.map((loc) => (
                      <Link
                        key={loc}
                        href={pathname || "/"}
                        locale={loc}
                        className={cn(
                          "block px-4 py-2.5 text-sm text-foam/85 transition hover:bg-foam/10 hover:text-foam",
                          loc === currentLocale && "bg-foam/10 font-semibold text-sun",
                        )}
                        onClick={() => setOpen(false)}
                      >
                        {LOCALE_NATIVE_NAMES[loc]}
                      </Link>
                    ))}
                  </div>
                </details>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-foam/30"
                aria-label={t("closeMenu")}
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
                  <path
                    d="M6 6l12 12M18 6L6 18"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex flex-1 flex-col overflow-y-auto px-5 pb-10 pt-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foam/45">
              {t("menuLabel")}
            </p>
            <nav className="mt-6 flex flex-col gap-1">
              <Link
                href="/"
                className="border-b border-foam/10 py-3 font-display text-3xl text-foam"
                onClick={() => setOpen(false)}
              >
                {t("home")}
              </Link>
              {links.slice(0, 3).map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={cn(
                    "border-b border-foam/10 py-3 font-display text-3xl text-foam/90",
                    pathname.startsWith(l.href) && "text-sun",
                  )}
                  onClick={() => setOpen(false)}
                >
                  {t(l.key)}
                </Link>
              ))}

              <div className="border-b border-foam/10">
                <button
                  type="button"
                  className={cn(
                    "flex w-full items-center justify-between py-3 font-display text-3xl text-foam/90",
                    guideActive && "text-sun",
                  )}
                  aria-expanded={mobileGuideOpen}
                  onClick={() => setMobileGuideOpen((v) => !v)}
                >
                  {t("guide")}
                  <svg
                    viewBox="0 0 16 16"
                    className={cn("h-5 w-5 transition", mobileGuideOpen && "rotate-180")}
                    fill="none"
                    aria-hidden
                  >
                    <path
                      d="M4 6l4 4 4-4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                {mobileGuideOpen && (
                  <div className="flex flex-col gap-1 pb-4 pl-1">
                    {GUIDE_NAV.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "py-2 text-lg text-foam/75",
                          pathname === item.href && "font-semibold text-sun",
                        )}
                        onClick={() => setOpen(false)}
                      >
                        {t(item.key)}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {links.slice(3).map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={cn(
                    "border-b border-foam/10 py-3 font-display text-3xl text-foam/90",
                    pathname.startsWith(l.href) && "text-sun",
                  )}
                  onClick={() => setOpen(false)}
                >
                  {t(l.key)}
                </Link>
              ))}
            </nav>

            <div className="mt-8 grid gap-3">
              <Link
                href="/book"
                onClick={() => setOpen(false)}
                className="rounded-2xl bg-sun px-5 py-4 text-center text-base font-semibold text-aegean"
              >
                {t("book")}
              </Link>
              <a
                href={`tel:${business.phones[0].e164}`}
                className="rounded-2xl border border-foam/25 px-5 py-4 text-center text-base font-semibold text-foam"
              >
                {t("call")}: {business.phones[0].display}
              </a>
              <a
                href={whatsappUrl(t("whatsappPrefill"))}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-5 py-4 text-base font-semibold text-white"
              >
                <WhatsAppIcon className="h-5 w-5" />
                {t("whatsapp")}
              </a>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  window.dispatchEvent(new CustomEvent("touristas:open"));
                }}
                className="rounded-2xl border border-sun/50 px-5 py-4 text-center text-base font-semibold text-sun"
              >
                {t("askTouristas")}
              </button>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-3 border-t border-foam/15 pt-8">
              {[
                t("indicatorSince", { year: business.since }),
                t("indicatorPlace"),
                t("indicatorNoPrepay"),
                t("indicatorFamily"),
              ].map((label) => (
                <div
                  key={label}
                  className="rounded-xl border border-foam/12 bg-foam/5 px-3 py-3 text-sm text-foam/80"
                >
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
