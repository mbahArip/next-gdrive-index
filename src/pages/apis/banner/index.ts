import {
  BannerResponse,
  ErrorResponse,
} from "types/googleapis";
import { NextApiRequest, NextApiResponse } from "next";
import initMiddleware from "utils/apiMiddleware";
import apiConfig from "config/api.config";
import driveClient from "utils/driveClient";
import { shortEncrypt } from "utils/encryptionHelper";

export default initMiddleware(async function handler(
  request: NextApiRequest,
  response: NextApiResponse<BannerResponse | ErrorResponse>,
) {
  const _start = Date.now();

  try {
    const payload: BannerResponse = {
      success: true,
      timestamp: new Date().toISOString(),
      responseTime: Date.now() - _start,
    };

    const findBanner = await driveClient.files.list({
      q: `name contains '.banner' and trashed = false and 'me' in owners and parents = '${apiConfig.files.rootFolder}'`,
      fields: "files(id, name, mimeType, parents)",
    });
    const banner = findBanner.data.files?.find((file) =>
      file.name?.startsWith(".banner"),
    );
    if (!banner) {
      payload.success = false;
      return response.status(200).json(payload);
    }

    payload.banner = {
      id: shortEncrypt(banner.id as string),
      name: banner.name as string,
    };

    return response.status(200).json(payload);
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
});
