#!/usr/bin/env node
/**
 * Fail if any U+2014 em dash appears in the Artemis site
 * (excludes villa-olivia-nextjs).
 */
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const emDash = "\u2014";

let output = "";
try {
  output = execFileSync(
    "rg",
    [
      "-n",
      emDash,
      "--glob",
      "!villa-olivia-nextjs/**",
      "--glob",
      "!node_modules/**",
      "--glob",
      "!.next/**",
      "--glob",
      "!.git/**",
      ".",
    ],
    { cwd: root, encoding: "utf8" },
  );
} catch (err) {
  // rg exit 1 = no matches
  if (err.status === 1) {
    console.log("lint:emdash OK (no em dashes)");
    process.exit(0);
  }
  console.error(err.stderr || err.message);
  process.exit(err.status ?? 1);
}

if (output.trim()) {
  console.error(`Em dashes (U+2014) are banned. Found:\n`);
  console.error(output);
  console.error("Rewrite with commas, periods, or colons. See AGENTS.md.");
  process.exit(1);
}

console.log("lint:emdash OK (no em dashes)");
