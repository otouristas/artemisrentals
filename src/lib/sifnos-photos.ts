import "server-only";
import { cache } from "react";
import { PINNED_PEXELS } from "@/lib/pexels-catalog";
import {
  getPexelsPhoto,
  hasPexelsKey,
  localResolvedImage,
  pinnedToPhoto,
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
 * One Pexels photo per island location. Images are pinned so they render
 * without an API key. When PEXELS_API_KEY is set, metadata is refreshed
 * from GET /v1/photos/:id (cached) so photographer URLs stay official.
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

async function loadSlotPhoto(slot: SifnosPhotoSlot): Promise<PexelsPhoto | null> {
  const pin = PINNED_PEXELS[slot.id];
  if (hasPexelsKey()) {
    const live = await getPexelsPhoto(slot.photoId);
    if (live) return live;
  }
  return pin ? pinnedToPhoto(pin) : null;
}

const loadSlotPhotoCached = cache(async (slotId: string) => {
  const slot = SIFNOS_PHOTO_SLOTS[slotId];
  if (!slot) return null;
  return loadSlotPhoto(slot);
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
