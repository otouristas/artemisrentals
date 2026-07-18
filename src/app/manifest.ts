import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Artemis Rental: Car & Scooter Hire in Sifnos",
    short_name: "Artemis Rental",
    description:
      "Family car and scooter rental in Apollonia, Sifnos since 1988. No prepayment. Request your dates and we confirm personally.",
    start_url: "/",
    display: "standalone",
    background_color: "#f7f4ef",
    theme_color: "#0b2a3c",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
