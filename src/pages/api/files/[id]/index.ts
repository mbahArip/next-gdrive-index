//Accepted id is Name#PartialID

import { NextApiRequest, NextApiResponse } from "next";
import { ErrorResponse, FileResponse, FilesResponse } from "types/googleapis";
import { ExtendedError, hiddenFiles } from "utils/driveHelper";
import driveClient from "utils/driveClient";
import apiConfig from "config/api.config";
import initMiddleware from "utils/apiMiddleware";
import { urlEncrypt } from "utils/encryptionHelper";

export default initMiddleware(async function handler(
  request: NextApiRequest,
  response: NextApiResponse,
) {
  const _start = Date.now();

  try {
    const { id, pageToken } = request.query;

    const [name, partialId] = (id as string).split(":");

    if (!name || !partialId || partialId.length !== 8) {
      throw new ExtendedError(
        "Can't resolve name and id provided.",
        400,
        "invalidId",
      );
    }

    const searchForFile = await driveClient.files.list({
      q: `name contains '${name}' and trashed = false and 'me' in owners`,
      fields:
        "files(id, name, mimeType, thumbnailLink, fileExtension, createdTime, modifiedTime, size, imageMediaMetadata, videoMediaMetadata, webContentLink)",
    });

    const file = searchForFile.data.files?.find(
      (file) =>
        file.name === decodeURIComponent(name) &&
        (file.id as string).startsWith(partialId),
    );
    if (!file) {
      throw new ExtendedError("File not found.", 404, "notFound");
    }

    response.setHeader("Cache-Control", apiConfig.cache);

    if (file.mimeType !== "application/vnd.google-apps.folder") {
      const payload: FileResponse = {
        success: true,
        timestamp: new Date().toISOString(),
        responseTime: Date.now() - _start,
        file: {
          ...file,
          id: urlEncrypt(file.id as string),
          webContentLink: file.webContentLink
            ? urlEncrypt(file.webContentLink)
            : undefined,
        },
      };

      return response.status(200).json(payload);
    }

    const query = [
      `'${file.id}' in parents`,
      "trashed = false",
      "'me' in owners",
    ];
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
    // Get only folder, since we order the folder to be first, we can just get all the folder first
    const folderList =
      fetchFolderContents.data.files
        ?.filter(
          (item) => item.mimeType === "application/vnd.google-apps.folder",
        )
        .map((item) => ({
          ...item,
          id: urlEncrypt(item.id as string),
        })) || [];
    // Filter the files, excluding every google apps files and hidden files (.password and .readme.md)
    // .password currently not used, but will probably be used in the future
    const fileList =
      fetchFolderContents.data.files
        ?.filter(
          (item) =>
            !item.mimeType?.startsWith("application/vnd.google-apps") &&
            !hiddenFiles.includes(item.name as string),
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
      isReadmeExists: isReadmeExists,
      folders: folderList,
      files: fileList,
      nextPageToken: fetchFolderContents.data.nextPageToken || undefined,
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
