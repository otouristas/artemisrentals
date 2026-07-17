"use client";

import Image from "next/image";
import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/cn";

const links = [
  { href: "/cars", key: "cars" as const },
  { href: "/scooters", key: "scooters" as const },
  { href: "/rates", key: "rates" as const },
  { href: "/sifnos-guide", key: "guide" as const },
  { href: "/blog", key: "blog" as const },
  { href: "/faq", key: "faq" as const },
];

export function Header() {
  const t = useTranslations("Nav");
  const locale = useLocale();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const other = locale === "en" ? "el" : "en";

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
          onClick={() => setOpen((v) => !v)}
        >
          {open ? t("closeMenu") : t("openMenu")}
        </button>
      </div>

      {open && (
        <div className="border-t border-foam/15 bg-aegean/95 px-4 py-4 backdrop-blur-md lg:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-3">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-foam"
                onClick={() => setOpen(false)}
              >
                {t(l.key)}
              </Link>
            ))}
            <Link href="/book" className="font-semibold text-sun" onClick={() => setOpen(false)}>
              {t("book")}
            </Link>
            <Link href={pathname || "/"} locale={other} className="uppercase text-foam/80">
              {other}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
