import type { ReactNode } from "react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import type { Locale } from "@/i18n/routing";

export type LegalSection = {
  title: string;
  body: string;
};

export function LegalDoc({
  locale,
  title,
  lead,
  sections,
  footer,
}: {
  locale: Locale;
  title: string;
  lead: string;
  sections: LegalSection[];
  footer?: ReactNode;
}) {
  return (
    <div className="container-site page-hero max-w-3xl pb-20">
      <Breadcrumbs locale={locale} items={[{ label: title }]} />
      <h1 className="text-display text-aegean">{title}</h1>
      <p className="mt-4 text-lead text-aegean/75">{lead}</p>
      <div className="mt-10 space-y-8">
        {sections.map((s) => (
          <section key={s.title} className="border-t border-aegean/12 pt-6">
            <h2 className="font-display text-2xl text-aegean">{s.title}</h2>
            <p className="mt-3 whitespace-pre-line text-aegean/80">{s.body}</p>
          </section>
        ))}
      </div>
      {footer ? <div className="mt-10 border-t border-aegean/12 pt-6">{footer}</div> : null}
    </div>
  );
}
