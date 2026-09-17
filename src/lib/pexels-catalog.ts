import type { PinnedPexelsPhoto } from "@/lib/pexels";

/**
 * Photos from https://www.pexels.com/search/sifnos/ whose title, slug, or
 * caption names Sifnos (or a Sifnos place). Do not pin lookalike Cyclades
 * stills. Reuse these frames across slots when needed rather than substituting
 * Mykonos, Paros, Crete, Paxos, Milos, Naxos, or Monemvasia.
 */
const BEN_PRATER = {
  photographer: "Ben Prater",
  photographerUrl: "https://www.pexels.com/@benprater/",
} as const;

const JAKUB_KLAWON = {
  photographer: "Jakub Klawon",
  photographerUrl: "https://www.pexels.com/@jakub-klawon-5766876/",
} as const;

export const SIFNOS_PEXELS_SEARCH_QUERY = "sifnos";

export const CONFIRMED_SIFNOS_PHOTOS = {
  cheronissos: {
    id: 20857615,
    ...BEN_PRATER,
    url: "https://www.pexels.com/photo/cheronissos-beach-and-village-in-greece-20857615/",
    alt: "Cheronissos beach and village on Sifnos, Greece",
  },
  vroulidia: {
    id: 20857704,
    ...BEN_PRATER,
    url: "https://www.pexels.com/photo/view-of-the-vroulidia-beach-on-sifnos-island-in-greece-20857704/",
    alt: "Vroulidia Beach on Sifnos Island, Greece",
  },
  harbour: {
    id: 27490678,
    ...BEN_PRATER,
    url: "https://www.pexels.com/photo/greek-islands-harbour-town-27490678/",
    alt: "Harbour and bay on Sifnos Island, Greece",
  },
  villageHarbour: {
    id: 31095031,
    ...BEN_PRATER,
    url: "https://www.pexels.com/photo/idyllic-seaside-village-in-sifnos-greece-31095031/",
    alt: "Fishing boats and white houses in a seaside village on Sifnos, Greece",
  },
  artemonasSign: {
    id: 27550100,
    ...BEN_PRATER,
    url: "https://www.pexels.com/photo/palm-tree-and-white-walls-27550100/",
    alt: "Artemonas, Sifnos village sign on a white wall",
  },
  doorway: {
    id: 27198710,
    ...BEN_PRATER,
    url: "https://www.pexels.com/photo/greek-door-entrance-27198710/",
    alt: "Stone doorway in a village on Sifnos, Greece",
  },
  coast: {
    id: 20159175,
    ...BEN_PRATER,
    url: "https://www.pexels.com/photo/town-on-sea-coast-in-summer-20159175/",
    alt: "Coastal village on Sifnos, Greece",
  },
  steps: {
    id: 27528446,
    ...BEN_PRATER,
    url: "https://www.pexels.com/photo/painted-steps-in-greek-island-27528446/",
    alt: "Painted steps overlooking a bay on Sifnos, Greece",
  },
  lighthouse: {
    id: 5939542,
    ...JAKUB_KLAWON,
    url: "https://www.pexels.com/photo/lighthouse-on-top-of-cliff-5939542/",
    alt: "Lighthouse on the cliffs of Sifnos, Greece",
  },
} satisfies Record<string, PinnedPexelsPhoto>;

const SLOT_PHOTO: Record<string, keyof typeof CONFIRMED_SIFNOS_PHOTOS> = {
  "plats-gialos": "harbour",
  vathi: "harbour",
  fykiada: "vroulidia",
  kamares: "villageHarbour",
  faros: "lighthouse",
  heronissos: "cheronissos",
  chrysopigi: "coast",
  "agios-loukas": "doorway",
  vroulidia: "vroulidia",
  apollonia: "steps",
  artemonas: "artemonasSign",
  exampela: "doorway",
  katavati: "steps",
  panopetali: "doorway",
  troullaki: "coast",
  "kato-petali": "artemonasSign",
  kastro: "lighthouse",
};

export const PINNED_PEXELS: Record<string, PinnedPexelsPhoto> = Object.fromEntries(
  Object.entries(SLOT_PHOTO).map(([slot, key]) => [slot, CONFIRMED_SIFNOS_PHOTOS[key]]),
);

const CONFIRMED_IDS = new Set(
  Object.values(CONFIRMED_SIFNOS_PHOTOS).map((photo) => photo.id),
);

/** Place names that belong on the Pexels Sifnos search, used to rank live hits. */
export const SLOT_SEARCH_KEYWORDS: Record<string, string[]> = {
  "plats-gialos": ["platis", "plats gialos", "plats-gialos"],
  vathi: ["vathi", "vathy"],
  fykiada: ["fykiada", "fikiada"],
  kamares: ["kamares"],
  faros: ["faros", "lighthouse"],
  heronissos: ["cheronissos", "cherronisos", "heronissos", "herronisos"],
  chrysopigi: ["chrysopigi"],
  "agios-loukas": ["agios loukas", "agios-loukas"],
  vroulidia: ["vroulidia"],
  apollonia: ["apollonia"],
  artemonas: ["artemonas", "artemon"],
  exampela: ["exampela", "exambela"],
  katavati: ["katavati"],
  panopetali: ["pano petali", "panopetali"],
  troullaki: ["troullaki"],
  "kato-petali": ["kato petali", "kato-petali"],
  kastro: ["kastro"],
};

const SIFNOS_HIT =
  /\b(sifnos|cheronissos|cherronisos|vroulidia|heronissos|herronisos|artemonas|kamares)\b/;

const OTHER_ISLAND =
  /\b(mykonos|santorini|oia|paxos|paros|naxos|ios|crete|creta|heraklion|chania|seitan|monemvasia|zakynthos|corfu|rhodes|skiathos|skopelos|folegandros|serifos|kythnos|milos|kimolos|amorgos|antiparos)\b/;

export function isSifnosSearchHit(alt: string, url: string, id?: number) {
  if (id != null && CONFIRMED_IDS.has(id)) return true;
  return SIFNOS_HIT.test(`${alt} ${url}`.toLowerCase());
}

export function isOtherIslandPexelsPhoto(alt: string, url: string) {
  const text = `${alt} ${url}`.toLowerCase();
  if (SIFNOS_HIT.test(text)) return false;
  return OTHER_ISLAND.test(text);
}
