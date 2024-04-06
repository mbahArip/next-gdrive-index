import { NextRequest, NextResponse } from "next/server";

import { encryptData } from "~/utils/encryptionHelper/hash";

export async function GET(request: NextRequest) {
  try {
    const sp = new URL(request.nextUrl).searchParams;
    const query = sp.get("q");
    if (!query)
      return new NextResponse(
        "Add query parameter 'q' with the value to encrypt",
        { status: 400 },
      );

    const encrypted = await encryptData(query);

    return NextResponse.json(
      {
        value: encrypted,
      },
      { status: 200 },
    );
  } catch (error) {
    const e = error as Error;
    console.error(e);
    return new Response(e.message, { status: 500 });
  }
}
