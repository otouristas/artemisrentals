import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { business, tripPlannerUrl } from "@/lib/site";

export function Footer({ locale }: { locale: string }) {
  const t = useTranslations("Footer");
  const nav = useTranslations("Nav");
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-aegean/10 bg-aegean text-foam">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-3 md:px-6">
        <div>
          <p className="font-display text-2xl">{business.name}</p>
          <p className="mt-3 max-w-sm text-foam/75">{t("tagline")}</p>
          <a
            href={tripPlannerUrl(locale, "Plan a Sifnos stay and nearby Cyclades hop")}
            className="mt-5 inline-block text-sm font-medium text-sun underline-offset-4 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t("touristas")}
          </a>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-foam/55">
            {t("explore")}
          </p>
          <ul className="mt-4 space-y-2 text-foam/85">
            <li><Link href="/cars">{nav("cars")}</Link></li>
            <li><Link href="/scooters">{nav("scooters")}</Link></li>
            <li><Link href="/rates">{nav("rates")}</Link></li>
            <li><Link href="/sifnos-guide">{nav("guide")}</Link></li>
            <li><Link href="/blog">{nav("blog")}</Link></li>
            <li><Link href="/book">{nav("book")}</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-foam/55">
            {t("visit")}
          </p>
          <ul className="mt-4 space-y-2 text-foam/85">
            <li>{business.address.streetAddress}, {business.address.addressLocality}</li>
            <li>{business.address.postalCode} — {business.address.addressRegion}</li>
            <li>
              <a href={`tel:${business.phones[0].e164}`}>{business.phones[0].display}</a>
            </li>
            <li>
              <a href={`mailto:${business.email}`}>{business.email}</a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-foam/10 px-4 py-5 text-center text-sm text-foam/55 md:px-6">
        {t("rights", { year })}
      </div>
    </footer>
  );
}
