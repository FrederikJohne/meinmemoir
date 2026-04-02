import createMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";
import { updateSession } from "./lib/supabase/middleware";

const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip i18n for magic link recording pages and API routes
  if (pathname.startsWith("/r/") || pathname.startsWith("/listen/") || pathname.startsWith("/api/")) {
    return updateSession(request);
  }

  // Handle Supabase auth session refresh, then i18n
  const sessionResponse = await updateSession(request);
  if (sessionResponse.headers.get("location")) {
    return sessionResponse;
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
