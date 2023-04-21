import { ErrorResponse, TFileParent } from "@/types/googleapis";
import drive from "@utils/driveClient";
import { NextApiRequest, NextApiResponse } from "next";
import config from "@config/site.config";

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse,
) {
  try {
    const { id } = request.query;

    const fetchFileMetadata = await drive.files.get({
      fileId: id as string,
      fields: "id, name, mimeType, size, exportLinks, parents",
    });

    if (!config.files.allowDownloadProtectedFiles) {
      const parentsArray: TFileParent[] = [];

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
    }

    console.log("Serve file.");
    const { name, mimeType, size, exportLinks } = fetchFileMetadata.data;

    if (mimeType === "application/vnd.google-apps.folder") {
      const payload: ErrorResponse = {
        success: false,
        timestamp: new Date().toISOString(),
        code: 400,
        errors: {
          message: "Cannot view folder",
          reason: "badRequest",
        },
      };

      return response.status(400).json(payload);
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

    streamFile.data.on("error", (error: any) => {
      throw error;
    });
    streamFile.data.on("data", (chunk: Buffer) => {
      response.write(chunk);
    });
    streamFile.data.on("end", () => {
      response.end();
    });
    return response.status(200);
  } catch (error: any) {
    if (error satisfies ErrorResponse) {
      const payload: ErrorResponse = {
        success: false,
        timestamp: new Date().toISOString(),
        code: error.code,
        errors: {
          message: error.errors?.[0].message || error.message,
          reason: error.errors?.[0].reason || "internalError",
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
