"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { usePathname } from "@/i18n/navigation";

/** Force every client navigation (including query changes) to the top of the page. */
export function ScrollToTop() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname, search]);

  return null;
}

export function scrollWindowToTop() {
  if (typeof window === "undefined") return;
  window.scrollTo({ top: 0, left: 0, behavior: "instant" });
}
