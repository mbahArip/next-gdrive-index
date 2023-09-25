import gIndexConfig from "config";
import { NextRequest, NextResponse } from "next/server";

import getSearchParams from "utils/apiHelper/getSearchParams";
import { encryptData } from "utils/encryptionHelper/hash";
import ExtendedError from "utils/extendedError";
import { gdriveFilesList } from "utils/gdrive";

import { IGDriveFiles } from "types/api/files";
import { APISearchResponse, ErrorResponse } from "types/api/response";

export async function GET(request: NextRequest) {
  const reqStart = Date.now();
  try {
    const { query } = getSearchParams(request.url, ["query"]);
    if (!query) throw new ExtendedError("Missing query", 400, "Search query is required");

    const searchFiles = await gdriveFilesList({
      q: [...gIndexConfig.apiConfig.defaultQuery, `name contains '${query}'`].join(" and "),
      fields: `files(${gIndexConfig.apiConfig.defaultField}), nextPageToken`,
      orderBy: "name_natural desc",
      pageSize: gIndexConfig.apiConfig.searchResult,
      pageToken: undefined,
    });

    const files: (IGDriveFiles & { redirect: string })[] =
      searchFiles.data.files?.map((data) => ({
        mimeType: data.mimeType ?? "Unknown",
        encryptedId: encryptData(data.id as string),
        name: data.name as string,
        trashed: data.trashed ?? false,
        modifiedTime: new Date(data.modifiedTime as string).toLocaleDateString(),
        fileExtension: (data.fileExtension as string) ?? null,
        encryptedWebContentLink: undefined,
        size: Number(data.size) ?? 0,
        thumbnailLink: (data.thumbnailLink as string) ?? null,
        imageMediaMetadata: null,
        videoMediaMetadata: null,
        redirect: `/api/search/redirect/${encryptData(data.id as string)}`,
      })) ?? [];

    const payload: APISearchResponse = {
      timestamp: Date.now(),
      responseTime: Date.now() - reqStart,
      files: files,
    };

    return NextResponse.json(payload, {
      status: 200,
    });
  } catch (error: any) {
    const res: ErrorResponse = {
      timestamp: Date.now(),
      responseTime: Date.now() - reqStart,
      error: {
        code: error.code || 500,
        message: error.message,
        reason: error.errors?.[0].reason,
      },
    };
    return NextResponse.json(res, {
      status: error.code || 500,
    });
  }
}
