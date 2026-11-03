import { buildRobotsTxt, ROBOTS_HEADERS } from "@/lib/seo-parity/robots-parity";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

/**
 * Same group structure as discovercyclades.gr/robots.txt; see robots-parity.ts.
 *
 * /api/ is POST-only (booking, chat, WhatsApp) and has nothing to index. The
 * prefilled /book?vehicle=... variants stay crawlable on purpose: they carry
 * noindex, and a crawler has to fetch them to see it.
 */
export function GET() {
  const body = buildRobotsTxt({
    name: "Artemis Rental",
    origin: SITE_URL,
    disallow: ["/api/"],
    sitemaps: [`${SITE_URL}/sitemap.xml`],
  });
  return new Response(body, { headers: ROBOTS_HEADERS });
}
