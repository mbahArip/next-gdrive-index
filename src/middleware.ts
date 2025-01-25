import { type NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const headers = new Headers(req.headers);
  const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval';
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data:;
  font-src 'self';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'self' *;
  block-all-mixed-content;
  upgrade-insecure-requests;
  `
    .replace(/\s+/g, " ")
    .trim();
  if (pathname.startsWith("/ngdi-internal/embed/")) {
    headers.set("Content-Security-Policy", cspHeader);
    headers.set("X-Frame-Options", "ALLOWALL");
    headers.set("X-Content-Type-Options", "nosniff");
    headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  }

  const response = NextResponse.next({
    request: {
      headers,
    },
  });
  response.headers.set("X-Pathname", req.nextUrl.pathname);
  if (pathname.startsWith("/ngdi-internal/embed/")) {
    response.headers.set("Content-Security-Policy", cspHeader);
    return response;
  }

  // Skip the middleware if the pathname is the root
  if (pathname === "/") return response;

  // Get search params
  const searchParams = new URLSearchParams(req.nextUrl.search);
  // Check if it's has raw query
  const hasRawQuery = searchParams.get("raw") === "1";

  // If it's has raw query, redirect it to `/api/raw?url=${pathname}`
  if (hasRawQuery) {
    const rawUrl = `/api/raw?url=${encodeURIComponent(pathname)}`;
    return new NextResponse(null, {
      status: 307,
      headers: {
        Location: new URL(rawUrl, req.nextUrl.origin).toString(),
      },
    });
  }

  return response;
}
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)"],
};
