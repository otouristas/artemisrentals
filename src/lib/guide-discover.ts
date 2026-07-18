import {
  discoverCycladesUrl,
  sifnosFerryUrl,
  sifnosGuideDcUrl,
  sifnosHotelsUrl,
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

/** Contextual Discover Cyclades deep links for each guide article. */
export function getGuideDiscoverLinks(locale: string, slug: string): DiscoverLink[] {
  const how = discoverCycladesUrl(locale, "/sifnos/how-to-get-there");
  const things = discoverCycladesUrl(locale, "/sifnos/things-to-do");
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
