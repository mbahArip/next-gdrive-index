import {
  ErrorResponse,
  FileResponse,
  FilesResponse,
  TFileParent,
} from "@/types/googleapis";
import drive from "@/utils/driveClient";
import { buildQuery, validateProtected } from "@/utils/driveHelper";
import { NextApiRequest, NextApiResponse } from "next";
import config from "@config/site.config";

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse<FilesResponse | FileResponse | ErrorResponse>,
) {
  try {
    const { id } = request.query;
    const { authorization } = request.headers;
    const hash = authorization?.split(" ")[1] || null;

    const parentsArray: TFileParent[] = [];

    const fetchFile = await drive.files.get({
      fileId: id as string,
      fields:
        "id, name, mimeType, parents, thumbnailLink, fileExtension, createdTime, modifiedTime, size, imageMediaMetadata, videoMediaMetadata, exportLinks",
    });

    // Fetch parents
    if (fetchFile.data.mimeType === "application/vnd.google-apps.folder") {
      parentsArray.push({
        id: fetchFile.data.id as string,
        name: fetchFile.data.name as string,
      });
    }
    let parents = fetchFile.data.parents || [];
    while (parents.length > 0) {
      const fetchParents = await drive.files.get({
        fileId: parents[0],
        fields: "id, name, parents",
      });
      if (fetchParents.data.id === config.files.rootFolder) {
        parentsArray.push({
          id: fetchParents.data.id as string,
          name: fetchParents.data.name as string,
        });
        break;
      }
      parents = fetchParents.data.parents || [];
      if (!parents.length) break;

      parentsArray.push({
        id: fetchParents.data.id as string,
        name: fetchParents.data.name as string,
      });
    }

    // Check for password file
    const validatePassword = await validateProtected(
      parentsArray || (id as string),
      hash as string,
    );
    if (validatePassword.isProtected && !validatePassword.valid) {
      return response.status(200).json({
        success: true,
        timestamp: new Date().toISOString(),
        passwordRequired: true,
        passwordValidated: false,
        protectedId: validatePassword.protectedId,
        parents: [],
        file: {},
      } as FileResponse);
    }

    // Check if file is folder
    if (fetchFile.data.mimeType === "application/vnd.google-apps.folder") {
      const { pageToken } = request.query;

      const fetchFiles = await drive.files.list({
        q: buildQuery({
          id: id as string,
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
          id: id as string,
          extraQuery: ["mimeType = 'application/vnd.google-apps.folder'"],
        }),
        fields:
          "files(id, name, mimeType, thumbnailLink, fileExtension, createdTime, modifiedTime, size, videoMediaMetadata), nextPageToken",
        orderBy: "folder, name asc",
        pageSize: config.files.itemsPerPage,
        pageToken: (pageToken as string) || undefined,
      });

      const checkReadme = await drive.files.list({
        q: buildQuery({ id: id as string, extraQuery: ["name = 'readme.md'"] }),
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
        parents: parentsArray,
        passwordRequired: validatePassword.isProtected,
        passwordValidated: validatePassword.valid,
        protectedId: validatePassword.protectedId,
        folders,
        files,
        nextPageToken: fetchFiles.data.nextPageToken || undefined,
        readmeExists: !!checkReadme.data.files?.length,
      };

      return response.status(200).json(payload);
    }

    const payload: FileResponse = {
      success: true,
      timestamp: new Date().toISOString(),
      parents: parentsArray,
      passwordRequired: validatePassword.isProtected,
      passwordValidated: validatePassword.valid,
      protectedId: validatePassword.protectedId,
      file: fetchFile.data,
    };

    return response.status(200).json(payload);
  } catch (error: any) {
    if (error satisfies ErrorResponse) {
      const payload: ErrorResponse = {
        success: false,
        timestamp: new Date().toISOString(),
        code: error.code || 500,
        errors: {
          message:
            error.errors?.[0].message || error.message || "Unknown error",
          reason: error.errors?.[0].reason || error.cause || "internalError",
        },
      };

      return response.status(error.code).json(payload);
    }

    const payload: ErrorResponse = {
      success: false,
      timestamp: new Date().toISOString(),
      code: error.code || 500,
      errors: {
        message: error.message || "Unknown error",
        reason: error.cause || "internalError",
      },
    };

    return response.status(500).json(payload);
  }
}
