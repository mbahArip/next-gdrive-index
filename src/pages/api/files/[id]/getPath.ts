import initMiddleware from "utils/apiMiddleware";
import { NextApiRequest, NextApiResponse } from "next";
import {
  BreadCrumbsResponse,
  ErrorResponse,
  TFileParent,
} from "types/googleapis";
import { ExtendedError } from "utils/driveHelper";
import driveClient from "utils/driveClient";
import apiConfig from "config/api.config";

export default initMiddleware(async function handler(
  request: NextApiRequest,
  response: NextApiResponse<BreadCrumbsResponse | ErrorResponse>,
) {
  const _start = Date.now();

  try {
    const { id } = request.query;

    if (id === "root") {
      return response.status(200).json({
        success: true,
        timestamp: new Date().toISOString(),
        responseTime: Date.now() - _start,
        breadcrumbs: [],
        isLimitReached: false,
      });
    }

    const [name, partialId] = (id as string).split(":");

    if (!name || !partialId || partialId.length !== 8) {
      throw new ExtendedError(
        "Can't resolve name and id provided.",
        400,
        "invalidId",
      );
    }

    const breadcrumbs: TFileParent[] = [];

    const searchForFile = await driveClient.files.list({
      q: `name contains '${name}' and trashed = false and 'me' in owners`,
      fields: "files(id, name, mimeType, parents)",
    });

    const file = searchForFile.data.files?.find(
      (file) =>
        file.name === decodeURIComponent(name) &&
        (file.id as string).startsWith(partialId),
    );
    if (!file) {
      throw new ExtendedError("File not found.", 404, "notFound");
    }

    response.setHeader("Cache-Control", apiConfig.cache);
    let isLimitReached = false;

    if (file.id === apiConfig.files.rootFolder) {
      return response.status(200).json({
        success: true,
        timestamp: new Date().toISOString(),
        responseTime: Date.now() - _start,
        breadcrumbs,
        isLimitReached,
      });
    }

    // if (file.mimeType === "application/vnd.google-apps.folder") {
    breadcrumbs.push({
      id: `${file.name}:${file.id?.slice(0, 8)}`,
      name: file.name as string,
    });
    // }

    let tempParent: string[] = file.parents || [];
    while (tempParent.length > 0) {
      if (breadcrumbs.length === apiConfig.files.breadcrumbDepth) {
        isLimitReached = true;
        break;
      }
      const fetchParent = await driveClient.files.get({
        fileId: tempParent[0],
        fields: "id, name, parents",
      });
      if (fetchParent.data.id === apiConfig.files.rootFolder) {
        break;
      }
      breadcrumbs.push({
        id: `${fetchParent.data.name}:${fetchParent.data.id?.slice(0, 8)}`,
        name: fetchParent.data.name as string,
      });
      tempParent = fetchParent.data.parents || [];
      if (!tempParent.length) break;
    }

    return response.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      responseTime: Date.now() - _start,
      breadcrumbs,
      isLimitReached,
    });
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
