import gIndexConfig from "config";
import { drive_v3 } from "googleapis";
import { NextRequest, NextResponse } from "next/server";

import getSearchParams from "utils/apiHelper/getSearchParams";
import { decryptData, encryptData } from "utils/encryptionHelper/hash";
import ExtendedError from "utils/extendedError";
import { gdriveFilesList } from "utils/gdrive";
import gdrive from "utils/gdriveInstance";

import { IGDriveFiles } from "types/api/files";
import { APIGetFileResponse, ErrorResponse } from "types/api/response";

function isHiddenFile(name: string) {
  return gIndexConfig.apiConfig.hiddenFiles.find((item) => name.startsWith(item)) ? true : false;
}
function generateFileObject(data: drive_v3.Schema$File): IGDriveFiles {
  return {
    mimeType: data.mimeType as string,
    fileExtension: (data.fileExtension as string) ?? null,
    encryptedId: encryptData(data.id as string),
    name: data.name as string,
    trashed: (data.trashed as boolean) ?? false,
    modifiedTime: new Date(data.modifiedTime as string).toLocaleDateString(),
    encryptedWebContentLink: encryptData(data.webContentLink as string),
    size: Number(data.size ?? 0),
    thumbnailLink: (data.thumbnailLink as string) ?? null,
    imageMediaMetadata: data.imageMediaMetadata
      ? {
          width: Number(data.imageMediaMetadata.width ?? 0),
          height: Number(data.imageMediaMetadata.height ?? 0),
          rotation: Number(data.imageMediaMetadata.rotation ?? 0),
        }
      : null,
    videoMediaMetadata: data.videoMediaMetadata
      ? {
          width: Number(data.videoMediaMetadata.width ?? 0),
          height: Number(data.videoMediaMetadata.height ?? 0),
          durationMillis: Number(data.videoMediaMetadata.durationMillis ?? 0),
        }
      : null,
  };
}
function generateFolderObject(data: drive_v3.Schema$File): IGDriveFiles {
  return {
    mimeType: data.mimeType as string,
    encryptedId: encryptData(data.id as string),
    name: data.name as string,
    trashed: (data.trashed as boolean) ?? false,
    modifiedTime: new Date(data.modifiedTime as string).toLocaleDateString(),
  };
}

export async function GET(request: NextRequest) {
  const reqStart = Date.now();
  try {
    const { encryptedId, isFile, pageToken } = getSearchParams(request.url, ["encryptedId", "isFile", "pageToken"]);

    let data: {
      file: IGDriveFiles | null;
      files: IGDriveFiles[];
      folders: IGDriveFiles[];
      pageToken: string | null;
    } = {
      file: null,
      files: [],
      folders: [],
      pageToken: null,
    };
    if (isFile && encryptedId) {
      const fileContent = await gdrive.files.get({
        fileId: decryptData(encryptedId),
        fields: gIndexConfig.apiConfig.defaultField,
        supportsAllDrives: gIndexConfig.apiConfig.isTeamDrive,
      });
      if (isHiddenFile(fileContent.data.name as string))
        throw new ExtendedError("File not found", 404, "File you are looking for is not found");

      const payload: IGDriveFiles = generateFileObject(fileContent.data);
      data.file = payload;
    } else {
      const filterName = gIndexConfig.apiConfig.hiddenFiles.map((item) => `name != '${item}'`).join(" and ");
      const query: string[] = [
        ...gIndexConfig.apiConfig.defaultQuery,
        `'${encryptedId ? decryptData(encryptedId) : gIndexConfig.apiConfig.rootFolder}' in parents`,
        `${filterName}`,
      ];
      const folderContent = await gdriveFilesList({
        q: query.join(" and "),
        fields: `files(${gIndexConfig.apiConfig.defaultField}), nextPageToken`,
        orderBy: gIndexConfig.apiConfig.defaultOrder,
        pageSize: gIndexConfig.apiConfig.itemsPerPage,
        pageToken: pageToken ?? undefined,
        supportsAllDrives: gIndexConfig.apiConfig.isTeamDrive,
        includeItemsFromAllDrives: gIndexConfig.apiConfig.isTeamDrive,
      });

      const listFolders: IGDriveFiles[] =
        folderContent.data.files
          ?.filter((item) => item.mimeType === "application/vnd.google-apps.folder")
          .map((item) => generateFolderObject(item)) ?? [];
      const listFiles: IGDriveFiles[] =
        folderContent.data.files
          ?.filter((item) => item.mimeType !== "application/vnd.google-apps.folder")
          .map((item) => generateFileObject(item)) ?? [];

      data = {
        ...data,
        files: listFiles,
        folders: listFolders,
        pageToken: folderContent.data.nextPageToken ?? null,
      };
    }

    const payload: APIGetFileResponse = {
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
