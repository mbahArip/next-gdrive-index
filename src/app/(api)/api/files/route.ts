import { drive_v3 } from "googleapis";
import { NextRequest, NextResponse } from "next/server";

import createErrorPayload from "utils/apiHelper/createErrorPayload";
import gdrive from "utils/apiHelper/gdrive";
import getSearchParams from "utils/apiHelper/getSearchParams";
import shortEncryption from "utils/encryptionHelper/shortEncryption";
import ExtendedError from "utils/generalHelper/extendedError";

import { API_Response } from "types/api";
import { FilesResponse } from "types/api/files";
import { Constant } from "types/general/constant";

import apiConfig from "config/api.config";

export async function GET(request: NextRequest) {
  const _start = Date.now();

  try {
    const { pageToken, banner } = getSearchParams(
      request.url,
      ["pageToken", "banner"],
    );

    const query: string[] = [
      ...apiConfig.files.query,
      `'${apiConfig.files.rootFolder}' in parents`,
    ];
    const fetchFolderContents = await gdrive.files.list({
      q: `${query.join(" and ")}`,
      fields: `files(${apiConfig.files.field}), nextPageToken`,
      orderBy: apiConfig.files.orderBy,
      pageSize: apiConfig.files.itemsPerPage,
      pageToken: pageToken || undefined,
    });

    const readmeFile = fetchFolderContents.data.files?.find(
      (file) =>
        file.name === apiConfig.files.specialFile.readme,
    );
    let readmeContent: string | undefined;
    const bannerFile = fetchFolderContents.data.files?.find(
      (file) =>
        file.name?.startsWith(
          apiConfig.files.specialFile.banner,
        ) && file.mimeType?.startsWith("image/"),
    );

    if (readmeFile) {
      const readme = await gdrive.files.get(
        {
          fileId: readmeFile.id as string,
          alt: "media",
        },
        { responseType: "text" },
      );
      readmeContent = readme.data as string;
    }
    if (banner === "1") {
      if (!bannerFile) {
        throw new ExtendedError(
          Constant.apiFileNotFound,
          404,
          "notFound",
          "The banner file is not found.",
        );
      }

      return NextResponse.redirect(
        `${
          apiConfig.basePath
        }/api/banner/${shortEncryption.encrypt(
          bannerFile.id as string,
        )}`,
        {
          status: 302,
        },
      );
    }

    const folderList =
      (fetchFolderContents.data.files
        ?.filter(
          (file) =>
            file.mimeType ===
            "application/vnd.google-apps.folder",
        )
        .map((file) => ({
          ...file,
          id: shortEncryption.encrypt(file.id as string),
        })) as drive_v3.Schema$File[]) || [];
    const fileList =
      (fetchFolderContents.data.files
        ?.filter(
          (file) =>
            !file.mimeType?.startsWith(
              "application/vnd.google-apps",
            ) &&
            !apiConfig.files.hiddenFiles.some(
              (hiddenFile) =>
                file.name?.startsWith(hiddenFile),
            ),
        )
        .map((file) => ({
          ...file,
          id: shortEncryption.encrypt(file.id as string),
          webContentLink:
            shortEncryption.encrypt(
              file.webContentLink as string,
            ) || undefined,
        })) as drive_v3.Schema$File[]) || [];

    const payload: API_Response<FilesResponse> = {
      success: true,
      timestamp: new Date().toISOString(),
      responseTime: Date.now() - _start,
      data: {
        folders: folderList,
        files: fileList,
        isReadmeExists: !!readmeFile,
        readmeContent: readmeContent
          ? shortEncryption.encrypt(readmeContent)
          : undefined,
        isBannerExists: !!bannerFile,
        nextPageToken:
          fetchFolderContents.data.nextPageToken ||
          undefined,
      },
    };

    return NextResponse.json(payload, {
      status: 200,
      headers: {
        "Cache-Control": apiConfig.cacheControl,
      },
    });
  } catch (error: any) {
    const payload = createErrorPayload(
      error,
      "GET /api/files",
      _start,
    );

    return NextResponse.json(payload, {
      status: payload.code || 500,
    });
  }
}
