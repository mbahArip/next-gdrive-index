import { type NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const response = NextResponse.next();
  const pathname = req.nextUrl.pathname;

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
