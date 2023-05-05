import { NextApiRequest, NextApiResponse } from "next";
import driveClient from "utils/driveClient";
import apiConfig from "config/api.config";
import { hiddenFiles } from "utils/driveHelper";
import initMiddleware from "utils/apiMiddleware";
import { ErrorResponse, FilesResponse } from "types/googleapis";
import { urlEncrypt } from "utils/encryptionHelper";

export default initMiddleware(async function handler(
  request: NextApiRequest,
  response: NextApiResponse<FilesResponse | ErrorResponse>,
) {
  const _start = Date.now();

  try {
    const { pageToken } = request.query;

    const query = ["trashed = false", "'me' in owners"];
    if (apiConfig.files.rootFolder === "root") {
      query.push("parents = 'root'");
    } else {
      query.push(`parents = '${apiConfig.files.rootFolder}'`);
    }
    const fetchFolderContents = await driveClient.files.list({
      q: `${query.join(" and ")}`,
      fields:
        "files(id, name, mimeType, thumbnailLink, fileExtension, createdTime, modifiedTime, size, imageMediaMetadata, videoMediaMetadata, webContentLink), nextPageToken",
      orderBy: "folder, name asc, createdTime",
      pageSize: apiConfig.files.itemsPerPage,
      pageToken: (pageToken as string) || undefined,
    });

    const isReadmeExists = !!fetchFolderContents.data.files?.find(
      (file) => file.name === ".readme.md",
    );
    const folderList =
      fetchFolderContents.data.files
        ?.filter(
          (item) => item.mimeType === "application/vnd.google-apps.folder",
        )
        .map((item) => ({
          ...item,
          id: urlEncrypt(item.id as string),
        })) || [];
    const fileList =
      fetchFolderContents.data.files
        ?.filter(
          (item) =>
            !item.mimeType?.startsWith("application/vnd.google-apps") &&
            // !hiddenFiles.includes(item.name as string),
            !hiddenFiles.some((hiddenFile) =>
              item.name?.startsWith(hiddenFile),
            ),
        )
        .map((item) => ({
          ...item,
          id: urlEncrypt(item.id as string),
          webContentLink: item.webContentLink
            ? urlEncrypt(item.webContentLink)
            : undefined,
        })) || [];

    const payload: FilesResponse = {
      success: true,
      timestamp: new Date().toISOString(),
      responseTime: Date.now() - _start,
      folders: folderList,
      files: fileList,
      isReadmeExists: isReadmeExists,
      nextPageToken: fetchFolderContents.data.nextPageToken || undefined,
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
});
