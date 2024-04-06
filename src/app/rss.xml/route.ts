import { NextResponse } from "next/server";

/**
 * We don't actually need RSS
 * But console always show "Path not found" error on rss.xml
 * since we are using [...rest] route
 *
 * So this is just a empty route to prevent that
 */

export async function GET() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Content-Type": "text/xml",
    },
  });
}
