import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { encryptedId }: { encryptedId: string },
) {
  return NextResponse.json({
    encryptedId,
  });
}
