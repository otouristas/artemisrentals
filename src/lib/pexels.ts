import "server-only";
import type { Locale } from "@/i18n/routing";

const PEXELS_API = "https://api.pexels.com/v1";
const REVALIDATE_SECONDS = 60 * 60 * 24 * 7;
const MEMORY_TTL_MS = REVALIDATE_SECONDS * 1000;

export type PexelsPhoto = {
  id: number;
  width: number;
  height: number;
  url: string;
  photographer: string;
  photographer_url: string;
  avg_color: string | null;
  alt: string;
  src: {
    original: string;
    large2x: string;
    large: string;
    medium: string;
    small: string;
    portrait: string;
    landscape: string;
    tiny: string;
  };
};

type PexelsSearchResponse = {
  photos?: PexelsPhoto[];
};

export type PexelsCredit = {
  photographer: string;
  photographerUrl: string;
  photoUrl: string;
};

export type PhotoUse = "cover" | "inline" | "og";

export type ResolvedImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
  avgColor?: string;
  credit?: PexelsCredit;
  fromPexels: boolean;
};

function apiKey() {
  return process.env.PEXELS_API_KEY?.trim() ?? "";
}

export function hasPexelsKey() {
  return apiKey().length > 0;
}

async function pexelsFetch(path: string): Promise<Response | null> {
  const key = apiKey();
  if (!key) return null;
  try {
    return await fetch(`${PEXELS_API}${path}`, {
      headers: { Authorization: key },
      cache: "force-cache",
      next: { revalidate: REVALIDATE_SECONDS },
    });
  } catch {
    return null;
  }
}

function asPhoto(data: unknown): PexelsPhoto | null {
  if (!data || typeof data !== "object") return null;
  const photo = data as Partial<PexelsPhoto>;
  if (typeof photo.id !== "number" || !photo.src || !photo.url) return null;
  if (typeof photo.photographer !== "string") return null;
  return photo as PexelsPhoto;
}

type MemoryEntry = { at: number; photo: PexelsPhoto | null };
const memoryCache = new Map<string, MemoryEntry>();

function recall(key: string): PexelsPhoto | null | undefined {
  const hit = memoryCache.get(key);
  if (!hit) return undefined;
  if (Date.now() - hit.at > MEMORY_TTL_MS) {
    memoryCache.delete(key);
    return undefined;
  }
  return hit.photo;
}

function remember(key: string, photo: PexelsPhoto | null) {
  memoryCache.set(key, { at: Date.now(), photo });
}

export async function getPexelsPhoto(id: number): Promise<PexelsPhoto | null> {
  const cacheKey = `photo:${id}`;
  const cached = recall(cacheKey);
  if (cached !== undefined) return cached;
  const res = await pexelsFetch(`/photos/${id}`);
  if (!res || res.status === 429 || res.status >= 500) return null;
  if (!res.ok) {
    remember(cacheKey, null);
    return null;
  }
  try {
    const photo = asPhoto(await res.json());
    remember(cacheKey, photo);
    return photo;
  } catch {
    return null;
  }
}

export async function searchPexelsPhoto(
  query: string,
  options: { orientation?: "landscape" | "portrait" | "square" } = {},
): Promise<PexelsPhoto | null> {
  const params = new URLSearchParams({
    query,
    per_page: "1",
    page: "1",
  });
  if (options.orientation) params.set("orientation", options.orientation);
  const cacheKey = `search:${params.toString()}`;
  const cached = recall(cacheKey);
  if (cached !== undefined) return cached;
  const res = await pexelsFetch(`/search?${params.toString()}`);
  if (!res || res.status === 429 || res.status >= 500) return null;
  if (!res.ok) {
    remember(cacheKey, null);
    return null;
  }
  try {
    const data = (await res.json()) as PexelsSearchResponse;
    const photo = data.photos?.[0] ? asPhoto(data.photos[0]) : null;
    remember(cacheKey, photo);
    return photo;
  } catch {
    return null;
  }
}

export function pexelsSrc(photo: PexelsPhoto, use: PhotoUse) {
  if (use === "og") return photo.src.landscape || photo.src.large;
  if (use === "cover") return photo.src.large2x || photo.src.landscape || photo.src.large;
  return photo.src.large || photo.src.medium;
}

export function toResolvedImage(photo: PexelsPhoto, use: PhotoUse, fallbackAlt: string): ResolvedImage {
  return {
    src: pexelsSrc(photo, use),
    alt: photo.alt || fallbackAlt,
    width: photo.width,
    height: photo.height,
    avgColor: photo.avg_color ?? undefined,
    credit: {
      photographer: photo.photographer,
      photographerUrl: photo.photographer_url,
      photoUrl: photo.url,
    },
    fromPexels: true,
  };
}

export function localResolvedImage(src: string, alt = ""): ResolvedImage {
  return {
    src,
    alt,
    width: 1600,
    height: 1000,
    fromPexels: false,
  };
}

function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Photographer credit HTML, with links to the photographer and the Pexels photo page. */
export function pexelsCreditHtml(locale: string, credit: PexelsCredit) {
  const name = `<a href="${escapeHtml(credit.photographerUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(credit.photographer)}</a>`;
  const pexels = `<a href="${escapeHtml(credit.photoUrl)}" target="_blank" rel="noopener noreferrer">Pexels</a>`;
  switch (locale as Locale) {
    case "el":
      return `Φωτογραφία του/της ${name} στο ${pexels}`;
    case "it":
      return `Foto di ${name} su ${pexels}`;
    case "fr":
      return `Photo de ${name} sur ${pexels}`;
    case "de":
      return `Foto von ${name} auf ${pexels}`;
    case "sv":
      return `Foto av ${name} på ${pexels}`;
    case "nl":
      return `Foto van ${name} op ${pexels}`;
    default:
      return `Photo by ${name} on ${pexels}`;
  }
}
