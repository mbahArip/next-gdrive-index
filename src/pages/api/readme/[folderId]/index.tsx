import { ErrorResponse } from "types/googleapis";
import { NextApiRequest, NextApiResponse } from "next";
import initMiddleware from "utils/apiMiddleware";
import { ExtendedError } from "utils/driveHelper";
import driveClient from "utils/driveClient";

export default initMiddleware(async function handler(
  request: NextApiRequest,
  response: NextApiResponse,
) {
  const _start = Date.now();

  try {
    const { folderId } = request.query;

    const [name, partialId] = (folderId as string).split(":");

    if (!name || !partialId || partialId.length !== 8) {
      throw new ExtendedError(
        "Can't resolve name and id provided.",
        400,
        "invalidId",
      );
    }

    const findReadme = await driveClient.files.list({
      q: `name = '.readme.md' and trashed = false and 'me' in owners`,
      fields: "files(id, name, mimeType, parents)",
    });
    const readme = findReadme.data.files?.find((file) =>
      file.parents?.[0].startsWith(partialId),
    );
    if (!readme) {
      return response.status(200);
    }
    response.setHeader(
      "Content-Type",
      readme.mimeType || "application/octet-stream",
    );
    response.setHeader(
      "Content-Disposition",
      `inline; filename="${readme.name}"`,
    );
    response.setHeader("Cache-Control", "public, max-age=0, must-revalidate");
    const readmeStream = await driveClient.files.get(
      {
        fileId: readme.id as string,
        alt: "media",
      },
      { responseType: "text" },
    );

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
