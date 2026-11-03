import { buildLlmsTxt, LLMS_HEADERS } from "@/lib/seo-parity/llms-parity";

export const dynamic = "force-static";

/** Generated from site data; see llms-parity.ts. Also served at /.well-known/llms.txt. */
export function GET() {
  return new Response(buildLlmsTxt(), { headers: LLMS_HEADERS });
}
