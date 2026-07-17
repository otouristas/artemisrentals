import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
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
      { source: "/fr/:path*", destination: "/en/:path*", permanent: false },
    ];
  },
};

export default withNextIntl(nextConfig);
