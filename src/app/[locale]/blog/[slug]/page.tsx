import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import {
  extractToc,
  getBlogPost,
  getBlogPosts,
  getRelatedArticles,
  markdownToHtml,
} from "@/lib/content";
import { buildMetadata, absoluteUrl } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";
import { routing, type Locale } from "@/i18n/routing";
import { bcp47 } from "@/lib/i18n-locale";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    getBlogPosts(locale).map((p) => ({ locale, slug: p.slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const post = getBlogPost(locale as Locale, slug);
  if (!post) return {};
  return buildMetadata({
    locale: locale as Locale,
    title: `${post.title} | Artemis Rental`,
    description: post.description,
    path: `/blog/${slug}`,
    type: "article",
    image: post.cover,
  });
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const loc = locale as Locale;
  const post = getBlogPost(loc, slug);
  if (!post) notFound();
  const t = await getTranslations("Blog");
  const common = await getTranslations("Common");
  const html = markdownToHtml(post.content);
  const toc = extractToc(post.content);
  const related = getRelatedArticles(loc, "blog", post);

  return (
    <article className="container-site page-hero pb-20">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          description: post.description,
          datePublished: post.datePublished,
          dateModified: post.dateModified ?? post.datePublished,
          image: post.cover ? `${SITE_URL}${post.cover}` : undefined,
          author: { "@type": "Organization", name: post.author ?? "Artemis Rental" },
          mainEntityOfPage: absoluteUrl(loc, `/blog/${slug}`),
          inLanguage: bcp47(loc),
        }}
      />
      <Breadcrumbs
        locale={loc}
        items={[
          { label: t("title"), href: "/blog" },
          { label: post.title },
        ]}
      />
      {post.cover ? (
        <div className="relative mt-4 aspect-[21/9] overflow-hidden rounded-3xl">
          <Image
            src={post.cover}
            alt=""
            fill
            className="object-cover"
            sizes="100vw"
            preload
          />
        </div>
      ) : null}
      <h1 className="mt-8 text-display text-aegean">{post.title}</h1>
      <p className="mt-3 text-sm text-aegean/55">
        {common("minRead", { minutes: post.readingMinutes })}
        {post.datePublished ? ` · ${post.datePublished}` : ""}
        {post.author ? ` · ${post.author}` : ""}
      </p>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_220px]">
        <div className="prose-artemis" dangerouslySetInnerHTML={{ __html: html }} />
        {toc.length > 0 ? (
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-aegean/50">
              {common("toc")}
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              {toc.map((item) => (
                <li key={item.id} className={item.level === 3 ? "pl-3" : undefined}>
                  <a href={`#${item.id}`} className="text-aegean/70 hover:text-aegean">
                    {item.text}
                  </a>
                </li>
              ))}
            </ul>
          </aside>
        ) : null}
      </div>

      {related.length > 0 ? (
        <section className="mt-16 border-t border-aegean/12 pt-10">
          <h2 className="text-title text-aegean">{common("related")}</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {related.map((r) => (
              <Link
                key={r.slug}
                href={`/blog/${r.slug}`}
                className="border-t border-aegean/12 pt-4"
              >
                <p className="font-display text-xl text-aegean">{r.title}</p>
                <p className="mt-2 text-sm text-aegean/65">{r.description}</p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
}
