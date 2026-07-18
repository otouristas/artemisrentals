import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  business,
  discoverCycladesUrl,
  sifnosFerryUrl,
  sifnosGuideDcUrl,
  sifnosHotelsUrl,
  tripPlannerUrl,
  whatsappUrl,
} from "@/lib/site";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";

const linkClass =
  "text-sm text-foam/80 transition hover:text-foam";

export function Footer({ locale }: { locale: string }) {
  const t = useTranslations("Footer");
  const nav = useTranslations("Nav");
  const year = new Date().getFullYear();
  const dcThings = discoverCycladesUrl(locale, "/sifnos/things-to-do");
  const dcHow = discoverCycladesUrl(locale, "/sifnos/how-to-get-there");

  return (
    <footer className="mt-auto border-t border-foam/10 bg-aegean text-foam">
      <div className="container-site py-14 md:py-16">
        <div className="grid grid-cols-2 gap-x-8 gap-y-10 md:grid-cols-3 xl:grid-cols-5 xl:gap-x-8">
          {/* 1. Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-flex w-fit">
              <Image
                src="/images/brand/artemis-auto-rental-white.svg"
                alt="Artemis Rental"
                width={160}
                height={46}
                className="h-10 w-auto"
              />
            </Link>
            <p className="mt-4 max-w-[16rem] text-sm leading-relaxed text-foam/70">
              {t("tagline")}
            </p>
            <p className="mt-3 max-w-[16rem] text-xs leading-relaxed text-foam/50">
              {t("sinceLine", { year: business.since })}
            </p>
          </div>

          {/* 2. Explore */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-foam/50">
              {t("explore")}
            </p>
            <ul className="mt-4 flex flex-col gap-2.5">
              <li><Link href="/cars" className={linkClass}>{nav("cars")}</Link></li>
              <li><Link href="/scooters" className={linkClass}>{nav("scooters")}</Link></li>
              <li><Link href="/rates" className={linkClass}>{nav("rates")}</Link></li>
              <li><Link href="/book" className={linkClass}>{nav("book")}</Link></li>
              <li><Link href="/about" className={linkClass}>{nav("about")}</Link></li>
              <li><Link href="/faq" className={linkClass}>{nav("faq")}</Link></li>
            </ul>
          </div>

          {/* 3. Sifnos Guide */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-foam/50">
              {t("guide")}
            </p>
            <ul className="mt-4 flex flex-col gap-2.5">
              <li><Link href="/sifnos-guide" className={linkClass}>{nav("guideHub")}</Link></li>
              <li><Link href="/sifnos-guide/how-to-get-there" className={linkClass}>{nav("guideHowToGet")}</Link></li>
              <li><Link href="/sifnos-guide/beaches" className={linkClass}>{nav("guideBeaches")}</Link></li>
              <li><Link href="/sifnos-guide/things-to-do" className={linkClass}>{nav("guideThings")}</Link></li>
              <li><Link href="/sifnos-guide/getting-around" className={linkClass}>{nav("guideGettingAround")}</Link></li>
            </ul>
          </div>

          {/* 4. Discover Cyclades */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-foam/50">
              {t("discover")}
            </p>
            <ul className="mt-4 flex flex-col gap-2.5">
              <li>
                <a href={dcHow} target="_blank" rel="noopener noreferrer" className={linkClass}>
                  {t("dcHowToGet")}
                </a>
              </li>
              <li>
                <a href={sifnosFerryUrl(locale)} target="_blank" rel="noopener noreferrer" className={linkClass}>
                  {t("dcFerries")}
                </a>
              </li>
              <li>
                <a href={dcThings} target="_blank" rel="noopener noreferrer" className={linkClass}>
                  {t("dcThings")}
                </a>
              </li>
              <li>
                <a href={sifnosGuideDcUrl(locale)} target="_blank" rel="noopener noreferrer" className={linkClass}>
                  {t("dcGuide")}
                </a>
              </li>
              <li>
                <a href={sifnosHotelsUrl(locale)} target="_blank" rel="noopener noreferrer" className={linkClass}>
                  {t("dcHotels")}
                </a>
              </li>
              <li>
                <a
                  href={tripPlannerUrl(locale, "Plan a Sifnos stay and nearby Cyclades hop")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-sun transition hover:brightness-110"
                >
                  {t("touristas")}
                </a>
              </li>
            </ul>
          </div>

          {/* 5. Visit / contact */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-foam/50">
              {t("visit")}
            </p>
            <ul className="mt-4 flex flex-col gap-2.5 text-sm text-foam/80">
              <li className="leading-snug">
                {business.address.streetAddress}
                <br />
                {business.address.addressLocality}
              </li>
              <li>
                <a href={`tel:${business.phones[0].e164}`} className={linkClass}>
                  {business.phones[0].display}
                </a>
              </li>
              <li>
                <a href={`mailto:${business.email}`} className={`${linkClass} break-all`}>
                  {business.email}
                </a>
              </li>
              <li>
                <a
                  href={whatsappUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-[#25D366] transition hover:brightness-110"
                >
                  <WhatsAppIcon className="h-4 w-4" />
                  WhatsApp
                </a>
              </li>
              <li><Link href="/blog" className={linkClass}>{nav("blog")}</Link></li>
            </ul>
            <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.16em] text-foam/50">
              {t("legal")}
            </p>
            <ul className="mt-3 flex flex-col gap-2.5">
              <li><Link href="/privacy" className={linkClass}>{nav("privacy")}</Link></li>
              <li><Link href="/cookies" className={linkClass}>{nav("cookies")}</Link></li>
              <li><Link href="/gdpr" className={linkClass}>{nav("gdpr")}</Link></li>
              <li><Link href="/terms" className={linkClass}>{nav("terms")}</Link></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-foam/10">
        <div className="container-site flex flex-col items-center justify-between gap-5 py-6 sm:flex-row sm:items-center">
          <p className="text-center text-sm text-foam/50 sm:text-left">
            {t("rights", { year })}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-3 text-xs text-foam/50 sm:justify-end">
            <a
              href="https://anotherseoguru.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foam"
            >
              {t("designedBy")}{" "}
              <span className="font-semibold text-foam/75">AnotherSEOGuru</span>
            </a>
            <a
              href="https://touristas.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foam"
            >
              {t("poweredBy")}{" "}
              <span className="font-semibold text-foam/75">Touristas AI</span>
            </a>
            <a
              href={discoverCycladesUrl(locale, "")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 transition hover:opacity-90"
            >
              <Image
                src="https://discovercyclades.gr/favicon.svg"
                alt=""
                width={20}
                height={20}
                className="h-5 w-5"
              />
              <span className="leading-tight">
                <span className="block text-xs font-bold text-foam">Discover Cyclades</span>
                <span className="block text-[9px] font-medium uppercase tracking-wider text-foam/40">
                  {t("dcPartner")}
                </span>
              </span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
