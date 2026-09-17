import "server-only";
import { cache } from "react";
import {
  CONFIRMED_SIFNOS_PHOTOS,
  PINNED_PEXELS,
  SIFNOS_PEXELS_SEARCH_QUERY,
  SLOT_SEARCH_KEYWORDS,
  isOtherIslandPexelsPhoto,
} from "@/lib/pexels-catalog";
import {
  getPexelsPhoto,
  hasPexelsKey,
  localResolvedImage,
  pinnedToPhoto,
  searchPexelsPhotos,
  toResolvedImage,
  type PhotoUse,
  type PexelsPhoto,
  type ResolvedImage,
} from "@/lib/pexels";

export type SifnosPhotoSlot = {
  id: string;
  alt: string;
  photoId: number;
};

function slotFromPin(id: string): SifnosPhotoSlot {
  const pin = PINNED_PEXELS[id];
  return { id, alt: pin.alt, photoId: pin.id };
}

/**
 * One photo per island location. Pins are confirmed Sifnos stills from
 * https://www.pexels.com/search/sifnos/. When PEXELS_API_KEY is set,
 * GET /v1/search?query=sifnos is the source of truth (cached) and slots
 * are filled from that result set.
 */
export const SIFNOS_PHOTO_SLOTS: Record<string, SifnosPhotoSlot> = Object.fromEntries(
  Object.keys(PINNED_PEXELS).map((id) => [id, slotFromPin(id)]),
);

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

/** Last-resort local file if a pin is missing. */
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

function photoText(photo: PexelsPhoto) {
  return `${photo.alt} ${photo.url}`.toLowerCase();
}

function scoreForSlot(photo: PexelsPhoto, slotId: string) {
  const text = photoText(photo);
  let score = 0;
  if (text.includes("sifnos")) score += 2;
  if (text.includes("cheronissos") || text.includes("cherronisos")) score += 2;
  for (const keyword of SLOT_SEARCH_KEYWORDS[slotId] ?? []) {
    if (text.includes(keyword)) score += 10;
  }
  return score;
}

async function pinnedPhoto(slotId: string): Promise<PexelsPhoto | null> {
  const pin = PINNED_PEXELS[slotId];
  if (!pin) return null;
  if (hasPexelsKey()) {
    const live = await getPexelsPhoto(pin.id);
    if (live) return live;
  }
  return pinnedToPhoto(pin);
}

const loadSifnosSearchPool = cache(async (): Promise<PexelsPhoto[]> => {
  if (!hasPexelsKey()) return [];
  const pages = await Promise.all([
    searchPexelsPhotos(SIFNOS_PEXELS_SEARCH_QUERY, { perPage: 80, page: 1 }),
    searchPexelsPhotos(SIFNOS_PEXELS_SEARCH_QUERY, { perPage: 80, page: 2 }),
  ]);
  const byId = new Map<number, PexelsPhoto>();
  for (const photo of pages.flat()) {
    if (isOtherIslandPexelsPhoto(photo.alt, photo.url)) continue;
    if (!byId.has(photo.id)) byId.set(photo.id, photo);
  }
  return [...byId.values()];
});

const loadAssignedSifnosPhotos = cache(async (): Promise<Record<string, PexelsPhoto>> => {
  const slotIds = Object.keys(SIFNOS_PHOTO_SLOTS);
  const assigned: Record<string, PexelsPhoto> = {};
  const used = new Set<number>();
  const pool = await loadSifnosSearchPool();

  for (const slotId of slotIds) {
    const match = pool
      .filter((photo) => !used.has(photo.id))
      .sort((a, b) => scoreForSlot(b, slotId) - scoreForSlot(a, slotId))
      .find((photo) => scoreForSlot(photo, slotId) >= 10);
    if (match) {
      assigned[slotId] = match;
      used.add(match.id);
    }
  }

  const leftovers = pool.filter((photo) => !used.has(photo.id));
  let next = 0;
  for (const slotId of slotIds) {
    if (assigned[slotId]) continue;
    const photo = leftovers[next];
    if (photo) {
      assigned[slotId] = photo;
      used.add(photo.id);
      next += 1;
    }
  }

  const pinFrames = Object.values(CONFIRMED_SIFNOS_PHOTOS).map(pinnedToPhoto);
  let cycle = 0;
  for (const slotId of slotIds) {
    if (assigned[slotId]) continue;
    const pin = await pinnedPhoto(slotId);
    assigned[slotId] = pin ?? pinFrames[cycle % pinFrames.length];
    cycle += 1;
  }

  return assigned;
});

const loadSlotPhotoCached = cache(async (slotId: string) => {
  const assigned = await loadAssignedSifnosPhotos();
  return assigned[slotId] ?? null;
});

export const resolveContentImage = cache(
  async (src: string, use: PhotoUse = "cover"): Promise<ResolvedImage> => {
    const slot = sifnosSlotForSrc(src);
    if (!slot) return localResolvedImage(localSrcFor(src, null), "");
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
