import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbJsonLd } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";

export type Crumb = {
  label: string;
  href?: string;
};

export async function Breadcrumbs({
  locale,
  items,
}: {
  locale: Locale;
  items: Crumb[];
}) {
  const t = await getTranslations("Common");
  const crumbs: Crumb[] = [{ label: t("home"), href: "/" }, ...items];
  const jsonItems = crumbs.map((c) => ({
    name: c.label,
    path: c.href ?? "",
  }));

  return (
    <>
      <JsonLd data={breadcrumbJsonLd(locale, jsonItems)} />
      <nav aria-label={t("breadcrumb")} className="mb-6">
        <ol className="flex flex-wrap items-center gap-1.5 text-sm text-aegean/60">
          {crumbs.map((crumb, i) => {
            const last = i === crumbs.length - 1;
            return (
              <li key={`${crumb.label}-${i}`} className="flex items-center gap-1.5">
                {i > 0 ? <span aria-hidden className="text-aegean/30">/</span> : null}
                {last || !crumb.href ? (
                  <span className="font-medium text-aegean/80" aria-current={last ? "page" : undefined}>
                    {crumb.label}
                  </span>
                ) : (
                  <Link href={crumb.href} className="transition hover:text-aegean">
                    {crumb.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
