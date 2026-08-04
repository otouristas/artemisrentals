import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { business, whatsappUrl } from "@/lib/site";

export async function ScooterBookingNotice({
  variant = "banner",
}: {
  variant?: "banner" | "panel";
}) {
  const t = await getTranslations("Fleet");
  const nav = await getTranslations("Nav");
  const wa = whatsappUrl(nav("whatsappPrefill"));

  if (variant === "panel") {
    return (
      <div className="border border-aegean/12 bg-foam p-5 md:p-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-olive">
          {t("scooterUnavailableBadge")}
        </p>
        <h2 className="mt-3 font-display text-2xl text-aegean">{t("scooterUnavailableTitle")}</h2>
        <p className="mt-3 text-sm leading-relaxed text-aegean/70">
          {t("scooterUnavailableBody")}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/cars" className="btn-primary">
            {t("scooterUnavailableCarsCta")}
          </Link>
          <a href={wa} className="btn-ghost" target="_blank" rel="noopener noreferrer">
            {nav("whatsapp")}
          </a>
          <a href={`tel:${business.phones[0].e164}`} className="btn-ghost">
            {nav("call")}
          </a>
        </div>
      </div>
    );
  }

  return (
    <aside
      className="mt-6 border border-sun/40 bg-sun/10 px-4 py-4 text-sm leading-relaxed text-aegean md:px-5"
      role="status"
    >
      <p className="font-semibold text-aegean">{t("scooterUnavailableTitle")}</p>
      <p className="mt-1 text-aegean/75">{t("scooterUnavailableBody")}</p>
      <p className="mt-3">
        <Link href="/cars" className="font-semibold text-aegean underline-offset-4 hover:underline">
          {t("scooterUnavailableCarsCta")}
        </Link>
      </p>
    </aside>
  );
}
