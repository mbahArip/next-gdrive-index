import { BannerResponse, ErrorResponse } from "types/googleapis";
import { NextApiRequest, NextApiResponse } from "next";
import initMiddleware from "utils/apiMiddleware";
import apiConfig from "config/api.config";
import driveClient from "utils/driveClient";
import { urlEncrypt } from "utils/encryptionHelper";

export default initMiddleware(async function handler(
  request: NextApiRequest,
  response: NextApiResponse<BannerResponse | ErrorResponse>,
) {
  const _start = Date.now();

  try {
    const query: string[] = [
      "name contains '.banner'",
      `parents = '${apiConfig.files.rootFolder}'`,
      "trashed = false",
      "'me' in owners",
    ];
    const getRootBanner = await driveClient.files.list({
      q: query.join(" and "),
      fields: "files(id, name, mimeType)",
    });

    const payload: BannerResponse = {
      success: true,
      timestamp: new Date().toISOString(),
      responseTime: Date.now() - _start,
    };

    const banner = getRootBanner.data.files?.filter((item) =>
      item.name?.startsWith(".banner"),
    )[0];
    if (!banner || !banner.mimeType?.startsWith("image")) {
      payload.success = false;
      return response.status(200).json(payload);
    }

    payload.banner = {
      id: urlEncrypt(banner.id as string),
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
        message: error.errors?.[0].message || error.message || "Unknown error",
        reason: error.errors?.[0].reason || error.cause || "internalError",
      },
    };

    return response.status(payload.code || 500).json(payload);
  }
});
