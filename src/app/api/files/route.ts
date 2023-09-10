import gIndexConfig from "config";
import { NextRequest, NextResponse } from "next/server";

import getSearchParams from "utils/apiHelper/getSearchParams";
import privateIndexProtection from "utils/apiHelper/privateIndexProtection";
import { encryptData } from "utils/encryptionHelper/hash";
import gdrive from "utils/gdriveInstance";

import { IGDriveFiles } from "types/api/files";
import {
  APIFilesResponse,
  ErrorResponse,
} from "types/api/response";

export async function GET(request: NextRequest) {
  const reqStart = Date.now();
  try {
    await privateIndexProtection(request);
    const { pageToken } = getSearchParams(request.url, [
      "pageToken",
    ]);

    const query: string[] = [
      ...gIndexConfig.apiConfig.defaultQuery,
      `'${gIndexConfig.apiConfig.rootFolder}' in parents`,
    ];
    const fetchFolderContents = await gdrive.files.list({
      q: query.join(" and "),
      fields: `files(${gIndexConfig.apiConfig.defaultField}), nextPageToken`,
      orderBy: gIndexConfig.apiConfig.defaultOrder,
      pageSize: gIndexConfig.apiConfig.itemsPerPage,
      pageToken: pageToken || undefined,
    });

    const folders: IGDriveFiles[] =
      fetchFolderContents.data.files
        ?.filter(
          (item) =>
            item.mimeType ===
            "application/vnd.google-apps.folder",
        )
        .map((item) => ({
          mimeType: item.mimeType as string,
          encryptedId: encryptData(item.id as string),
          name: item.name as string,
          trashed: item.trashed as boolean,
          modifiedTime: item.modifiedTime as string,
        })) ?? [];
    const files: IGDriveFiles[] =
      fetchFolderContents.data.files
        ?.filter(
          (item) =>
            item.mimeType !==
              "application/vnd.google-apps.folder" &&
            !gIndexConfig.apiConfig.hiddenFiles.includes(
              item.name as string,
            ),
        )
        .map((item) => ({
          mimeType: item.mimeType as string,
          fileExtension: item.fileExtension as string,
          encryptedId: encryptData(item.id as string),
          name: item.name as string,
          trashed: item.trashed as boolean,
          modifiedTime: item.modifiedTime as string,
          encryptedWebContentLink: encryptData(
            item.webContentLink as string,
          ),
          size: Number(item.size ?? 0),
          thumbnailLink: item.thumbnailLink as string,
          imageMediaMetadata: item.imageMediaMetadata
            ? {
                width: Number(
                  item.imageMediaMetadata.width ?? 0,
                ),
                height: Number(
                  item.imageMediaMetadata.height ?? 0,
                ),
                rotation: Number(
                  item.imageMediaMetadata.rotation ?? 0,
                ),
              }
            : undefined,
          videoMediaMetadata: item.videoMediaMetadata
            ? {
                width: Number(
                  item.videoMediaMetadata.width ?? 0,
                ),
                height: Number(
                  item.videoMediaMetadata.height ?? 0,
                ),
                durationMillis: Number(
                  item.videoMediaMetadata.durationMillis ??
                    0,
                ),
              }
            : undefined,
        })) ?? [];
    const readmeExists =
      fetchFolderContents.data.files?.some(
        (item) =>
          item.name ===
          gIndexConfig.apiConfig.specialFile.readme,
      ) ?? false;
    const bannerExists =
      fetchFolderContents.data.files?.some(
        (item) =>
          item.name?.startsWith(
            gIndexConfig.apiConfig.specialFile.banner,
          ) && item.mimeType?.startsWith("image/"),
      ) ?? false;
    const passwordExists =
      fetchFolderContents.data.files?.some(
        (item) =>
          item.name ===
          gIndexConfig.apiConfig.specialFile.password,
      ) ?? false;

    const res: APIFilesResponse = {
      timestamp: Date.now(),
      responseTime: Date.now() - reqStart,
      folders,
      files,
      nextPageToken:
        fetchFolderContents.data.nextPageToken || undefined,
      readmeExists,
      bannerExists,
      passwordExists,
    };
    return NextResponse.json(res, {
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
