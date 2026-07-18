"use client";

/**
 * TouristasFloatingChat: loads the heavy TouristasChat chunk after idle,
 * scroll intent, or when the user opens chat via touristas:open.
 */

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

const TouristasChat = dynamic(
  () => import("@/components/TouristasChat").then((m) => m.TouristasChat),
  { ssr: false, loading: () => null },
);

type PendingOpen = { prompt?: string };

export function TouristasFloatingChat({ locale }: { locale: string }) {
  const [loadBubble, setLoadBubble] = useState(false);
  const [pendingOpen, setPendingOpen] = useState<PendingOpen | null>(null);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const openImmediately = (e: Event): void => {
      // Once TouristasChat is mounted it owns touristas:open.
      if (!loadedRef.current) {
        const detail = (e as CustomEvent<{ prompt?: string }>).detail;
        setPendingOpen(detail ?? {});
      }
      setLoadBubble(true);
    };
    window.addEventListener("touristas:open", openImmediately);

    const ric = window.requestIdleCallback;
    let idleId: number | undefined;
    let timeoutId: number | undefined;

    if (typeof ric === "function") {
      idleId = ric(() => setLoadBubble(true), { timeout: 5000 });
    } else {
      timeoutId = window.setTimeout(() => setLoadBubble(true), 2000);
    }

    const onScroll = (): void => setLoadBubble(true);
    window.addEventListener("scroll", onScroll, { once: true, passive: true });

    return () => {
      window.removeEventListener("touristas:open", openImmediately);
      window.removeEventListener("scroll", onScroll);
      if (idleId != null && typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId != null) window.clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    if (loadBubble) loadedRef.current = true;
  }, [loadBubble]);

  if (!loadBubble) return null;

  return (
    <TouristasChat
      locale={locale}
      autoOpen={pendingOpen != null}
      autoPrompt={pendingOpen?.prompt}
      onAutoOpenConsumed={() => setPendingOpen(null)}
    />
  );
}
