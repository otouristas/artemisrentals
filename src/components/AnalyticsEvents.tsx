"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

function closestAnchor(target: EventTarget | null): HTMLAnchorElement | null {
  if (!(target instanceof Element)) return null;
  return target.closest("a");
}

function linkText(anchor: HTMLAnchorElement) {
  return (anchor.textContent || "").trim().slice(0, 120) || undefined;
}

function bookPath(href: string) {
  try {
    const url = new URL(href, window.location.origin);
    return /\/book(?:\/|$|\?)/.test(url.pathname);
  } catch {
    return false;
  }
}

export function AnalyticsEvents() {
  useEffect(() => {
    function onClick(event: MouseEvent) {
      const anchor = closestAnchor(event.target);
      if (!anchor) return;

      const href = anchor.href;
      if (!href) return;

      const params = {
        link_url: href,
        link_text: linkText(anchor),
      };

      const lower = href.toLowerCase();
      if (lower.startsWith("tel:")) {
        trackEvent("phone_click", params);
        return;
      }
      if (lower.startsWith("mailto:")) {
        trackEvent("email_click", params);
        return;
      }
      if (lower.includes("wa.me") || lower.includes("whatsapp.com") || lower.includes("api.whatsapp.com")) {
        trackEvent("whatsapp_click", params);
        return;
      }
      if (bookPath(href)) {
        trackEvent("book_cta_click", params);
      }
    }

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return null;
}
