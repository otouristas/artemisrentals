/**
 * robots.txt builder, same structure as discovercyclades.gr/robots.txt.
 *
 * RFC 9309: a crawler obeys only the most specific group that names it, so the
 * named bots sit INSIDE the two groups (one per crawl-delay policy) and every
 * group repeats the same Disallow list. Separate "Allow: /"-only groups would
 * silently drop the Disallows for those bots.
 *
 * Group 1: default (*), AI crawlers and Bingbot. Crawl-delay: 1.
 * Group 2: Googlebot, Googlebot-Image and social link-preview bots. No delay.
 */

export const GROUP_1_AGENTS = [
  "*",
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",
  "Google-Extended",
  "Anthropic-AI",
  "Claude-Web",
  "ClaudeBot",
  "CCBot",
  "PerplexityBot",
  "Perplexity-User",
  "Applebot-Extended",
  "Meta-ExternalAgent",
  "MistralAI-User",
  "DuckAssistBot",
  "Amazonbot",
  "Bytespider",
  "Bingbot",
] as const;

export const GROUP_2_AGENTS = [
  "Googlebot",
  "Googlebot-Image",
  "facebookexternalhit",
  "Twitterbot",
  "LinkedInBot",
  "Slackbot",
  "Discordbot",
  "WhatsApp",
  "TelegramBot",
  "Pinterestbot",
] as const;

export type RobotsParityOptions = {
  /** Brand name for the header comment. */
  name: string;
  /** Canonical origin, no trailing slash. */
  origin: string;
  /** Site-specific Disallow rules, repeated in every group. */
  disallow: string[];
  /** Extra Allow rules (static asset folders, OG image routes, feeds...). */
  allow?: string[];
  /** Absolute sitemap URLs. */
  sitemaps: string[];
  /** Agents that get their own "Disallow: /" group (kept from the old policy). */
  blocked?: string[];
};

const BASE_ALLOW = ["/", "/_next/static/", "/_next/image", "/llms.txt", "/llms-full.txt"];

export function buildRobotsTxt(o: RobotsParityOptions): string {
  const allow = Array.from(new Set([...BASE_ALLOW, ...(o.allow ?? [])]));
  const rules = (delay: boolean) => [
    ...allow.map((p) => `Allow: ${p}`),
    ...o.disallow.map((p) => `Disallow: ${p}`),
    ...(delay ? ["Crawl-delay: 1"] : []),
  ];

  const lines: string[] = [
    `# ${o.name} - robots.txt`,
    `# ${o.origin}`,
    "# Standard: RFC 9309 (https://www.rfc-editor.org/rfc/rfc9309)",
    "",
    "# AI content preferences (draft Content-Signal, see https://contentsignals.org/).",
    "# Not a standard robots.txt directive, so it is kept as a comment for humans and",
    "# for crawlers that read the draft. This site WANTS to be found and cited by AI:",
    "#   search=yes    — allow indexing for traditional search results",
    "#   ai-input=yes  — allow use as grounding / live input and citation in AI answers",
    "#   ai-train=yes  — allow use of this content to train AI models",
    "# Content-Signal: search=yes, ai-input=yes, ai-train=yes",
    "",
    "# LLMs.txt files for AI crawlers (https://llmstxt.org/):",
    `#   ${o.origin}/llms.txt`,
    `#   ${o.origin}/llms-full.txt`,
    "",
    "# GROUP 1: default rules + AI crawlers + Bingbot (Crawl-delay: 1)",
    ...GROUP_1_AGENTS.map((a) => `User-agent: ${a}`),
    ...rules(true),
    "",
    "# GROUP 2: Google search + social link-preview bots (same rules, no crawl-delay)",
    ...GROUP_2_AGENTS.map((a) => `User-agent: ${a}`),
    ...rules(false),
    "",
  ];

  for (const agent of o.blocked ?? []) {
    lines.push(`User-agent: ${agent}`, "Disallow: /", "");
  }

  lines.push(...o.sitemaps.map((s) => `Sitemap: ${s}`), "");
  return lines.join("\n");
}

export const ROBOTS_HEADERS = {
  "content-type": "text/plain; charset=utf-8",
  "cache-control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
};
