import {
  sifnosBeachesDcUrl,
  sifnosFerryUrl,
  sifnosGuideDcUrl,
  sifnosHotelsUrl,
  sifnosHowToGetDcUrl,
  sifnosThingsToDoDcUrl,
  tripPlannerUrl,
} from "@/lib/site";

export type DiscoverLink = {
  href: string;
  labelKey:
    | "dcHowToGet"
    | "dcFerries"
    | "dcThings"
    | "dcGuide"
    | "dcHotels"
    | "touristas";
};

/**
 * Several URL helpers deliberately alias to the same destination: how-to-get-there
 * resolves to the ferry route, and for `el` both things-to-do and beaches fall back
 * to the island guide. Rendering the list unfiltered gives React duplicate keys and
 * shows the reader two chips pointing at the same page.
 *
 * Collapsing is not enough on its own, because the surviving label has to describe
 * where the link actually goes. Keeping whichever entry came first would label the
 * ferry-route URL "How to get there" and, in Greek, label the island guide "Things
 * to do". So when entries collide, prefer the label that owns that destination.
 */
const CANONICAL_LABEL_FOR_URL = (locale: string) =>
  new Map<string, DiscoverLink["labelKey"]>([
    [sifnosFerryUrl(locale), "dcFerries"],
    [sifnosGuideDcUrl(locale), "dcGuide"],
    [sifnosHotelsUrl(locale), "dcHotels"],
    [sifnosThingsToDoDcUrl(locale), "dcThings"],
    [sifnosBeachesDcUrl(locale), "dcThings"],
  ]);

function dedupeByHref(links: DiscoverLink[], locale: string): DiscoverLink[] {
  const canonical = CANONICAL_LABEL_FOR_URL(locale);
  const byHref = new Map<string, DiscoverLink>();

  for (const link of links) {
    const existing = byHref.get(link.href);
    if (!existing) {
      byHref.set(link.href, link);
      continue;
    }
    // Collision: keep whichever label actually describes this destination.
    const preferred = canonical.get(link.href);
    if (preferred && link.labelKey === preferred) byHref.set(link.href, link);
  }

  return [...byHref.values()];
}

/** Contextual Discover Cyclades deep links for each guide article. */
export function getGuideDiscoverLinks(locale: string, slug: string): DiscoverLink[] {
  return dedupeByHref(linksForSlug(locale, slug), locale);
}

/**
 * The five-link Discover Cyclades hub set, shared by the guide index and the footer.
 *
 * Both used to assemble this list themselves, which meant both re-created the
 * aliasing bug: the guide index threw duplicate React keys, and the footer quietly
 * rendered two links to the same URL on every page (three in Greek). Anything
 * rendering these helpers should come through here.
 */
export function getDiscoverHubLinks(locale: string): DiscoverLink[] {
  return dedupeByHref(
    [
    { href: sifnosHowToGetDcUrl(locale), labelKey: "dcHowToGet" },
    { href: sifnosFerryUrl(locale), labelKey: "dcFerries" },
    { href: sifnosThingsToDoDcUrl(locale), labelKey: "dcThings" },
    { href: sifnosGuideDcUrl(locale), labelKey: "dcGuide" },
    { href: sifnosHotelsUrl(locale), labelKey: "dcHotels" },
    ],
    locale,
  );
}

function linksForSlug(locale: string, slug: string): DiscoverLink[] {
  const how = sifnosHowToGetDcUrl(locale);
  const things = sifnosThingsToDoDcUrl(locale);
  const beaches = sifnosBeachesDcUrl(locale);
  const guide = sifnosGuideDcUrl(locale);
  const ferries = sifnosFerryUrl(locale);
  const hotels = sifnosHotelsUrl(locale);
  const planner = tripPlannerUrl(locale, "Plan a Sifnos stay and Cyclades hop");

  switch (slug) {
    case "how-to-get-there":
      return [
        { href: how, labelKey: "dcHowToGet" },
        { href: ferries, labelKey: "dcFerries" },
        { href: guide, labelKey: "dcGuide" },
        { href: planner, labelKey: "touristas" },
      ];
    case "ferries":
    case "kamares-port":
      return [
        { href: ferries, labelKey: "dcFerries" },
        { href: how, labelKey: "dcHowToGet" },
        { href: guide, labelKey: "dcGuide" },
        { href: planner, labelKey: "touristas" },
      ];
    case "beaches":
      return [
        { href: beaches, labelKey: "dcThings" },
        { href: guide, labelKey: "dcGuide" },
        { href: planner, labelKey: "touristas" },
      ];
    case "things-to-do":
    case "food-pottery":
    case "apollonia-artemonas":
      return [
        { href: things, labelKey: "dcThings" },
        { href: guide, labelKey: "dcGuide" },
        { href: planner, labelKey: "touristas" },
      ];
    case "where-to-stay":
      return [
        { href: hotels, labelKey: "dcHotels" },
        { href: guide, labelKey: "dcGuide" },
        { href: things, labelKey: "dcThings" },
        { href: planner, labelKey: "touristas" },
      ];
    case "getting-around":
    case "practical-tips":
      return [
        { href: guide, labelKey: "dcGuide" },
        { href: how, labelKey: "dcHowToGet" },
        { href: things, labelKey: "dcThings" },
        { href: planner, labelKey: "touristas" },
      ];
    default:
      return [
        { href: guide, labelKey: "dcGuide" },
        { href: how, labelKey: "dcHowToGet" },
        { href: ferries, labelKey: "dcFerries" },
        { href: things, labelKey: "dcThings" },
        { href: hotels, labelKey: "dcHotels" },
        { href: planner, labelKey: "touristas" },
      ];
  }
}
