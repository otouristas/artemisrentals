"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { scrollWindowToTop } from "@/components/ScrollToTop";
import { business, whatsappUrl } from "@/lib/site";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";

function vehicleSlugFromPath(pathname: string) {
  const match = pathname.match(/^\/(?:cars|scooters)\/([^/]+)/);
  return match?.[1];
}

export function MobileBookBar({
  vehicleSlug,
  from,
  to,
  vehicleName,
}: {
  vehicleSlug?: string;
  from?: string;
  to?: string;
  vehicleName?: string;
} = {}) {
  const t = useTranslations("Common");
  const nav = useTranslations("Nav");
  const pathname = usePathname();
  const resolvedSlug = vehicleSlug || vehicleSlugFromPath(pathname);
  const params = new URLSearchParams();
  if (resolvedSlug) params.set("vehicle", resolvedSlug);
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  const bookHref = params.size ? `/book?${params.toString()}` : "/book";
  const waText = vehicleName
    ? `Hello Artemis Rental, I would like to enquire about the ${vehicleName}.\n\nSent by Rentacarsifnos.com`
    : resolvedSlug
      ? `Hello Artemis Rental, I would like to enquire about the ${resolvedSlug}.\n\nSent by Rentacarsifnos.com`
      : undefined;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden">
      <div className="glass-dock pointer-events-auto mx-auto flex max-w-lg items-center gap-2 p-2 pl-2.5">
        <Link
          href={bookHref}
          onClick={scrollWindowToTop}
          className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full bg-aegean px-4 text-sm font-semibold text-foam shadow-[0_1px_0_rgba(255,255,255,0.25)_inset] transition hover:bg-aegean-deep"
        >
          {t("bookNow")}
        </Link>

        <a
          href={whatsappUrl(waText)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#25D366]/90 text-white shadow-sm ring-1 ring-white/40 backdrop-blur-md transition hover:brightness-110"
          aria-label={t("whatsappShort")}
        >
          <WhatsAppIcon className="h-5 w-5" />
        </a>

        <a
          href={`tel:${business.phones[0].e164}`}
          className="inline-flex h-11 shrink-0 items-center justify-center rounded-full bg-white/45 px-3 text-xs font-semibold text-aegean ring-1 ring-white/50 backdrop-blur-md transition hover:bg-white/65"
          aria-label={t("callShort")}
        >
          {t("callShort")}
        </a>

        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent("touristas:open"))}
          className="touristas-glass-btn inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-xs font-semibold text-aegean"
          aria-label={nav("askTouristas")}
        >
          <TouristasSparklesIcon className="h-4 w-4 text-sun" />
          <span>AI</span>
        </button>
      </div>
    </div>
  );
}

function TouristasSparklesIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className ?? "h-4 w-4"} aria-hidden>
      <path
        d="M12 3l1.2 4.2L17.5 8.5 13.2 9.8 12 14l-1.2-4.2L6.5 8.5l4.3-1.3L12 3zM18.5 13l.7 2.3 2.3.7-2.3.7-.7 2.3-.7-2.3-2.3-.7 2.3-.7.7-2.3zM6 14.5l.6 1.8 1.8.6-1.8.6L6 19.3l-.6-1.8-1.8-.6 1.8-.6L6 14.5z"
        fill="currentColor"
      />
    </svg>
  );
}
