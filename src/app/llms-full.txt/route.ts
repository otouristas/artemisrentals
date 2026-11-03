import { buildLlmsFullTxt, LLMS_HEADERS } from "@/lib/seo-parity/llms-parity";

export const dynamic = "force-static";

/** Generated from site data; see llms-parity.ts. Also served at /.well-known/llms-full.txt. */
export function GET() {
  return new Response(buildLlmsFullTxt(), { headers: LLMS_HEADERS });
}
