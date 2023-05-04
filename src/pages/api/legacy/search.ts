import { ErrorResponse, SearchResponse } from "@/types/googleapis";
import drive from "@/utils/driveClient";
import { buildQuery } from "@/utils/driveHelper";
import { NextApiRequest, NextApiResponse } from "next";
import config from "@config/site.config";

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse<SearchResponse | ErrorResponse>,
) {
  try {
    const { query } = request.query;
    if (!query) {
      const payload: SearchResponse = {
        success: true,
        timestamp: new Date().toISOString(),
        files: [],
      };

      return response.status(200).json(payload);
    }

    const fetchFiles = await drive.files.list({
      q: buildQuery({
        extraQuery: [`name contains '${query}'`],
        globalSearch: true,
      }),
      fields:
        "files(id, name, mimeType, thumbnailLink, fileExtension, createdTime, modifiedTime, size)",
      pageSize: config.files.searchResult,
    });

    const payload: SearchResponse = {
      success: true,
      timestamp: new Date().toISOString(),
      files: fetchFiles.data.files || [],
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
