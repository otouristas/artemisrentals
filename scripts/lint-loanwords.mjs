#!/usr/bin/env node
/**
 * Fail when an English term is left untranslated in localised copy.
 *
 * The non-English content was originally machine-translated, which left words like
 * "scooter", "ferry" and "parking" sitting in Latin script inside Greek, German,
 * French, Italian, Dutch and Swedish prose. This guard stops that regressing.
 *
 * Scope: messages/{locale}.json, content/guide/{locale}/, content/blog/{locale}/,
 * and the localised fields inside content/data/*.json.
 *
 * Rules live in content/i18n/glossary.json.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const glossary = JSON.parse(
  fs.readFileSync(path.join(root, "content/i18n/glossary.json"), "utf8"),
);

const allow = new Set(glossary.allowlist.terms.map((t) => t.toLowerCase()));
const locales = Object.keys(glossary.locales);

/**
 * Reduce a source string to human-facing prose.
 *
 * Slugs, tags, `related:` lists and URLs are identifiers, not copy, and flagging
 * them would drown the real findings. Frontmatter is dropped wholesale except the
 * three fields that are actually shown to readers.
 */
function stripNonProse(text) {
  let body = text;

  if (body.startsWith("---")) {
    const end = body.indexOf("\n---", 3);
    if (end !== -1) {
      const frontmatter = body.slice(0, end);
      const prose = frontmatter
        .split("\n")
        .filter((l) => /^(title|description|answer):/.test(l.trim()))
        .join("\n");
      body = `${prose}\n${body.slice(end + 4)}`;
    }
  }

  return body
    .replace(/\{[^}]*\}/g, " ") // ICU placeholders
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ") // markdown images
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1 ") // keep link text, drop href
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/\/[a-z]{2}\/[\w/-]+/g, " ") // internal route paths
    .replace(/`[^`]*`/g, " ")
    .replace(/<[^>]+>/g, " ");
}

/** @type {{locale:string,file:string,term:string,context:string}[]} */
const findings = [];

function scan(locale, file, text) {
  const banned = new Set(glossary.locales[locale].banned.map((b) => b.toLowerCase()));
  const prose = stripNonProse(text);
  const lines = prose.split("\n");

  lines.forEach((line) => {
    for (const match of line.matchAll(/[A-Za-z][A-Za-z'-]*/g)) {
      const word = match[0].toLowerCase();
      if (allow.has(word)) continue;
      if (!banned.has(word)) continue;
      findings.push({
        locale,
        file: path.relative(root, file),
        term: match[0],
        context: line.trim().slice(0, 110),
      });
    }
  });
}

function scanJsonStrings(locale, file, node) {
  if (typeof node === "string") {
    scan(locale, file, node);
    return;
  }
  if (Array.isArray(node)) {
    node.forEach((n) => scanJsonStrings(locale, file, n));
    return;
  }
  if (node && typeof node === "object") {
    for (const [key, value] of Object.entries(node)) {
      if (key.startsWith("_")) continue; // internal comments
      scanJsonStrings(locale, file, value);
    }
  }
}

for (const locale of locales) {
  // 1. UI strings
  const messages = path.join(root, `messages/${locale}.json`);
  if (fs.existsSync(messages)) {
    scanJsonStrings(locale, messages, JSON.parse(fs.readFileSync(messages, "utf8")));
  }

  // 2. Markdown content
  for (const kind of ["guide", "blog"]) {
    const dir = path.join(root, "content", kind, locale);
    if (!fs.existsSync(dir)) continue;
    for (const name of fs.readdirSync(dir)) {
      if (!name.endsWith(".md")) continue;
      const full = path.join(dir, name);
      scan(locale, full, fs.readFileSync(full, "utf8"));
    }
  }

  // 3. Localised fields in shared data files
  for (const name of ["fleet.json", "rates.json", "faqs.json", "testimonials.json"]) {
    const full = path.join(root, "content/data", name);
    if (!fs.existsSync(full)) continue;
    const data = JSON.parse(fs.readFileSync(full, "utf8"));
    const collectLocale = (node) => {
      if (Array.isArray(node)) return node.forEach(collectLocale);
      if (!node || typeof node !== "object") return;
      for (const [key, value] of Object.entries(node)) {
        if (key === locale) scanJsonStrings(locale, full, value);
        else collectLocale(value);
      }
    };
    collectLocale(data);
  }
}

if (findings.length > 0) {
  const byLocale = new Map();
  for (const f of findings) {
    if (!byLocale.has(f.locale)) byLocale.set(f.locale, []);
    byLocale.get(f.locale).push(f);
  }

  console.error("Untranslated English terms found in localised copy:\n");
  for (const [locale, items] of [...byLocale].sort()) {
    const counts = new Map();
    for (const i of items) {
      const k = i.term.toLowerCase();
      counts.set(k, (counts.get(k) ?? 0) + 1);
    }
    const summary = [...counts]
      .sort((a, b) => b[1] - a[1])
      .map(([term, n]) => `${term} x${n}`)
      .join(", ");
    console.error(`  ${locale.toUpperCase()} (${items.length}): ${summary}`);
    const prefer = glossary.locales[locale].prefer;
    for (const [term] of [...counts].sort((a, b) => b[1] - a[1]).slice(0, 4)) {
      if (prefer[term]) console.error(`      ${term} -> ${prefer[term]}`);
    }
  }
  console.error(
    `\n${findings.length} occurrence(s). See content/i18n/glossary.json for the house term per locale.`,
  );
  process.exit(1);
}

console.log(`lint:loanwords OK (${locales.length} locales clean)`);
