import { ErrorResponse } from "types/googleapis";
import drive from "utils/driveClient";
import { NextApiRequest, NextApiResponse } from "next";
import initMiddleware from "utils/apiMiddleware";
import apiConfig from "config/api.config";
import { ExtendedError } from "utils/driveHelper";

export default initMiddleware(async function handler(
  request: NextApiRequest,
  response: NextApiResponse,
) {
  const _start = Date.now();

  try {
    const query: string[] = [
      "name = '.readme.md'",
      `parents = '${apiConfig.files.rootFolder}'`,
      "trashed = false",
      "'me' in owners",
    ];
    const getRootReadme = await drive.files.list({
      q: query.join(" and "),
      fields: "files(id, name, mimeType)",
    });
    const readme = getRootReadme.data.files?.[0];
    if (!readme) {
      throw new ExtendedError("Readme not found.", 404, "notFound");
    }

    const readmeStream = await drive.files.get(
      {
        fileId: readme.id as string,
        alt: "media",
      },
      { responseType: "text" },
    );

    response.setHeader(
      "Content-Type",
      readme.mimeType || "application/octet-stream",
    );
    response.setHeader(
      "Content-Disposition",
      `inline; filename="${readme.name}"`,
    );
    response.setHeader("Cache-Control", "public, max-age=0, must-revalidate");

    return response.status(200).send(readmeStream.data);
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
