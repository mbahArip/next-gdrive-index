import apiConfig from "config/api.config";
import { NextApiRequest, NextApiResponse } from "next";
import { ErrorResponse, SearchResponse } from "types/googleapis";
import driveClient from "utils/driveClient";
import { urlEncrypt } from "utils/encryptionHelper";
import { hiddenFiles } from "utils/driveHelper";

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse<SearchResponse | ErrorResponse>,
) {
  const _start = Date.now();

  try {
    const { q } = request.query;

    if (!q) {
      return response.status(200).json({
        success: true,
        timestamp: new Date().toISOString(),
        responseTime: Date.now() - _start,
        files: [],
      });
    }

    const searchFile = await driveClient.files.list({
      q: `name contains '${q}' and 'me' in owners and trashed = false`,
      fields:
        "files(id, name, mimeType, thumbnailLink, fileExtension, createdTime, modifiedTime, size)",
      pageSize: apiConfig.files.itemsPerPage,
      orderBy: "modifiedTime desc",
    });

    const payload: SearchResponse = {
      success: true,
      timestamp: new Date().toISOString(),
      responseTime: Date.now() - _start,
      files:
        searchFile.data.files
          ?.filter(
            (item) =>
              !hiddenFiles.includes(item.name as string) &&
              (!item.mimeType?.startsWith("application/vnd.google-apps") ||
                item.mimeType === "application/vnd.google-apps.folder"),
          )
          .map((item) => ({
            ...item,
            id: urlEncrypt(item.id as string),
          })) || [],
    };

    return response
      .status(200)
      .setHeader("Cache-Control", apiConfig.cache)
      .json(payload);
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
}
