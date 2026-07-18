/** Primary Sifnos Guide items for header / mobile nav (routes match content/guide). */
export const GUIDE_NAV = [
  { href: "/sifnos-guide", key: "guideHub" as const },
  { href: "/sifnos-guide/how-to-get-there", key: "guideHowToGet" as const },
  { href: "/sifnos-guide/ferries", key: "guideFerries" as const },
  { href: "/sifnos-guide/kamares-port", key: "guideKamares" as const },
  { href: "/sifnos-guide/getting-around", key: "guideGettingAround" as const },
  { href: "/sifnos-guide/beaches", key: "guideBeaches" as const },
  { href: "/sifnos-guide/things-to-do", key: "guideThings" as const },
  { href: "/sifnos-guide/where-to-stay", key: "guideStay" as const },
] as const;

export type GuideNavKey = (typeof GUIDE_NAV)[number]["key"];
