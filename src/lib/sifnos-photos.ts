import "server-only";
import { cache } from "react";
import {
  getPexelsPhoto,
  hasPexelsKey,
  localResolvedImage,
  searchPexelsPhoto,
  toResolvedImage,
  type PhotoUse,
  type ResolvedImage,
} from "@/lib/pexels";

export type SifnosPhotoSlot = {
  id: string;
  query: string;
  fallbackQuery: string;
  /** Stable Pexels photo id when we want a specific frame. Search is the fallback. */
  photoId?: number;
  alt: string;
};

/**
 * One Pexels search (or get-by-id) per island location. Queries describe the
 * place as a Cycladic scene so results stay on-theme even when Sifnos itself
 * is not in the Pexels index.
 */
export const SIFNOS_PHOTO_SLOTS: Record<string, SifnosPhotoSlot> = {
  "plats-gialos": {
    id: "plats-gialos",
    query: "long sandy beach turquoise greece cyclades",
    fallbackQuery: "sandy beach greece island",
    alt: "Long sandy beach on a Greek island",
  },
  kamares: {
    id: "kamares",
    query: "greek island ferry port sandy bay",
    fallbackQuery: "harbour bay greece island",
    alt: "Ferry port bay on a Greek island",
  },
  vathi: {
    id: "vathi",
    query: "sheltered sandy bay greece island",
    fallbackQuery: "calm turquoise bay greece",
    alt: "Sheltered sandy bay in the Cyclades",
  },
  chrysopigi: {
    id: "chrysopigi",
    query: "white chapel on rocks greece sea",
    fallbackQuery: "greek church cliff sea",
    alt: "White chapel on a rocky cape above the sea",
  },
  faros: {
    id: "faros",
    query: "fishing village beach greece boats",
    fallbackQuery: "small fishing harbour greece",
    alt: "Fishing village beach in Greece",
  },
  heronissos: {
    id: "heronissos",
    query: "tiny fishing harbour greece cyclades",
    fallbackQuery: "quiet fishing cove greece",
    alt: "Small fishing harbour on a Greek island",
  },
  vroulidia: {
    id: "vroulidia",
    query: "pebble beach rocky cove greece",
    fallbackQuery: "rocky beach greece cliffs",
    alt: "Pebble beach in a rocky Greek cove",
  },
  fykiada: {
    id: "fykiada",
    query: "remote wild beach greece hiking",
    fallbackQuery: "empty beach greece cliffs",
    alt: "Remote wild beach reached on foot",
  },
  apollonia: {
    id: "apollonia",
    query: "cyclades whitewashed village alley",
    fallbackQuery: "white greek village street bougainvillea",
    alt: "Whitewashed Cycladic village street",
  },
  artemonas: {
    id: "artemonas",
    query: "neoclassical mansion greek island village",
    fallbackQuery: "elegant white houses cyclades",
    alt: "Neoclassical houses on a Greek island",
  },
  exampela: {
    id: "exampela",
    query: "quiet white village greece hillside",
    fallbackQuery: "small cycladic village houses",
    alt: "Quiet hillside village in the Cyclades",
  },
  katavati: {
    id: "katavati",
    query: "hilltop cycladic houses white",
    fallbackQuery: "white houses greece hill",
    alt: "Hilltop Cycladic houses",
  },
  panopetali: {
    id: "panopetali",
    query: "white houses blue doors greece village",
    fallbackQuery: "cycladic house bougainvillea",
    alt: "White village houses with bright doors",
  },
  troullaki: {
    id: "troullaki",
    query: "small white hamlet cyclades",
    fallbackQuery: "tiny greek village white houses",
    alt: "Small white hamlet in the Cyclades",
  },
  "agios-loukas": {
    id: "agios-loukas",
    query: "white greek orthodox church village",
    fallbackQuery: "blue dome church greece village",
    alt: "Village church on a Greek island",
  },
  "kato-petali": {
    id: "kato-petali",
    query: "stone lane cycladic village",
    fallbackQuery: "narrow alley white houses greece",
    alt: "Stone lane in a Cycladic village",
  },
  kastro: {
    id: "kastro",
    query: "medieval castle village greece sea cliff",
    fallbackQuery: "kastro greece island fortress",
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

async function loadSlotPhoto(slot: SifnosPhotoSlot) {
  if (slot.photoId) {
    const pinned = await getPexelsPhoto(slot.photoId);
    if (pinned) return pinned;
  }
  const hit = await searchPexelsPhoto(slot.query, { orientation: "landscape" });
  if (hit) return hit;
  return searchPexelsPhoto(slot.fallbackQuery, { orientation: "landscape" });
}

const loadSlotPhotoCached = cache(async (slotId: string) => {
  const slot = SIFNOS_PHOTO_SLOTS[slotId];
  if (!slot) return null;
  return loadSlotPhoto(slot);
});

export const resolveContentImage = cache(
  async (src: string, use: PhotoUse = "cover"): Promise<ResolvedImage> => {
    const slot = sifnosSlotForSrc(src);
    if (!slot || !hasPexelsKey()) return localResolvedImage(src, slot?.alt ?? "");
    const photo = await loadSlotPhotoCached(slot.id);
    if (!photo) return localResolvedImage(src, slot.alt);
    return toResolvedImage(photo, use, slot.alt);
  },
);

export async function resolveCoverSrc(src: string | undefined, use: PhotoUse = "og") {
  if (!src) return undefined;
  const resolved = await resolveContentImage(src, use);
  return resolved.src;
}
