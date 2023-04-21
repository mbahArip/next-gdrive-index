import { ErrorResponse, FilesResponse } from "@/types/googleapis";
import drive from "@/utils/driveClient";
import { buildQuery } from "@/utils/driveHelper";
import { NextApiRequest, NextApiResponse } from "next";
import config from "@config/site.config";

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse<FilesResponse | ErrorResponse>,
) {
  try {
    const { pageToken } = request.query;

    const fetchFiles = await drive.files.list({
      q: buildQuery({
        extraQuery: ["not mimeType contains 'application/vnd.google-apps'"],
      }),
      fields:
        "files(id, name, mimeType, thumbnailLink, fileExtension, createdTime, modifiedTime, size, videoMediaMetadata), nextPageToken",
      orderBy: "folder, name asc",
      pageSize: config.files.itemsPerPage,
      pageToken: (pageToken as string) || undefined,
    });
    const fetchFolders = await drive.files.list({
      q: buildQuery({
        extraQuery: ["mimeType = 'application/vnd.google-apps.folder'"],
      }),
      fields:
        "files(id, name, mimeType, thumbnailLink, fileExtension, createdTime, modifiedTime, size, videoMediaMetadata), nextPageToken",
      orderBy: "folder, name asc",
      pageSize: config.files.itemsPerPage,
      pageToken: (pageToken as string) || undefined,
    });
    const checkReadme = await drive.files.list({
      q: buildQuery({ extraQuery: ["name = 'readme.md'"] }),
    });

    const folders =
      fetchFolders.data.files?.filter(
        (file) => file.mimeType === "application/vnd.google-apps.folder",
      ) || [];
    const files =
      fetchFiles.data.files?.filter(
        (file) => file.mimeType !== "application/vnd.google-apps.folder",
      ) || [];

    const payload: FilesResponse = {
      success: true,
      timestamp: new Date().toISOString(),
      folders,
      files,
      nextPageToken: fetchFiles.data.nextPageToken || undefined,
      readmeExists: !!checkReadme.data.files?.length,
    };

    return response.status(200).json(payload);
  } catch (error: any) {
    if (error satisfies ErrorResponse) {
      const payload: ErrorResponse = {
        success: false,
        timestamp: new Date().toISOString(),
        code: error.code,
        errors: {
          message: error.errors[0].message,
          reason: error.errors[0].reason,
        },
      };

      return response.status(error.code).json(payload);
    }

    const payload: ErrorResponse = {
      success: false,
      timestamp: new Date().toISOString(),
      code: 500,
      errors: {
        message: error.message,
        reason: "internalError",
      },
    };

    return response.status(500).json(payload);
  }
}
