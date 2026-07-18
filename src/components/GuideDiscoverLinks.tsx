import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { getGuideDiscoverLinks } from "@/lib/guide-discover";

export async function GuideDiscoverLinks({
  locale,
  slug,
}: {
  locale: string;
  slug: string;
}) {
  const t = await getTranslations("Footer");
  const guide = await getTranslations("Guide");
  const links = getGuideDiscoverLinks(locale, slug);

  return (
    <aside className="mt-12 overflow-hidden rounded-3xl border border-aegean/10 bg-gradient-to-br from-limestone/80 via-foam to-foam p-6 md:p-8">
      <div className="flex flex-wrap items-start gap-4">
        <a
          href={`https://discovercyclades.gr/${locale === "el" ? "el" : "en"}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3"
        >
          <Image
            src="https://discovercyclades.gr/favicon.svg"
            alt="Discover Cyclades"
            width={36}
            height={36}
            className="h-9 w-9"
          />
          <span>
            <span className="block text-sm font-bold text-aegean">Discover Cyclades</span>
            <span className="block text-[10px] font-medium uppercase tracking-wider text-aegean/45">
              {t("dcPartner")}
            </span>
          </span>
        </a>
      </div>
      <p className="mt-4 max-w-xl text-sm text-aegean/70">{guide("discoverLead")}</p>
      <ul className="mt-5 flex flex-wrap gap-2">
        {links.map((link) => (
          <li key={link.href}>
            <a
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-full border border-aegean/12 bg-foam/80 px-3.5 py-2 text-xs font-semibold text-aegean/80 transition hover:border-aegean/30 hover:text-aegean"
            >
              {t(link.labelKey)} ↗
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
}
