import { execSync } from "node:child_process";

/**
 * Cloudflare Workers Builds runs `pnpm install` then `npx wrangler deploy`.
 * Wrangler then calls `opennextjs-cloudflare deploy`, which expects a prior
 * OpenNext build. Build during install when running on Workers CI.
 */
const onWorkersCi =
  process.env.WORKERS_CI === "1" ||
  process.env.WORKERS_CI === "true" ||
  process.env.CF_PAGES === "1";

if (!onWorkersCi) {
  process.exit(0);
}

console.log("[workers-ci] Building OpenNext bundle for Cloudflare Workers…");
execSync("pnpm exec opennextjs-cloudflare build", {
  stdio: "inherit",
  env: process.env,
});
