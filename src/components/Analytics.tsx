"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { CONSENT_EVENT, readConsent } from "@/lib/consent";

const CF_BEACON = process.env.NEXT_PUBLIC_CF_BEACON_TOKEN;
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export function Analytics() {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    function sync() {
      setAllowed(readConsent() === "all");
    }
    sync();
    window.addEventListener(CONSENT_EVENT, sync);
    return () => window.removeEventListener(CONSENT_EVENT, sync);
  }, []);

  if (!allowed || (!CF_BEACON && !GA_ID)) return null;

  return (
    <>
      {CF_BEACON ? (
        <Script
          src="https://static.cloudflareinsights.com/beacon.min.js"
          data-cf-beacon={`{"token": "${CF_BEACON}"}`}
          strategy="afterInteractive"
        />
      ) : null}
      {GA_ID ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_ID}', { anonymize_ip: true });`}
          </Script>
        </>
      ) : null}
    </>
  );
}
