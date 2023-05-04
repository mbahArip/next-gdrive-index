import { ErrorResponse } from "types/googleapis";
import drive from "utils/driveClient";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse,
) {
  try {
    const fetchReadme = await drive.files.list({
      q: "",
      fields: "files(id, name, mimeType, size)",
      orderBy: "modifiedTime desc",
    });

    if (!fetchReadme.data.files?.length) {
      const payload: ErrorResponse = {
        success: false,
        timestamp: new Date().toISOString(),
        code: 404,
        errors: {
          message: "Can't find readme",
          reason: "notFound",
        },
      };

      return response.status(404).json(payload);
    }

    const { id, name, mimeType, size } = fetchReadme.data.files[0];

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
