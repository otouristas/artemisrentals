import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { getBlogPosts } from "@/lib/content";
import { blogIndexJsonLd, buildMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Blog" });
  return buildMetadata({
    locale: locale as Locale,
    title: `${t("title")} | Artemis Rental`,
    description: t("lead"),
    path: "/blog",
  });
}

export default async function BlogIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Blog");
  const common = await getTranslations("Common");
  const loc = locale as Locale;
  const posts = getBlogPosts(loc);

  return (
    <div className="container-site page-hero pb-20">
      <Breadcrumbs locale={loc} items={[{ label: t("title") }]} />
      <JsonLd data={blogIndexJsonLd(loc, posts)} />
      <h1 className="text-display text-aegean">{t("title")}</h1>
      <p className="mt-4 max-w-2xl text-lead text-aegean/75">{t("lead")}</p>
      <div className="mt-12 grid gap-8 md:grid-cols-2">
        {posts.map((post) => (
          <article key={post.slug} className="group overflow-hidden rounded-2xl outline outline-aegean/10">
            <Link href={`/blog/${post.slug}`} className="block">
              <div className="relative aspect-[16/9] overflow-hidden bg-limestone/60">
                {post.cover ? (
                  <Image
                    src={post.cover}
                    alt=""
                    fill
                    className="object-cover transition duration-500 group-hover:scale-[1.03]"
                    sizes="(max-width:768px) 100vw, 50vw"
                  />
                ) : null}
              </div>
              <div className="bg-foam/70 p-6">
                <p className="text-xs uppercase tracking-wide text-aegean/50">
                  {common("minRead", { minutes: post.readingMinutes })}
                  {post.datePublished ? ` · ${post.datePublished}` : ""}
                </p>
                <h2 className="mt-2 font-display text-2xl text-aegean">{post.title}</h2>
                <p className="mt-3 text-aegean/70">{post.description}</p>
                <span className="mt-4 inline-block text-sm font-semibold text-olive">
                  {t("read")} →
                </span>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
