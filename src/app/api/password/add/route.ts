import { NextRequest, NextResponse } from "next/server";

import getSearchParams from "utils/apiHelper/getSearchParams";
import ExtendedError from "utils/extendedError";
import { addNewPassword } from "utils/passwordHelper";

import { ErrorResponse } from "types/api/response";
import { Constant } from "types/constant";

export async function GET(request: NextRequest) {
  const reqStart = Date.now();

  try {
    const { path, password } = getSearchParams(
      request.url,
      ["path", "password"],
    );
    if (!path || !password)
      throw new ExtendedError(
        "Missing parameters",
        400,
        "Path or password is missing",
      );

    const cookies = request.cookies.get(
      Constant.cookies_SitePassword,
    );
    if (!cookies)
      throw new ExtendedError(
        "No cookies found",
        400,
        "Site password not found",
      );
    const newPassword = addNewPassword(
      path!,
      password!,
      cookies.value,
      true,
    );

    return NextResponse.json(
      {
        newPassword: {
          path,
          password,
        },
      },
      {
        status: 200,
        headers: {
          "Set-Cookie": newPassword as string,
        },
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
