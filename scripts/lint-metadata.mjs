#!/usr/bin/env node
/**
 * Guard title and description quality at the source, before a build exists.
 *
 * Google truncates the title link by pixel width on mobile and rewrites titles it
 * considers unhelpful; titles it leaves alone run noticeably shorter than the ones
 * it replaces. Descriptions are not a ranking factor but they are the snippet, and
 * a 50-character description wastes most of the space Google gives you.
 *
 * Checks, per locale:
 *   - title       TITLE_MIN..TITLE_MAX characters
 *   - description DESC_MIN..DESC_MAX characters
 *   - no duplicate titles within the same locale
 *
 * Sources: messages/{locale}.json (Seo namespace), content/data/fleet.json
 * (seoDescription), and the frontmatter of content/{guide,blog}/{locale}/*.md.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const TITLE_MIN = 15;
const TITLE_MAX = 60;
const DESC_MIN = 120;
const DESC_MAX = 165;

/** Appended by buildMetadata when it fits, so a title must leave room for it. */
const BRAND = " | Artemis Rental";
/** Pages that always carry the brand; their raw title must stay short enough. */
const ALWAYS_BRANDED = new Set(["cars", "scooters", "rates", "book", "reviews", "home"]);

const locales = fs
  .readdirSync(path.join(root, "messages"))
  .filter((f) => f.endsWith(".json"))
  .map((f) => f.replace(/\.json$/, ""));

/** @type {{locale:string,where:string,problem:string}[]} */
const problems = [];
const titlesByLocale = new Map();

function recordTitle(locale, where, title) {
  if (!titlesByLocale.has(locale)) titlesByLocale.set(locale, new Map());
  const seen = titlesByLocale.get(locale);
  if (seen.has(title)) {
    problems.push({
      locale,
      where,
      problem: `duplicate title, also used by ${seen.get(title)}`,
    });
  } else {
    seen.set(title, where);
  }
}

function checkTitle(locale, where, title, { branded = false } = {}) {
  const effective = branded ? title + BRAND : title;
  if (title.length < TITLE_MIN) {
    problems.push({ locale, where, problem: `title ${title.length} chars, under ${TITLE_MIN}` });
  } else if (effective.length > TITLE_MAX) {
    problems.push({
      locale,
      where,
      problem: `title ${effective.length} chars${branded ? " with brand" : ""}, over ${TITLE_MAX}`,
    });
  }
  recordTitle(locale, where, title);
}

function checkDesc(locale, where, desc) {
  if (!desc) {
    problems.push({ locale, where, problem: "missing description" });
    return;
  }
  if (desc.length < DESC_MIN || desc.length > DESC_MAX) {
    problems.push({
      locale,
      where,
      problem: `description ${desc.length} chars, outside ${DESC_MIN}-${DESC_MAX}`,
    });
  }
}

for (const locale of locales) {
  // 1. Static pages, from the Seo namespace
  const messages = JSON.parse(
    fs.readFileSync(path.join(root, `messages/${locale}.json`), "utf8"),
  );
  const seo = messages.Seo ?? {};
  for (const [page, entry] of Object.entries(seo)) {
    if (page.startsWith("_") || typeof entry !== "object") continue;
    checkTitle(locale, `Seo.${page}`, entry.title ?? "", {
      branded: ALWAYS_BRANDED.has(page),
    });
    checkDesc(locale, `Seo.${page}`, entry.description);
  }

  // 2. Guide and blog frontmatter
  for (const kind of ["guide", "blog"]) {
    const dir = path.join(root, "content", kind, locale);
    if (!fs.existsSync(dir)) continue;
    for (const name of fs.readdirSync(dir).filter((f) => f.endsWith(".md"))) {
      const raw = fs.readFileSync(path.join(dir, name), "utf8");
      const where = `${kind}/${locale}/${name}`;
      const title = /^title:\s*"(.*?)"\s*$/m.exec(raw)?.[1] ?? "";
      const desc = /^description:\s*"(.*?)"\s*$/m.exec(raw)?.[1] ?? "";
      checkTitle(locale, where, title);
      checkDesc(locale, where, desc);
    }
  }
}

// 3. Vehicle descriptions drive 112 pages from one file
const fleet = JSON.parse(fs.readFileSync(path.join(root, "content/data/fleet.json"), "utf8"));
for (const category of ["cars", "scooters"]) {
  for (const vehicle of fleet[category] ?? []) {
    for (const [locale, text] of Object.entries(vehicle.seoDescription ?? {})) {
      checkDesc(locale, `fleet/${vehicle.slug}`, text);
    }
  }
}

if (problems.length > 0) {
  const byLocale = new Map();
  for (const p of problems) {
    if (!byLocale.has(p.locale)) byLocale.set(p.locale, []);
    byLocale.get(p.locale).push(p);
  }
  console.error("Metadata problems:\n");
  for (const [locale, items] of [...byLocale].sort()) {
    console.error(`  ${locale.toUpperCase()} (${items.length})`);
    for (const i of items.slice(0, 12)) {
      console.error(`      ${i.where}: ${i.problem}`);
    }
    if (items.length > 12) console.error(`      ... and ${items.length - 12} more`);
  }
  console.error(
    `\n${problems.length} problem(s). Titles ${TITLE_MIN}-${TITLE_MAX} (brand-inclusive), descriptions ${DESC_MIN}-${DESC_MAX}.`,
  );
  process.exit(1);
}

console.log(`lint:metadata OK (${locales.length} locales)`);
