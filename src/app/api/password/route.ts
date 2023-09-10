import { NextRequest, NextResponse } from "next/server";

import { decryptData } from "utils/encryptionHelper/hash";
import ExtendedError from "utils/extendedError";

import { ErrorResponse } from "types/api/response";
import { Constant } from "types/constant";

export async function GET(request: NextRequest) {
  const reqStart = Date.now();

  try {
    const cookies = request.cookies.get(
      Constant.cookies_SitePassword,
    );
    if (!cookies)
      throw new ExtendedError(
        "No cookies found",
        400,
        "Site password not found",
      );
    const rawToken = decryptData(cookies.value);
    const token = JSON.parse(rawToken);

    return NextResponse.json(
      {
        password: token,
      },
      {
        status: 200,
      },
    );
  } catch (error: any) {
    const res: ErrorResponse = {
      timestamp: Date.now(),
      responseTime: Date.now() - reqStart,
      error: {
        code: error.code || 500,
        message: error.message,
        reason: error.errors?.[0].reason,
      },
    };
    return NextResponse.json(res, {
      status: error.code || 500,
    });
  }
}
