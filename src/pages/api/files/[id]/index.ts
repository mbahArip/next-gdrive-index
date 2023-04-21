import {
  ErrorResponse,
  FileResponse,
  FilesResponse,
  TFileParent,
} from "@/types/googleapis";
import drive from "@/utils/driveClient";
import { buildQuery } from "@/utils/driveHelper";
import { NextApiRequest, NextApiResponse } from "next";
import config from "@config/site.config";

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse<FilesResponse | FileResponse | ErrorResponse>,
) {
  try {
    const { id } = request.query;

    const parentsArray: TFileParent[] = [];

    const fetchFile = await drive.files.get({
      fileId: id as string,
      fields:
        "id, name, mimeType, parents, thumbnailLink, fileExtension, createdTime, modifiedTime, size, imageMediaMetadata, videoMediaMetadata, exportLinks",
      // "*",
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
      if (fetchParents.data.id === config.files.rootFolder) break;
      parents = fetchParents.data.parents || [];
      if (!parents.length) break;

      parentsArray.push({
        id: fetchParents.data.id as string,
        name: fetchParents.data.name as string,
      });
    }

    // Check for password file
    // Password checking takes too long.
    // Try to find a better way or just keep this as it is.
    const passwordQuery = [
      "name = '.password'",
      "'me' in owners",
      "trashed = false",
    ];
    const fetchPassword = await drive.files.list({
      q: passwordQuery.join(" and "),
      fields: "files(id, name, parents)",
      pageSize: 1000,
    });
    const passwordFile = fetchPassword.data.files?.find((file) => {
      if (file.parents?.[0] === id) return true;
      return parentsArray.some((parent) => parent.id === file.parents?.[0]);
    });

    if (passwordFile) {
      //   const {authorization} = request.headers;
      //   const userPassword = authorization?.split(" ")[1];
      //   For dev purpose, get password from query
      const userPassword = request.query.password as string;
      if (!userPassword)
        return response.status(401).json({
          success: false,
          timestamp: new Date().toISOString(),
          passwordRequired: true,
          code: 401,
          errors: {
            message: "Unauthorized",
            reason: "passwordRequired",
          },
        });

      const getPassword = await drive.files.get(
        {
          fileId: passwordFile.id as string,
          alt: "media",
        },
        { responseType: "text" },
      );

      if (getPassword.data !== userPassword)
        return response.status(401).json({
          success: false,
          timestamp: new Date().toISOString(),
          passwordRequired: true,
          code: 401,
          errors: {
            message: "Unauthorized",
            reason: "passwordWrong",
          },
        });
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
        passwordRequired: !!passwordFile,
        passwordValidated: true,
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
      passwordRequired: !!passwordFile,
      passwordValidated: true,
      file: fetchFile.data,
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
