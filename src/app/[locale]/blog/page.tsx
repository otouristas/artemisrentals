import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getBlogPosts } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";
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
  const posts = getBlogPosts(locale as Locale);

  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 pt-28 md:px-6">
      <h1 className="font-display text-4xl text-aegean md:text-5xl">{t("title")}</h1>
      <p className="mt-4 max-w-2xl text-lg text-aegean/75">{t("lead")}</p>
      <div className="mt-12 grid gap-8 md:grid-cols-2">
        {posts.map((post) => (
          <article key={post.slug} className="rounded-3xl bg-foam/70 p-6 ring-1 ring-aegean/8">
            <p className="text-xs uppercase tracking-wide text-aegean/50">
              {t("minRead", { minutes: post.readingMinutes })}
            </p>
            <h2 className="mt-2 font-display text-2xl text-aegean">
              <Link href={`/blog/${post.slug}`}>{post.title}</Link>
            </h2>
            <p className="mt-3 text-aegean/70">{post.description}</p>
            <Link href={`/blog/${post.slug}`} className="mt-4 inline-block text-sm font-semibold text-olive">
              {t("read")} →
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
