import gIndexConfig from "config";
import { NextRequest, NextResponse } from "next/server";

import getSearchParams from "utils/apiHelper/getSearchParams";
import { decryptData } from "utils/encryptionHelper/hash";
import { gdriveFilesList } from "utils/gdrive";
import gdrive from "utils/gdriveInstance";

import { APIGetReadmeResponse, ErrorResponse } from "types/api/response";

export async function GET(request: NextRequest) {
  const reqStart = Date.now();
  try {
    const { encryptedId } = getSearchParams(request.url, ["encryptedId"]);

    const query: string[] = [
      ...gIndexConfig.apiConfig.defaultQuery,
      `'${encryptedId ? decryptData(encryptedId) : gIndexConfig.apiConfig.rootFolder}' in parents`,
    ];
    const folderContent = await gdriveFilesList({
      q: query.join(" and "),
      fields: `files(${gIndexConfig.apiConfig.defaultField}), nextPageToken`,
      orderBy: gIndexConfig.apiConfig.defaultOrder,
      pageSize: gIndexConfig.apiConfig.itemsPerPage,
      pageToken: undefined,
    });
    const isReadmeExist = folderContent.data.files?.find(
      (file) => file.name === gIndexConfig.apiConfig.specialFile.readme,
    );
    let data: string | null = null;

    if (isReadmeExist) {
      const fileContent = await gdrive.files.get(
        {
          fileId: isReadmeExist.id as string,
          alt: "media",
        },
        { responseType: "text" },
      );
      data = fileContent.data as string;
    }

    const payload: APIGetReadmeResponse = {
      timestamp: Date.now(),
      responseTime: Date.now() - reqStart,
      data,
    };

    return NextResponse.json(payload, {
      status: 200,
      headers: {
        "Cache-Control": gIndexConfig.cacheControl,
      },
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
