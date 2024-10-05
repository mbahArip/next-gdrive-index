import { NextRequest, NextResponse } from "next/server";

import { encryptData } from "~/utils/encryptionHelper";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const sp = new URL(request.nextUrl).searchParams;
    const query = sp.get("q");
    const key = sp.get("key");
    if (!query) return new NextResponse("Add query parameter 'q' with the value to encrypt", { status: 400 });

    const encrypted = await encryptData(query, key || process.env.ENCRYPTION_KEY);

    return NextResponse.json(
      {
        message: key ? "Encrypted with provided key" : "Encrypted with environment key",
        value: encrypted,
        key,
      },
      { status: 200 },
    );
  } catch (error) {
    const e = error as Error;
    console.error(e);
    return new Response(e.message, { status: 500 });
  }
}
