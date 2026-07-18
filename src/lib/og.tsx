import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";

const OG_SUBTITLE: Record<string, string> = {
  en: "Cars & scooters in Sifnos since 1988",
  el: "Αυτοκίνητα & scooter στη Σίφνο από το 1988",
  it: "Auto e scooter a Sifnos dal 1988",
  fr: "Voitures et scooters à Sifnos depuis 1988",
  de: "Autos & Scooter auf Sifnos seit 1988",
  sv: "Bilar och scootrar på Sifnos sedan 1988",
  nl: "Auto's en scooters op Sifnos sinds 1988",
};

const OG_HOME_TITLE: Record<string, string> = {
  en: "Car & scooter rental in Sifnos",
  el: "Ενοικιάσεις αυτοκινήτων & scooter στη Σίφνο",
  it: "Noleggio auto e scooter a Sifnos",
  fr: "Location de voitures et scooters à Sifnos",
  de: "Auto- und Scooterverleih auf Sifnos",
  sv: "Bil- och scooteruthyrning på Sifnos",
  nl: "Auto- en scooterverhuur op Sifnos",
};

const OG_RENT_EYEBROW: Record<string, string> = {
  en: "Rent in Sifnos",
  el: "Ενοικίαση στη Σίφνο",
  it: "Noleggio a Sifnos",
  fr: "Louer à Sifnos",
  de: "Mieten auf Sifnos",
  sv: "Hyr på Sifnos",
  nl: "Huren op Sifnos",
};

const OG_SCOOTER_EYEBROW: Record<string, string> = {
  en: "Scooter hire in Sifnos",
  el: "Scooter στη Σίφνο",
  it: "Noleggio scooter a Sifnos",
  fr: "Location de scooters à Sifnos",
  de: "Scooterverleih auf Sifnos",
  sv: "Scooteruthyrning på Sifnos",
  nl: "Scooterverhuur op Sifnos",
};

const OG_GUIDE_EYEBROW: Record<string, string> = {
  en: "Sifnos Guide",
  el: "Οδηγός Σίφνου",
  it: "Guida di Sifnos",
  fr: "Guide de Sifnos",
  de: "Sifnos-Reiseführer",
  sv: "Sifnos-guide",
  nl: "Sifnos-gids",
};

const OG_FLEET_FALLBACK: Record<string, string> = {
  en: "Artemis fleet",
  el: "Στόλος Artemis",
  it: "Flotta Artemis",
  fr: "Flotte Artemis",
  de: "Artemis-Flotte",
  sv: "Artemis-flotta",
  nl: "Artemis-vloot",
};

const OG_SCOOTER_FALLBACK: Record<string, string> = {
  en: "Artemis scooters",
  el: "Scooter Artemis",
  it: "Scooter Artemis",
  fr: "Scooters Artemis",
  de: "Artemis-Scooter",
  sv: "Artemis-scootrar",
  nl: "Artemis-scooters",
};

export function ogSubtitle(locale: string) {
  return OG_SUBTITLE[locale] ?? OG_SUBTITLE.en;
}

export function ogHomeTitle(locale: string) {
  return OG_HOME_TITLE[locale] ?? OG_HOME_TITLE.en;
}

export function ogRentEyebrow(locale: string) {
  return OG_RENT_EYEBROW[locale] ?? OG_RENT_EYEBROW.en;
}

export function ogScooterEyebrow(locale: string) {
  return OG_SCOOTER_EYEBROW[locale] ?? OG_SCOOTER_EYEBROW.en;
}

export function ogGuideEyebrow(locale: string) {
  return OG_GUIDE_EYEBROW[locale] ?? OG_GUIDE_EYEBROW.en;
}

export function ogFleetFallback(locale: string) {
  return OG_FLEET_FALLBACK[locale] ?? OG_FLEET_FALLBACK.en;
}

export function ogScooterFallback(locale: string) {
  return OG_SCOOTER_FALLBACK[locale] ?? OG_SCOOTER_FALLBACK.en;
}

async function loadFonts() {
  const dir = join(process.cwd(), "assets/fonts");
  const [fraunces, noto, notoGreek] = await Promise.all([
    readFile(join(dir, "Fraunces-SemiBold.ttf")),
    readFile(join(dir, "NotoSerif-Regular.ttf")),
    readFile(join(dir, "NotoSerifGreek-Regular.ttf")),
  ]);
  return [
    { name: "Fraunces", data: fraunces, style: "normal" as const, weight: 600 as const },
    { name: "NotoSerif", data: noto, style: "normal" as const, weight: 400 as const },
    { name: "NotoSerif", data: notoGreek, style: "normal" as const, weight: 400 as const },
  ];
}

export async function renderOgImage({
  title,
  eyebrow = "Artemis Rental",
  locale = "en",
}: {
  title: string;
  eyebrow?: string;
  locale?: string;
}) {
  const fonts = await loadFonts();
  const subtitle = ogSubtitle(locale);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px",
          background:
            "linear-gradient(145deg, #0b2a3c 0%, #123a52 55%, #1a4a66 100%)",
          color: "#f7f4ef",
          fontFamily: "NotoSerif",
        }}
      >
        <div
          style={{
            display: "flex",
            width: "100%",
            height: 8,
            background: "linear-gradient(90deg, #c9833a 0%, #e6dfd2 100%)",
            borderRadius: 999,
          }}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              fontSize: 28,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#c9833a",
              fontFamily: "Fraunces",
            }}
          >
            {eyebrow}
          </div>
          <div
            style={{
              fontSize: title.length > 48 ? 56 : 68,
              lineHeight: 1.1,
              fontFamily: "Fraunces",
              maxWidth: 980,
            }}
          >
            {title}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            fontSize: 26,
            color: "rgba(247,244,239,0.75)",
          }}
        >
          <span>{subtitle}</span>
          <span style={{ color: "#c9833a" }}>artemisrental.gr</span>
        </div>
      </div>
    ),
    { ...ogSize, fonts },
  );
}
