"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { usePathname } from "@/i18n/navigation";

function forceScrollTop() {
  const html = document.documentElement;
  const prev = html.style.scrollBehavior;
  html.style.scrollBehavior = "auto";
  window.scrollTo(0, 0);
  html.scrollTop = 0;
  document.body.scrollTop = 0;
  html.style.scrollBehavior = prev;
}

/** Force every client navigation (including query changes) to the top of the page. */
export function ScrollToTop() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();

  useEffect(() => {
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
  }, []);

  useEffect(() => {
    forceScrollTop();

    // Next.js / the browser can restore scroll after the first paint; re-assert.
    const raf1 = requestAnimationFrame(() => {
      forceScrollTop();
      requestAnimationFrame(forceScrollTop);
    });
    const t0 = window.setTimeout(forceScrollTop, 0);
    const t1 = window.setTimeout(forceScrollTop, 50);
    const t2 = window.setTimeout(forceScrollTop, 150);

    return () => {
      cancelAnimationFrame(raf1);
      window.clearTimeout(t0);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [pathname, search]);

  return null;
}

export function scrollWindowToTop() {
  if (typeof window === "undefined") return;
  forceScrollTop();
}
