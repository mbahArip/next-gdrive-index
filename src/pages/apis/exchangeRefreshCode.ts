import { NextApiRequest, NextApiResponse } from "next";
import { ErrorResponse } from "types/googleapis";
import { ExtendedError } from "utils/driveHelper";
import {
  decrypt,
  encrypt,
  shortDecrypt,
  shortEncrypt,
} from "utils/encryptionHelper";
import { OAuth2Client } from "google-auth-library";
import apiConfig from "config/api.config";

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse,
) {
  const _start = Date.now();
  try {
    const { code } = request.body;
    if (!code)
      throw new ExtendedError(
        "Missing code",
        400,
        "missingCode",
      );

    const oauth2Client = new OAuth2Client(
      "126409166174-l0f9hdblsrmhkt9jeue9m8o93skfs1sr.apps.googleusercontent.com",
      "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",
      "http://localhost",
    );
    oauth2Client.setCredentials({
      refresh_token: code,
    });

    const tokens = await oauth2Client.getAccessToken();

    return response.status(200).json(tokens);
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

    return response
      .status(payload.code || 500)
      .json(payload);
  }
}
