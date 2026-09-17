import type { PinnedPexelsPhoto } from "@/lib/pexels";

/**
 * Photos from https://www.pexels.com/search/sifnos/ only.
 * Do not pin lookalike Cyclades / other-island stills. Reuse these frames
 * across slots when the API key is missing rather than substituting Mykonos,
 * Paros, Crete, Paxos, or Monemvasia.
 */
const BEN_PRATER = {
  photographer: "Ben Prater",
  photographerUrl: "https://www.pexels.com/@benprater/",
} as const;

const JAKUB_KLAWON = {
  photographer: "Jakub Klawon",
  photographerUrl: "https://www.pexels.com/@jakub-klawon/",
} as const;

export const SIFNOS_PEXELS_SEARCH_QUERY = "sifnos";

export const CONFIRMED_SIFNOS_PHOTOS = {
  cheronissos: {
    id: 20857615,
    ...BEN_PRATER,
    url: "https://www.pexels.com/photo/cheronissos-beach-and-village-in-greece-20857615/",
    alt: "Cheronissos beach and village on Sifnos, Greece",
  },
  harbour: {
    id: 27490678,
    ...BEN_PRATER,
    url: "https://www.pexels.com/photo/greek-islands-harbour-town-27490678/",
    alt: "Harbour and bay on Sifnos Island, Greece",
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
  fykiada: "steps",
  kamares: "harbour",
  faros: "lighthouse",
  heronissos: "cheronissos",
  chrysopigi: "coast",
  "agios-loukas": "coast",
  vroulidia: "steps",
  apollonia: "steps",
  artemonas: "coast",
  exampela: "steps",
  katavati: "coast",
  panopetali: "steps",
  troullaki: "coast",
  "kato-petali": "cheronissos",
  kastro: "lighthouse",
};

export const PINNED_PEXELS: Record<string, PinnedPexelsPhoto> = Object.fromEntries(
  Object.entries(SLOT_PHOTO).map(([slot, key]) => [slot, CONFIRMED_SIFNOS_PHOTOS[key]]),
);

export const CONFIRMED_SIFNOS_PHOTO_IDS = new Set(
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
  artemonas: ["artemonas"],
  exampela: ["exampela", "exambela"],
  katavati: ["katavati"],
  panopetali: ["pano petali", "panopetali"],
  troullaki: ["troullaki"],
  "kato-petali": ["kato petali", "kato-petali"],
  kastro: ["kastro"],
};

const OTHER_ISLAND =
  /\b(mykonos|santorini|oia|paxos|paros|naxos|ios|crete|creta|heraklion|chania|seitan|monemvasia|zakynthos|corfu|rhodes|skiathos|skopelos|folegandros|serifos|kythnos|milos|kimolos|amorgos|antiparos)\b/;

export function isOtherIslandPexelsPhoto(alt: string, url: string) {
  const text = `${alt} ${url}`.toLowerCase();
  if (text.includes("sifnos") || text.includes("cheronissos") || text.includes("cherronisos")) {
    return false;
  }
  return OTHER_ISLAND.test(text);
}
