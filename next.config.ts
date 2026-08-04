import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";
import createNextIntlPlugin from "next-intl/plugin";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");
const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  output: "standalone",
  turbopack: {
    root: projectRoot,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "rentacarsifnos.com",
      },
      {
        protocol: "https",
        hostname: "artemisrental.gr",
      },
      {
        protocol: "https",
        hostname: "discovercyclades.gr",
      },
    ],
  },
  async redirects() {
    return [
      // Legacy Artemis .html paths
      { source: "/cars.html", destination: "/el/cars", permanent: true },
      { source: "/motos.html", destination: "/el/scooters", permanent: true },
      { source: "/rates.html", destination: "/el/rates", permanent: true },
      { source: "/contact.html", destination: "/el/book", permanent: true },
      { source: "/index.html", destination: "/el", permanent: true },
      { source: "/en/cars.html", destination: "/en/cars", permanent: true },
      { source: "/en/motos.html", destination: "/en/scooters", permanent: true },
      { source: "/en/rates.html", destination: "/en/rates", permanent: true },
      { source: "/en/contact.html", destination: "/en/book", permanent: true },
      { source: "/en/index.html", destination: "/en", permanent: true },
      // Bare (no-locale) paths → English default. Permanent so GSC treats them as
      // intentional redirects instead of soft locale negotiation (307).
      { source: "/", destination: "/en", permanent: true },
      { source: "/cars", destination: "/en/cars", permanent: true },
      { source: "/cars/:slug", destination: "/en/cars/:slug", permanent: true },
      { source: "/scooters", destination: "/en/scooters", permanent: true },
      { source: "/scooters/:slug", destination: "/en/scooters/:slug", permanent: true },
      { source: "/blog", destination: "/en/blog", permanent: true },
      { source: "/blog/:slug", destination: "/en/blog/:slug", permanent: true },
      { source: "/sifnos-guide", destination: "/en/sifnos-guide", permanent: true },
      { source: "/sifnos-guide/:slug", destination: "/en/sifnos-guide/:slug", permanent: true },
      { source: "/book", destination: "/en/book", permanent: true },
      { source: "/rates", destination: "/en/rates", permanent: true },
      { source: "/faq", destination: "/en/faq", permanent: true },
      { source: "/about", destination: "/en/about", permanent: true },
      { source: "/privacy", destination: "/en/privacy", permanent: true },
      { source: "/terms", destination: "/en/terms", permanent: true },
      { source: "/cookies", destination: "/en/cookies", permanent: true },
      { source: "/gdpr", destination: "/en/gdpr", permanent: true },
    ];
  },
};

export default withNextIntl(nextConfig);

initOpenNextCloudflareForDev();
