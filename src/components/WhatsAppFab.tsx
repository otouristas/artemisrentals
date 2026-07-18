"use client";

import { useTranslations } from "next-intl";
import { whatsappUrl } from "@/lib/site";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";

export function WhatsAppFab() {
  const t = useTranslations("Nav");

  return (
    <a
      href={whatsappUrl(t("whatsappPrefill"))}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 left-6 z-50 hidden h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl ring-1 ring-black/10 transition hover:brightness-105 md:flex"
      aria-label={t("whatsapp")}
    >
      <WhatsAppIcon className="h-7 w-7" />
    </a>
  );
}
