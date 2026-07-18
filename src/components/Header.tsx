"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/cn";
import { business, whatsappUrl } from "@/lib/site";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";

const links = [
  { href: "/cars", key: "cars" as const },
  { href: "/scooters", key: "scooters" as const },
  { href: "/rates", key: "rates" as const },
  { href: "/sifnos-guide", key: "guide" as const },
  { href: "/blog", key: "blog" as const },
  { href: "/faq", key: "faq" as const },
  { href: "/about", key: "about" as const },
];

export function Header() {
  const t = useTranslations("Nav");
  const locale = useLocale();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const other = locale === "en" ? "el" : "en";

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

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="absolute inset-x-0 top-0 z-40 bg-gradient-to-b from-aegean/80 via-aegean/35 to-transparent">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-5 md:px-6">
        <Link href="/" className="flex items-center gap-3 text-foam">
          <Image
            src="/images/brand/artemis-auto-rental-white.svg"
            alt="Artemis Rental"
            width={140}
            height={40}
            className="h-9 w-auto"
            priority
          />
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {links.map((l) => (
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
          <Link
            href="/book"
            className="rounded-full bg-sun px-4 py-2 text-sm font-semibold text-aegean shadow-sm transition hover:brightness-105"
          >
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
            <span className="sr-only lg:not-sr-only">{t("whatsappShort")}</span>
          </a>
          <Link
            href={pathname || "/"}
            locale={other}
            className="text-sm font-semibold uppercase tracking-wide text-foam/80 hover:text-foam"
          >
            {other}
          </Link>
        </nav>

        <button
          type="button"
          className="rounded-full border border-foam/30 px-3 py-2 text-sm text-foam lg:hidden"
          aria-label={open ? t("closeMenu") : t("openMenu")}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? t("closeMenu") : t("openMenu")}
        </button>
      </div>

      {open && (
        <div
          className="animate-menu fixed inset-0 z-50 flex flex-col bg-aegean text-foam lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label={t("openMenu")}
        >
          <div className="flex items-center justify-between px-5 py-5">
            <Image
              src="/images/brand/artemis-auto-rental-white.svg"
              alt="Artemis Rental"
              width={140}
              height={40}
              className="h-9 w-auto"
            />
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full border border-foam/30 px-3 py-2 text-sm"
              aria-label={t("closeMenu")}
            >
              {t("closeMenu")}
            </button>
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
              {links.map((l) => (
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

            <Link
              href={pathname || "/"}
              locale={other}
              className="mt-8 inline-flex self-start text-sm font-semibold uppercase tracking-wide text-foam/70"
              onClick={() => setOpen(false)}
            >
              {t("switchLang", { lang: other.toUpperCase() })}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
