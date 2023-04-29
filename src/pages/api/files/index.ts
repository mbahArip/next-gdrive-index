import { NextApiRequest, NextApiResponse } from "next";
import drive from "@utils/driveClient";
import config from "@/config/site.config";
import { ErrorResponse, FilesResponse } from "@/types/googleapis";
import { urlEncrypt } from "@/utils/encryptionHelper";
import { ExtendedError } from "@/types/default";
import apiConfig from "@/config/api.config";
import { hiddenFiles } from "@/utils/driveHelper";

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse,
) {
  const _start = Date.now();

  try {
    const { pageToken } = request.query;

    const query = [
      `'${config.files.rootFolder}' in parents`,
      "trashed = false",
      "'me' in owners",
    ];
    const fetchFolderContents = await drive.files.list({
      q: `${query.join(" and ")}`,
      fields:
        "files(id, name, mimeType, thumbnailLink, fileExtension, createdTime, modifiedTime, size, videoMediaMetadata), nextPageToken",
      orderBy: "folder, name asc, createdTime",
      pageSize: apiConfig.files.itemsPerPage,
      pageToken: (pageToken as string) || undefined,
    });

    const readmeFile = fetchFolderContents.data.files?.find(
      (file) => file.name === ".readme.md",
    );
    const folderList =
      fetchFolderContents.data.files?.filter(
        (item) => item.mimeType === "application/vnd.google-apps.folder",
      ) || [];
    const fileList =
      fetchFolderContents.data.files?.filter(
        (item) =>
          item.mimeType !== "application/vnd.google-apps.folder" &&
          !hiddenFiles.includes(item.name as string),
      ) || [];
    let readmeContents: string = "";
    if (readmeFile) {
      const fetchReadmeContents = await drive.files.get({
        fileId: readmeFile.id as string,
        alt: "media",
      });
      readmeContents = fetchReadmeContents.data as string;
    }

    const _end = Date.now();
    const payload: FilesResponse = {
      success: true,
      timestamp: new Date().toISOString(),
      responseTime: _end - _start,
      folders: folderList,
      files: fileList,
      readmeContents,
      nextPageToken = fetchFolderContents.data.nextPageToken || undefined
    };

    return response
      .status(200)
      .setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate")
      .json(payload);
  } catch (error: any) {
    const _end = Date.now();
    const payload: ErrorResponse = {
      success: false,
      timestamp: new Date().toISOString(),
      responseTime: _end - _start,
      code: error.code || 500,
      errors: {
        message: error.errors?.[0].message || error.message || "Unknown error",
        reason: error.errors?.[0].reason || error.cause || "internalError",
      },
    };

    return response.status(payload.code || 500).json(payload);
  }
}
