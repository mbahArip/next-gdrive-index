import { NextResponse } from "next/server";
import { ErrorResponse } from "types/googleapis";
import passwordHash from "utils/encryptionHelper/passwordHash";

export async function GET() {
  const _start = Date.now();
  try {
    const hash = passwordHash.encode("mbaharip");

    return NextResponse.json(
      { hash },
      {
        status: 200,
      },
    );
  } catch (error: any) {
    const payload: ErrorResponse = {
      success: false,
      timestamp: new Date().toISOString(),
      responseTime: Date.now() - _start,
      code: error.code || 500,
      errors: {
        message:
          error.errors?.[0].message ||
          error.message ||
          "Unknown error",
        reason:
          error.errors?.[0].reason ||
          error.cause ||
          "internalError",
      },
    };

    return NextResponse.json(payload, {
      status: payload.code || 500,
    });
  }
}
