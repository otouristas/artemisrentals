import business from "../../content/data/business.json";

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://artemisrental.gr";

export { business };

export function tripPlannerUrl(locale: string, prompt?: string) {
  const base = business.discoverCycladesTripPlanner.replace(
    "{locale}",
    locale === "el" ? "el" : "en",
  );
  const url = new URL(base);
  url.searchParams.set("island", "sifnos");
  if (prompt) url.searchParams.set("prompt", prompt);
  return url.toString();
}

export function whatsappUrl(text?: string) {
  const phone = business.whatsapp.replace(/\D/g, "");
  const url = new URL(`https://wa.me/${phone}`);
  if (text) url.searchParams.set("text", text);
  return url.toString();
}
