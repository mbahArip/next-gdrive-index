import { ErrorResponse, FileResponse, TFileParent } from "@/types/googleapis";
import drive from "@utils/driveClient";
import { NextApiRequest, NextApiResponse } from "next";
import config from "@config/site.config";
import { validateProtected } from "@utils/driveHelper";
import { ExtendedError } from "@/types/default";
import { decrypt } from "@utils/encryptionHelper";
import { verify } from "jsonwebtoken";
import { reverseString } from "@utils/hashHelper";

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse,
) {
  try {
    const { id, hash } = request.query;
    const { vector, data } = request.query;
    const { authorization } = request.headers;
    const headerHash = authorization?.split(" ")[1] || null;

    const fetchFileMetadata = await drive.files.get({
      fileId: id as string,
      fields: "id, name, mimeType, size, exportLinks, parents",
    });

    if (!config.files.allowDownloadProtectedWithoutAccess) {
      const parentsArray: TFileParent[] = [];

      let validHash = headerHash as string;
      if (hash) {
        validHash = reverseString(hash as string);
      }

      // Fetch parents
      if (
        fetchFileMetadata.data.mimeType === "application/vnd.google-apps.folder"
      ) {
        parentsArray.push({
          id: fetchFileMetadata.data.id as string,
          name: fetchFileMetadata.data.name as string,
        });
      }
      let parents = fetchFileMetadata.data.parents || [];
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
      const validatePassword = await validateProtected(parentsArray, validHash);
      if (validatePassword.isProtected && !validatePassword.valid) {
        return response.status(200).json({
          success: true,
          timestamp: new Date().toISOString(),
          passwordRequired: true,
          passwordValidated: false,
          parents: [],
          file: {},
        } as FileResponse);
      }
    }

    const { name, mimeType, size } = fetchFileMetadata.data;

    if (mimeType === "application/vnd.google-apps.folder") {
      const error = new Error("Folder cannot be downloaded") as ExtendedError;
      error.cause = "badRequest";
      error.code = 400;
      throw error;
    }

    response.setHeader(
      "Content-Disposition",
      `inline; filename=${encodeURIComponent(name as string)}`,
    );
    response.setHeader("Content-Type", mimeType || "application/octet-stream");
    response.setHeader("Content-Length", size || 0);

    const streamFile = await drive.files.get(
      {
        fileId: id as string,
        alt: "media",
      },
      {
        responseType: "stream",
      },
    );

    return response.send(streamFile.data);
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
