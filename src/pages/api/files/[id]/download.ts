import { ErrorResponse } from "@/types/googleapis";
import drive from "@utils/driveClient";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse,
) {
  try {
    const { id } = request.query;

    const fetchFileMetadata = await drive.files.get({
      fileId: id as string,
      fields: "id, name, mimeType, size",
    });

    const { name, mimeType, size } = fetchFileMetadata.data;

    if (mimeType === "application/vnd.google-apps.folder") {
      const payload: ErrorResponse = {
        success: false,
        timestamp: new Date().toISOString(),
        code: 400,
        errors: {
          message: "Cannot download folder",
          reason: "badRequest",
        },
      };

      return response.status(400).json(payload);
    }

    response.setHeader(
      "Content-Disposition",
      `attachment; filename=${encodeURIComponent(name as string)}`,
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
