#!/usr/bin/env node
/**
 * Fail if any U+2014 em dash appears in the Artemis site (excludes villa-olivia-nextjs).
 *
 * Uses a plain Node walk rather than shelling out to ripgrep: the previous version
 * threw ENOENT and aborted the whole `lint` script on machines without `rg`
 * installed, so the check effectively never ran and em dashes reached the repo.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
// Built from a code point so this file does not match itself.
const EM_DASH = String.fromCharCode(0x2014);

const SKIP_DIRS = new Set([
  "node_modules",
  ".next",
  ".git",
  ".open-next",
  ".wrangler",
  ".vercel",
  ".firecrawl",
  "villa-olivia-nextjs",
]);

const TEXT_EXT = new Set([
  ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs",
  ".json", ".md", ".mdx", ".css", ".html", ".txt", ".yml", ".yaml",
]);

/** @type {{file: string, line: number, text: string}[]} */
const hits = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".") && entry.name !== ".well-known") {
      if (SKIP_DIRS.has(entry.name)) continue;
    }
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      walk(full);
      continue;
    }
    if (!TEXT_EXT.has(path.extname(entry.name))) continue;

    const content = fs.readFileSync(full, "utf8");
    if (!content.includes(EM_DASH)) continue;
    content.split("\n").forEach((line, i) => {
      if (line.includes(EM_DASH)) {
        hits.push({ file: path.relative(root, full), line: i + 1, text: line.trim() });
      }
    });
  }
}

walk(root);

if (hits.length > 0) {
  console.error("Em dashes (U+2014) are banned. Found:\n");
  for (const hit of hits) {
    console.error(`  ${hit.file}:${hit.line}: ${hit.text.slice(0, 140)}`);
  }
  console.error("\nRewrite with commas, periods, or colons. See AGENTS.md.");
  process.exit(1);
}

console.log("lint:emdash OK (no em dashes)");
