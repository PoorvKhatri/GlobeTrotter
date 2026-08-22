import { NextResponse } from "next/server";
import { AUTH_COOKIE } from "@/lib/auth";

/**
 * Lightweight route protection. We only check for the presence of the auth
 * cookie here (Edge runtime can't run the Node crypto used by jsonwebtoken).
 * Real verification happens server-side in getCurrentUser() / API handlers.
 */
const PROTECTED = [
  "/dashboard",
  "/trips",
  "/cities",
  "/activities",
  "/calendar",
  "/community",
  "/profile",
  "/admin",
];

const AUTH_PAGES = ["/login", "/register"];

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const hasToken = Boolean(request.cookies.get(AUTH_COOKIE)?.value);

  const isProtected = PROTECTED.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
  const isAuthPage = AUTH_PAGES.includes(pathname);

  if (isProtected && !hasToken) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthPage && hasToken) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/trips/:path*",
    "/cities/:path*",
    "/activities/:path*",
    "/calendar/:path*",
    "/community/:path*",
    "/profile/:path*",
    "/admin/:path*",
    "/login",
    "/register",
  ],
};
