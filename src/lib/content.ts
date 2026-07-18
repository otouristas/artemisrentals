import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";
import type { Locale } from "@/i18n/routing";

const root = process.cwd();

export type TocItem = {
  id: string;
  text: string;
  level: 2 | 3;
};

export type Article = {
  slug: string;
  title: string;
  description: string;
  answer?: string;
  datePublished?: string;
  dateModified?: string;
  cover?: string;
  author?: string;
  tags?: string[];
  related?: string[];
  order?: number;
  content: string;
  readingMinutes: number;
};

function slugifyHeading(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\u0370-\u03ff\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export function extractToc(md: string): TocItem[] {
  const items: TocItem[] = [];
  for (const line of md.split("\n")) {
    const h2 = /^##\s+(.+)/.exec(line);
    const h3 = /^###\s+(.+)/.exec(line);
    if (h2) {
      const text = h2[1].replace(/[*_`]/g, "").trim();
      items.push({ id: slugifyHeading(text), text, level: 2 });
    } else if (h3) {
      const text = h3[1].replace(/[*_`]/g, "").trim();
      items.push({ id: slugifyHeading(text), text, level: 3 });
    }
  }
  return items;
}

function readDir(locale: Locale, kind: "guide" | "blog"): Article[] {
  const dir = path.join(root, "content", kind, locale);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((file) => {
      const raw = fs.readFileSync(path.join(dir, file), "utf8");
      const { data, content } = matter(raw);
      const stats = readingTime(content);
      const tags = Array.isArray(data.tags)
        ? data.tags.map(String)
        : typeof data.tags === "string"
          ? data.tags.split(",").map((t) => t.trim())
          : undefined;
      const related = Array.isArray(data.related)
        ? data.related.map(String)
        : undefined;
      return {
        slug: String(data.slug ?? file.replace(/\.md$/, "")),
        title: String(data.title ?? ""),
        description: String(data.description ?? ""),
        answer: data.answer ? String(data.answer) : undefined,
        datePublished: data.datePublished ? String(data.datePublished) : undefined,
        dateModified: data.dateModified ? String(data.dateModified) : undefined,
        cover: data.cover ? String(data.cover) : undefined,
        author: data.author ? String(data.author) : "Artemis Rental",
        tags,
        related,
        order: typeof data.order === "number" ? data.order : undefined,
        content,
        readingMinutes: Math.max(1, Math.ceil(stats.minutes)),
      };
    });
}

export function getGuideArticles(locale: Locale) {
  return readDir(locale, "guide").sort((a, b) => {
    if (a.order != null && b.order != null) return a.order - b.order;
    if (a.order != null) return -1;
    if (b.order != null) return 1;
    return a.title.localeCompare(b.title);
  });
}

export function getGuideArticle(locale: Locale, slug: string) {
  return getGuideArticles(locale).find((a) => a.slug === slug);
}

export function getBlogPosts(locale: Locale) {
  return readDir(locale, "blog").sort((a, b) =>
    (b.datePublished ?? "").localeCompare(a.datePublished ?? ""),
  );
}

export function getBlogPost(locale: Locale, slug: string) {
  return getBlogPosts(locale).find((a) => a.slug === slug);
}

export function getRelatedArticles(
  locale: Locale,
  kind: "guide" | "blog",
  article: Article,
  limit = 3,
) {
  const all = kind === "guide" ? getGuideArticles(locale) : getBlogPosts(locale);
  const bySlug = new Map(all.map((a) => [a.slug, a]));
  const preferred = (article.related ?? [])
    .map((s) => bySlug.get(s))
    .filter((a): a is Article => a != null && a.slug !== article.slug);
  const rest = all.filter(
    (a) => a.slug !== article.slug && !preferred.some((p) => p.slug === a.slug),
  );
  return [...preferred, ...rest].slice(0, limit);
}

function splitTableRow(line: string) {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function isTableSeparator(line: string) {
  return /^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?$/.test(line.trim());
}

/** Minimal markdown to HTML for trusted local content */
export function markdownToHtml(md: string): string {
  const lines = md.split("\n");
  const html: string[] = [];
  let inList: false | "ul" | "ol" = false;
  let firstImage = true;

  const flushList = () => {
    if (inList) {
      html.push(inList === "ul" ? "</ul>" : "</ol>");
      inList = false;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const next = lines[i + 1];
    const figure = /^!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)$/.exec(line.trim());
    const h2 = /^##\s+(.+)/.exec(line);
    const h3 = /^###\s+(.+)/.exec(line);
    const li = /^-\s+(.+)/.exec(line);
    const ordered = /^\d+\.\s+(.+)/.exec(line);
    const startsTable =
      line.trim().includes("|") && next != null && isTableSeparator(next);

    if (startsTable) {
      flushList();
      const header = splitTableRow(line);
      i += 1; // skip separator
      const rows: string[][] = [];
      while (i + 1 < lines.length && lines[i + 1].trim().includes("|") && !isTableSeparator(lines[i + 1])) {
        i += 1;
        rows.push(splitTableRow(lines[i]));
      }
      html.push("<div class=\"table-wrap\"><table>");
      html.push(
        `<thead><tr>${header.map((c) => `<th>${inline(c)}</th>`).join("")}</tr></thead>`,
      );
      html.push("<tbody>");
      for (const row of rows) {
        html.push(`<tr>${row.map((c) => `<td>${inline(c)}</td>`).join("")}</tr>`);
      }
      html.push("</tbody></table></div>");
    } else if (figure) {
      flushList();
      const alt = escapeAttr(figure[1]);
      const src = escapeAttr(figure[2]);
      const caption = figure[3] ? escapeHtml(figure[3]) : "";
      // First image is often LCP on guide pages: load eagerly.
      const loading = firstImage ? 'loading="eager" fetchpriority="high"' : 'loading="lazy"';
      firstImage = false;
      html.push(
        `<figure><img src="${src}" alt="${alt}" ${loading} />${
          caption ? `<figcaption>${caption}</figcaption>` : ""
        }</figure>`,
      );
    } else if (h2) {
      flushList();
      const text = h2[1];
      const id = slugifyHeading(text.replace(/[*_`[\]]/g, ""));
      html.push(`<h2 id="${id}">${inline(text)}</h2>`);
    } else if (h3) {
      flushList();
      const text = h3[1];
      const id = slugifyHeading(text.replace(/[*_`[\]]/g, ""));
      html.push(`<h3 id="${id}">${inline(text)}</h3>`);
    } else if (li) {
      if (inList !== "ul") {
        flushList();
        html.push("<ul>");
        inList = "ul";
      }
      html.push(`<li>${inline(li[1])}</li>`);
    } else if (ordered) {
      if (inList !== "ol") {
        flushList();
        html.push("<ol>");
        inList = "ol";
      }
      html.push(`<li>${inline(ordered[1])}</li>`);
    } else if (!line.trim()) {
      flushList();
    } else {
      flushList();
      html.push(`<p>${inline(line)}</p>`);
    }
  }
  flushList();
  return html.join("\n");
}

function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeAttr(text: string) {
  return escapeHtml(text).replace(/"/g, "&quot;");
}

function inline(text: string) {
  return escapeHtml(text)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>');
}
