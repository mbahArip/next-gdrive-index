import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import createErrorPayload from "utils/apiHelper/createErrorPayload";
import passwordHash from "utils/encryptionHelper/passwordHash";
import ExtendedError from "utils/generalHelper/extendedError";

import { API_Response } from "types/api";
import { ValidateFilePathResponse } from "types/api/path";
import { Constant } from "types/general/constant";

import apiConfig from "config/api.config";
import siteConfig from "config/site.config";

export async function GET(request: NextRequest) {
  const _start = Date.now();

  try {
    const masterKey = request.headers.get("x-gdrive-key");
    const validMasterKey = passwordHash.verify(
      masterKey || "",
      apiConfig.masterKey,
    );

    if (siteConfig.privateIndex && !validMasterKey) {
      const userPassword = cookies().get(
        `next-gdrive-password`,
      )?.value;
      if (!userPassword) {
        throw new ExtendedError(
          Constant.apiNotAuthorized,
          401,
          "unauthorized",
          `You need to provide password to access "root"`,
        );
      }

      const parsedUserPassword = JSON.parse(userPassword);
      const nearestFolderPassword =
        parsedUserPassword["root"];
      if (!nearestFolderPassword) {
        throw new ExtendedError(
          Constant.apiNotAuthorized,
          401,
          "unauthorized",
          `You need to provide password to access "root"`,
        );
      }

      if (
        !passwordHash.compare(
          siteConfig.indexPassword,
          nearestFolderPassword,
        )
      ) {
        throw new ExtendedError(
          Constant.apiNotAuthorized,
          401,
          "unauthorized",
          `The password you provided is incorrect`,
        );
      }
    }

    const payload: API_Response<ValidateFilePathResponse> =
      {
        success: true,
        timestamp: new Date().toISOString(),
        responseTime: Date.now() - _start,
        data: [],
      };

    return NextResponse.json(payload, {
      status: 200,
    });
  } catch (error: any) {
    const payload = createErrorPayload(
      error,
      "GET /api/validate",
      _start,
    );

    return new Response(JSON.stringify(payload), {
      status: payload.code,
    });
  }
}
