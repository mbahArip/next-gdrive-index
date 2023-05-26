import { NextRequest, NextResponse } from "next/server";

import createErrorPayload from "utils/apiHelper/createErrorPayload";
import getSearchParams from "utils/apiHelper/getSearchParams";
import shortEncryption from "utils/encryptionHelper/shortEncryption";
import ExtendedError from "utils/generalHelper/extendedError";

import { Constant } from "types/general/constant";

export function GET(request: NextRequest) {
  const _start = Date.now();

  try {
    const { text } = getSearchParams(request.url, ["text"]);

    if (!text) {
      throw new ExtendedError(
        Constant.apiBadRequest,
        400,
        "bad_request",
        "Missing required parameter: text",
      );
    }

    const decryptedText = shortEncryption.decrypt(text);

    return NextResponse.json(
      { text: decryptedText },
      { status: 200 },
    );
  } catch (error: any) {
    const payload = createErrorPayload(
      error,
      "GET /api/help/encrypt",
      _start,
    );

    return NextResponse.json(payload, {
      status: payload.code,
    });
  }
}

export function POST(request: NextRequest) {
  const _start = Date.now();

  try {
    const { text } = getSearchParams(request.url, ["text"]);

    if (!text) {
      throw new ExtendedError(
        Constant.apiBadRequest,
        400,
        "bad_request",
        "Missing required parameter: text",
      );
    }

    const encryptedText = shortEncryption.encrypt(text);

    return NextResponse.json(
      { text: encryptedText },
      { status: 200 },
    );
  } catch (error: any) {
    const payload = createErrorPayload(
      error,
      "GET /api/help/encrypt",
      _start,
    );

    return NextResponse.json(payload, {
      status: payload.code,
    });
  }
}
