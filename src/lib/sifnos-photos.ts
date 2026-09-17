import "server-only";
import { cache } from "react";
import {
  getPexelsPhoto,
  hasPexelsKey,
  localResolvedImage,
  searchPexelsPhotos,
  toResolvedImage,
  type PhotoUse,
  type PexelsPhoto,
  type ResolvedImage,
} from "@/lib/pexels";

export type PhotoPool = "beach" | "village" | "harbour" | "chapel" | "cove";

export type SifnosPhotoSlot = {
  id: string;
  pool: PhotoPool;
  /** Stable index into the pooled Pexels search so slots do not share a frame. */
  index: number;
  alt: string;
  photoId?: number;
};

const POOLS: Record<PhotoPool, { query: string; fallbackQuery: string; perPage: number }> = {
  beach: {
    query: "greece cyclades sandy beach turquoise",
    fallbackQuery: "greek island sandy beach",
    perPage: 15,
  },
  village: {
    query: "cyclades whitewashed village alley",
    fallbackQuery: "white greek village street bougainvillea",
    perPage: 15,
  },
  harbour: {
    query: "greek island harbour fishing boats",
    fallbackQuery: "greece fishing port boats",
    perPage: 15,
  },
  chapel: {
    query: "white chapel on rocks greece sea",
    fallbackQuery: "greek orthodox church sea",
    perPage: 8,
  },
  cove: {
    query: "rocky cove pebble beach greece",
    fallbackQuery: "wild beach greece cliffs",
    perPage: 8,
  },
};

/**
 * One Pexels photo per island location, drawn from a small set of pooled
 * searches (not one request per slot) so a 29-worker SSG stays inside the
 * Pexels rate limit.
 */
export const SIFNOS_PHOTO_SLOTS: Record<string, SifnosPhotoSlot> = {
  "plats-gialos": {
    id: "plats-gialos",
    pool: "beach",
    index: 0,
    alt: "Long sandy beach on a Greek island",
  },
  vathi: {
    id: "vathi",
    pool: "beach",
    index: 1,
    alt: "Sheltered sandy bay in the Cyclades",
  },
  fykiada: {
    id: "fykiada",
    pool: "beach",
    index: 2,
    alt: "Remote wild beach reached on foot",
  },
  kamares: {
    id: "kamares",
    pool: "harbour",
    index: 0,
    alt: "Ferry port bay on a Greek island",
  },
  faros: {
    id: "faros",
    pool: "harbour",
    index: 1,
    alt: "Fishing village beach in Greece",
  },
  heronissos: {
    id: "heronissos",
    pool: "harbour",
    index: 2,
    alt: "Small fishing harbour on a Greek island",
  },
  chrysopigi: {
    id: "chrysopigi",
    pool: "chapel",
    index: 0,
    alt: "White chapel on a rocky cape above the sea",
  },
  "agios-loukas": {
    id: "agios-loukas",
    pool: "chapel",
    index: 1,
    alt: "Village church on a Greek island",
  },
  vroulidia: {
    id: "vroulidia",
    pool: "cove",
    index: 0,
    alt: "Pebble beach in a rocky Greek cove",
  },
  apollonia: {
    id: "apollonia",
    pool: "village",
    index: 0,
    alt: "Whitewashed Cycladic village street",
  },
  artemonas: {
    id: "artemonas",
    pool: "village",
    index: 1,
    alt: "Neoclassical houses on a Greek island",
  },
  exampela: {
    id: "exampela",
    pool: "village",
    index: 2,
    alt: "Quiet hillside village in the Cyclades",
  },
  katavati: {
    id: "katavati",
    pool: "village",
    index: 3,
    alt: "Hilltop Cycladic houses",
  },
  panopetali: {
    id: "panopetali",
    pool: "village",
    index: 4,
    alt: "White village houses with bright doors",
  },
  troullaki: {
    id: "troullaki",
    pool: "village",
    index: 5,
    alt: "Small white hamlet in the Cyclades",
  },
  "kato-petali": {
    id: "kato-petali",
    pool: "village",
    index: 6,
    alt: "Stone lane in a Cycladic village",
  },
  kastro: {
    id: "kastro",
    pool: "village",
    index: 7,
    alt: "Medieval cliff village above the sea",
  },
};

/** Blog/guide copies that were generated from the on-site Sifnos set. */
const PATH_ALIASES: Record<string, string> = {
  "/images/blog/3-day-sifnos-itinerary-cover.jpg": "apollonia",
  "/images/blog/apollonia-vs-kamares-stay-cover.jpg": "artemonas",
  "/images/blog/best-time-visit-sifnos-cover.jpg": "faros",
  "/images/blog/family-travel-sifnos-cover.jpg": "plats-gialos",
  "/images/blog/kamares-port-arrival-guide-cover.jpg": "kamares",
  "/images/blog/kamares-port-arrival-guide.jpg": "kamares",
  "/images/blog/sifnos-beaches-by-car-cover.jpg": "vathi",
  "/images/blog/sifnos-beaches-by-car.jpg": "vathi",
  "/images/blog/sifnos-hiking-trails-by-car-cover.jpg": "fykiada",
  "/images/blog/sifnos-hiking-trails-by-car.jpg": "fykiada",
  "/images/blog/sifnos-vs-milos-cover.jpg": "chrysopigi",
  "/images/blog/sifnos-vs-milos.jpg": "chrysopigi",
  "/images/guide/apollonia-artemonas.jpg": "apollonia",
  "/images/guide/beaches.jpg": "plats-gialos",
  "/images/guide/ferries.jpg": "kamares",
  "/images/guide/food-pottery.jpg": "heronissos",
  "/images/guide/kamares-port.jpg": "kamares",
  "/images/guide/overview.jpg": "vathi",
  "/images/guide/practical-tips.jpg": "vroulidia",
  "/images/guide/things-to-do.jpg": "chrysopigi",
  "/images/guide/where-to-stay.jpg": "artemonas",
};

function normalizePath(src: string) {
  return src.split("?")[0].replace(/\/+$/, "");
}

export function sifnosSlotForSrc(src: string): SifnosPhotoSlot | null {
  const path = normalizePath(src);
  const alias = PATH_ALIASES[path];
  if (alias) return SIFNOS_PHOTO_SLOTS[alias] ?? null;
  const match = /\/images\/sifnos\/(?:beaches|villages)\/([^/.]+)/.exec(path);
  if (!match) return null;
  return SIFNOS_PHOTO_SLOTS[match[1]] ?? null;
}

export function isSifnosPexelsSrc(src: string) {
  return sifnosSlotForSrc(src) != null;
}

const VILLAGE_IDS = new Set([
  "apollonia",
  "artemonas",
  "exampela",
  "katavati",
  "panopetali",
  "troullaki",
  "agios-loukas",
  "kato-petali",
  "kastro",
]);

/** Prefer a file that actually exists so markdown copies without a matching jpg do not 404. */
function localSrcFor(src: string, slot: SifnosPhotoSlot | null) {
  const path = normalizePath(src);
  if (path.startsWith("/images/sifnos/")) return path;
  if (slot) {
    const folder = VILLAGE_IDS.has(slot.id) ? "villages" : "beaches";
    return `/images/sifnos/${folder}/${slot.id}.webp`;
  }
  if (
    path.startsWith("/images/blog/") &&
    path.endsWith(".jpg") &&
    !path.includes("-cover.")
  ) {
    return path.replace(/\.jpg$/, "-cover.jpg");
  }
  return path;
}

const loadPoolPhotos = cache(async (pool: PhotoPool): Promise<PexelsPhoto[]> => {
  const spec = POOLS[pool];
  const primary = await searchPexelsPhotos(spec.query, {
    orientation: "landscape",
    perPage: spec.perPage,
  });
  if (primary.length) return primary;
  return searchPexelsPhotos(spec.fallbackQuery, {
    orientation: "landscape",
    perPage: spec.perPage,
  });
});

async function loadSlotPhoto(slot: SifnosPhotoSlot) {
  if (slot.photoId) {
    const pinned = await getPexelsPhoto(slot.photoId);
    if (pinned) return pinned;
  }
  const photos = await loadPoolPhotos(slot.pool);
  if (!photos.length) return null;
  return photos[slot.index % photos.length] ?? photos[0] ?? null;
}

const loadSlotPhotoCached = cache(async (slotId: string) => {
  const slot = SIFNOS_PHOTO_SLOTS[slotId];
  if (!slot) return null;
  return loadSlotPhoto(slot);
});

let missingKeyWarned = false;

export const resolveContentImage = cache(
  async (src: string, use: PhotoUse = "cover"): Promise<ResolvedImage> => {
    const slot = sifnosSlotForSrc(src);
    if (!slot) return localResolvedImage(localSrcFor(src, null), "");
    if (!hasPexelsKey()) {
      if (!missingKeyWarned) {
        missingKeyWarned = true;
        console.warn(
          "[pexels] PEXELS_API_KEY is unset. Sifnos location photos will use local fallbacks.",
        );
      }
      return localResolvedImage(localSrcFor(src, slot), slot.alt);
    }
    const photo = await loadSlotPhotoCached(slot.id);
    if (!photo) return localResolvedImage(localSrcFor(src, slot), slot.alt);
    return toResolvedImage(photo, use, slot.alt);
  },
);

export async function resolveCoverSrc(src: string | undefined, use: PhotoUse = "og") {
  if (!src) return undefined;
  const resolved = await resolveContentImage(src, use);
  return resolved.src;
}
