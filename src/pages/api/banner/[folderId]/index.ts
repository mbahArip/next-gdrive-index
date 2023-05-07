import initMiddleware from "utils/apiMiddleware";
import { NextApiRequest, NextApiResponse } from "next";
import { BannerResponse, ErrorResponse } from "types/googleapis";
import { ExtendedError } from "utils/driveHelper";
import driveClient from "utils/driveClient";
import { urlEncrypt } from "utils/encryptionHelper";

export default initMiddleware(async function handler(
  request: NextApiRequest,
  response: NextApiResponse<BannerResponse | ErrorResponse>,
) {
  const _start = Date.now();

  try {
    const { folderId } = request.query;

    const [name, partialId] = (folderId as string).split(":");

    if (!name || !partialId || partialId.length !== 8) {
      throw new ExtendedError(
        "Can't resolve name and id provided.",
        400,
        "invalidId",
      );
    }

    const payload: BannerResponse = {
      success: true,
      timestamp: new Date().toISOString(),
      responseTime: Date.now() - _start,
    };

    const findFolder = await driveClient.files.list({
      q: `name = '${name}' and trashed = false and 'me' in owners`,
      fields: "files(id, name, mimeType)",
    });
    const folder = findFolder.data.files?.find(
      (file) =>
        file.name === decodeURIComponent(name) &&
        (file.id as string).startsWith(partialId),
    );
    if (!folder) {
      throw new ExtendedError("Folder not found.", 404, "notFound");
    }

    const listFiles = await driveClient.files.list({
      q: `'${folder.id}' in parents and trashed = false and 'me' in owners`,
      fields: "files(id, name, mimeType)",
    });

    const banner = listFiles.data.files?.filter((file) =>
      file.name?.startsWith(".banner"),
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
