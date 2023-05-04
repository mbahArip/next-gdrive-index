import initMiddleware from "utils/apiMiddleware";
import { NextApiRequest, NextApiResponse } from "next";
import { ErrorResponse } from "types/googleapis";
import driveClient from "utils/driveClient";
import { ExtendedError } from "utils/driveHelper";
import apiConfig from "config/api.config";

export default initMiddleware(async function handler(
  request: NextApiRequest,
  response: NextApiResponse,
) {
  const _start = Date.now();
  try {
    const { id, fileName } = request.query;
    const getFileMetadata = await driveClient.files.get({
      fileId: id as string,
      fields: "name, mimeType, size, webContentLink",
    });

    if (
      getFileMetadata.data.name !== decodeURIComponent(fileName as string) ||
      getFileMetadata.data.mimeType?.startsWith("application/vnd.google-apps")
    ) {
      throw new ExtendedError("File not found", 404, "notFound");
    }

    if (Number(getFileMetadata.data.size) > apiConfig.maxResponseSize) {
      return response
        .status(301)
        .redirect(getFileMetadata.data.webContentLink as string);
    }

    const getFileStream = await driveClient.files.get(
      {
        fileId: id as string,
        alt: "media",
      },
      { responseType: "stream" },
    );

    response.setHeader(
      "Content-Type",
      getFileMetadata.data.mimeType || "application/octet-stream",
    );
    response.setHeader(
      "Content-Disposition",
      `attachment; filename=${encodeURIComponent(
        getFileMetadata.data.name as string,
      )}`,
    );

    return response.status(200).send(getFileStream.data);
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
