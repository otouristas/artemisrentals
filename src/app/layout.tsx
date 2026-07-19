import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  verification: {
    google: "Bz8Pttnu22t9KwQtEflLTPB4jFm4Q26jrK6_DCramxc",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
