"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { CONSENT_EVENT, readConsent } from "@/lib/consent";

const CF_BEACON = process.env.NEXT_PUBLIC_CF_BEACON_TOKEN;
/** Hardcoded fallback so production works even if env is missing at build time. */
const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "G-16VR49ZQ7X";

function applyGtagConsent(granted: boolean) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("consent", "update", {
    analytics_storage: granted ? "granted" : "denied",
  });
}

export function Analytics() {
  const [cfAllowed, setCfAllowed] = useState(false);

  useEffect(() => {
    function sync() {
      const granted = readConsent() === "all";
      applyGtagConsent(granted);
      setCfAllowed(granted);
    }
    sync();
    window.addEventListener(CONSENT_EVENT, sync);
    return () => window.removeEventListener(CONSENT_EVENT, sync);
  }, []);

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
gtag('consent', 'default', {
  analytics_storage: 'denied',
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  wait_for_update: 500
});
gtag('js', new Date());
gtag('config', '${GA_ID}');
try {
  var c = localStorage.getItem('artemis-consent');
  if (c === 'all') {
    gtag('consent', 'update', { analytics_storage: 'granted' });
  }
} catch (e) {}`}
      </Script>
      {CF_BEACON && cfAllowed ? (
        <Script
          src="https://static.cloudflareinsights.com/beacon.min.js"
          data-cf-beacon={`{"token": "${CF_BEACON}"}`}
          strategy="afterInteractive"
        />
      ) : null}
    </>
  );
}
