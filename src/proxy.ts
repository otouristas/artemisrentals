import createMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";
import { routing } from "./i18n/routing";

const handleI18n = createMiddleware(routing);

/** Next.js 16+ file convention (`proxy.ts`). */
export function proxy(request: NextRequest) {
  return handleI18n(request);
}

export default proxy;

export const config = {
  matcher: [
    "/",
    "/(en|el|it|fr|de|sv|nl)/:path*",
    "/((?!api|_next|_vercel|.*\\..*).*)",
  ],
};
