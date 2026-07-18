export type ConsentChoice = "all" | "essential";

export const CONSENT_STORAGE_KEY = "artemis-consent";
export const CONSENT_COOKIE_NAME = "artemis_consent";
export const CONSENT_EVENT = "artemis:consent";

export function readConsent(): ConsentChoice | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (raw === "all" || raw === "essential") return raw;
  } catch {
    /* ignore */
  }
  const match = document.cookie.match(/(?:^|; )artemis_consent=(all|essential)(?:;|$)/);
  if (match?.[1] === "all" || match?.[1] === "essential") return match[1];
  return null;
}

export function writeConsent(choice: ConsentChoice) {
  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, choice);
  } catch {
    /* ignore */
  }
  const maxAge = 60 * 60 * 24 * 365;
  document.cookie = `${CONSENT_COOKIE_NAME}=${choice}; path=/; max-age=${maxAge}; SameSite=Lax`;
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: { choice } }));
}

export function openConsentPreferences() {
  window.dispatchEvent(new CustomEvent("artemis:consent-open"));
}
