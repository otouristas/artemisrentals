import "server-only";
import { unstable_cache } from "next/cache";
import type { Locale } from "@/i18n/routing";

const PEXELS_API = "https://api.pexels.com/v1";
const REVALIDATE_SECONDS = 60 * 60 * 24 * 7;

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

class PexelsTransientError extends Error {
  constructor(status: number) {
    super(`Pexels request failed (${status})`);
    this.name = "PexelsTransientError";
  }
}

function asPhoto(data: unknown): PexelsPhoto | null {
  if (!data || typeof data !== "object") return null;
  const photo = data as Partial<PexelsPhoto>;
  if (typeof photo.id !== "number" || !photo.src || !photo.url) return null;
  if (typeof photo.photographer !== "string") return null;
  return photo as PexelsPhoto;
}

/**
 * Network fetch is uncached so 429/5xx/auth failures are never stored in the
 * Data Cache. Successful payloads are wrapped in unstable_cache by callers.
 */
async function pexelsFetch(path: string): Promise<Response> {
  const key = apiKey();
  if (!key) {
    throw new PexelsTransientError(401);
  }
  return fetch(`${PEXELS_API}${path}`, {
    headers: { Authorization: key },
    cache: "no-store",
  });
}

async function searchPexelsPhotosUncached(
  query: string,
  orientation: "landscape" | "portrait" | "square",
  perPage: number,
): Promise<PexelsPhoto[]> {
  const params = new URLSearchParams({
    query,
    per_page: String(perPage),
    page: "1",
    locale: "en-US",
  });
  params.set("orientation", orientation);
  const res = await pexelsFetch(`/search?${params.toString()}`);
  if (res.status === 429 || res.status >= 500 || res.status === 401 || res.status === 403) {
    throw new PexelsTransientError(res.status);
  }
  if (!res.ok) {
    console.warn(`[pexels] search HTTP ${res.status} for "${query}"`);
    return [];
  }
  const data = (await res.json()) as PexelsSearchResponse;
  const photos = (data.photos ?? [])
    .map(asPhoto)
    .filter((photo): photo is PexelsPhoto => photo != null);
  console.info(`[pexels] search ok "${query}" (${photos.length})`);
  return photos;
}

const searchPexelsPhotosCached = unstable_cache(
  searchPexelsPhotosUncached,
  ["pexels-search-v2"],
  { revalidate: REVALIDATE_SECONDS, tags: ["pexels"] },
);

export async function searchPexelsPhotos(
  query: string,
  options: {
    orientation?: "landscape" | "portrait" | "square";
    perPage?: number;
  } = {},
): Promise<PexelsPhoto[]> {
  if (!hasPexelsKey()) return [];
  try {
    return await searchPexelsPhotosCached(
      query,
      options.orientation ?? "landscape",
      options.perPage ?? 15,
    );
  } catch (error) {
    console.warn(
      "[pexels] search skipped",
      error instanceof Error ? error.message : "unknown error",
    );
    return [];
  }
}

async function getPexelsPhotoUncached(id: number): Promise<PexelsPhoto | null> {
  const res = await pexelsFetch(`/photos/${id}`);
  if (res.status === 429 || res.status >= 500 || res.status === 401 || res.status === 403) {
    throw new PexelsTransientError(res.status);
  }
  if (!res.ok) return null;
  return asPhoto(await res.json());
}

const getPexelsPhotoCached = unstable_cache(
  getPexelsPhotoUncached,
  ["pexels-photo-v2"],
  { revalidate: REVALIDATE_SECONDS, tags: ["pexels"] },
);

export async function getPexelsPhoto(id: number): Promise<PexelsPhoto | null> {
  if (!hasPexelsKey()) return null;
  try {
    return await getPexelsPhotoCached(id);
  } catch (error) {
    console.warn(
      "[pexels] photo skipped",
      error instanceof Error ? error.message : "unknown error",
    );
    return null;
  }
}

/** CDN variants for a known Pexels photo id (no API call). */
export function pexelsSrcSet(id: number): PexelsPhoto["src"] {
  const original = `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg`;
  return {
    original,
    large2x: `${original}?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940`,
    large: `${original}?auto=compress&cs=tinysrgb&h=650&w=940`,
    medium: `${original}?auto=compress&cs=tinysrgb&h=350`,
    small: `${original}?auto=compress&cs=tinysrgb&h=130`,
    portrait: `${original}?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800`,
    landscape: `${original}?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200`,
    tiny: `${original}?auto=compress&cs=tinysrgb&dpr=1&fit=crop&h=200&w=280`,
  };
}

export type PinnedPexelsPhoto = {
  id: number;
  photographer: string;
  photographerUrl: string;
  url: string;
  alt: string;
  width?: number;
  height?: number;
  avgColor?: string;
};

export function pinnedToPhoto(pin: PinnedPexelsPhoto): PexelsPhoto {
  return {
    id: pin.id,
    width: pin.width ?? 1600,
    height: pin.height ?? 1000,
    url: pin.url,
    photographer: pin.photographer,
    photographer_url: pin.photographerUrl,
    avg_color: pin.avgColor ?? null,
    alt: pin.alt,
    src: pexelsSrcSet(pin.id),
  };
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
