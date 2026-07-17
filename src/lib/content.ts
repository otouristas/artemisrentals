import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";
import type { Locale } from "@/i18n/routing";

const root = process.cwd();

export type Article = {
  slug: string;
  title: string;
  description: string;
  answer?: string;
  datePublished?: string;
  dateModified?: string;
  content: string;
  readingMinutes: number;
};

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
      return {
        slug: String(data.slug ?? file.replace(/\.md$/, "")),
        title: String(data.title ?? ""),
        description: String(data.description ?? ""),
        answer: data.answer ? String(data.answer) : undefined,
        datePublished: data.datePublished ? String(data.datePublished) : undefined,
        dateModified: data.dateModified ? String(data.dateModified) : undefined,
        content,
        readingMinutes: Math.max(1, Math.ceil(stats.minutes)),
      };
    })
    .sort((a, b) => a.title.localeCompare(b.title));
}

export function getGuideArticles(locale: Locale) {
  return readDir(locale, "guide");
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

/** Minimal markdown to HTML for trusted local content */
export function markdownToHtml(md: string): string {
  const lines = md.split("\n");
  const html: string[] = [];
  let inList = false;

  const flushList = () => {
    if (inList) {
      html.push("</ul>");
      inList = false;
    }
  };

  for (const line of lines) {
    const h2 = /^##\s+(.+)/.exec(line);
    const h3 = /^###\s+(.+)/.exec(line);
    const li = /^-\s+(.+)/.exec(line);
    const ordered = /^\d+\.\s+(.+)/.exec(line);
    if (h2) {
      flushList();
      html.push(`<h2>${inline(h2[1])}</h2>`);
    } else if (h3) {
      flushList();
      html.push(`<h3>${inline(h3[1])}</h3>`);
    } else if (li || ordered) {
      if (!inList) {
        html.push("<ul>");
        inList = true;
      }
      html.push(`<li>${inline((li ?? ordered)![1])}</li>`);
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

function inline(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>');
}
