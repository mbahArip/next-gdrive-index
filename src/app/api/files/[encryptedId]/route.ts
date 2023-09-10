import gIndexConfig from "config";
import { NextRequest, NextResponse } from "next/server";

import getSearchParams from "utils/apiHelper/getSearchParams";
import { decryptData, encryptData } from "utils/encryptionHelper/hash";
import ExtendedError from "utils/extendedError";
import gdrive from "utils/gdriveInstance";

import { IGDriveFiles } from "types/api/files";
import { APIFileResponse, APIFilesResponse, ErrorResponse } from "types/api/response";

export async function GET(request: NextRequest, { params }: { params: { encryptedId: string } }) {
  const reqStart = Date.now();
  try {
    const id = decryptData(params.encryptedId);
    if (id === gIndexConfig.apiConfig.rootFolder)
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_VERCEL_URL}/api/files`, { status: 301 });

    const file = await gdrive.files.get({
      fileId: id,
      fields: gIndexConfig.apiConfig.defaultField,
    });

    if (!file || file.data.trashed) throw new ExtendedError("File not found", 404, "Can't find requested file.");
    if (file.data.mimeType !== "application/vnd.google-apps.folder") {
      const res: APIFileResponse = {
        timestamp: Date.now(),
        responseTime: Date.now() - reqStart,
        file: {
          mimeType: file.data.mimeType as string,
          fileExtension: file.data.fileExtension as string,
          encryptedId: params.encryptedId,
          name: file.data.name as string,
          trashed: file.data.trashed as boolean,
          modifiedTime: file.data.modifiedTime as string,
          encryptedWebContentLink: encryptData(file.data.webContentLink as string),
          size: Number(file.data.size ?? 0),
          thumbnailLink: file.data.thumbnailLink as string,
          imageMediaMetadata: file.data.imageMediaMetadata
            ? {
                width: Number(file.data.imageMediaMetadata.width),
                height: Number(file.data.imageMediaMetadata.height),
                rotation: Number(file.data.imageMediaMetadata.rotation),
              }
            : undefined,
          videoMediaMetadata: file.data.videoMediaMetadata
            ? {
                width: Number(file.data.videoMediaMetadata.width),
                height: Number(file.data.videoMediaMetadata.height),
                durationMillis: Number(file.data.videoMediaMetadata.durationMillis),
              }
            : undefined,
        },
      };

      return NextResponse.json(res, {
        status: 200,
        headers: {
          "Cache-Control": gIndexConfig.cacheControl,
        },
      });
    }

    const { pageToken } = getSearchParams(request.url, ["pageToken"]);

    const filterName = gIndexConfig.apiConfig.hiddenFiles.map((item) => `name != '${item}'`).join(" and ");
    const query: string[] = [...gIndexConfig.apiConfig.defaultQuery, `'${id}' in parents`, `${filterName}`];
    const fetchFolderContents = await gdrive.files.list({
      q: query.join(" and "),
      fields: `files(${gIndexConfig.apiConfig.defaultField}), nextPageToken`,
      orderBy: gIndexConfig.apiConfig.defaultOrder,
      pageSize: gIndexConfig.apiConfig.itemsPerPage,
      pageToken: pageToken || undefined,
    });

    const folders: IGDriveFiles[] =
      fetchFolderContents.data.files
        ?.filter((item) => item.mimeType === "application/vnd.google-apps.folder")
        .map((item) => ({
          mimeType: item.mimeType as string,
          encryptedId: encryptData(item.id as string),
          name: item.name as string,
          trashed: item.trashed as boolean,
          modifiedTime: item.modifiedTime as string,
        })) ?? [];
    const files: IGDriveFiles[] =
      fetchFolderContents.data.files
        ?.filter((item) => item.mimeType !== "application/vnd.google-apps.folder")
        .map((item) => ({
          mimeType: item.mimeType as string,
          fileExtension: item.fileExtension as string,
          encryptedId: encryptData(item.id as string),
          name: item.name as string,
          trashed: item.trashed as boolean,
          modifiedTime: item.modifiedTime as string,
          encryptedWebContentLink: encryptData(item.webContentLink as string),
          size: Number(item.size ?? 0),
          thumbnailLink: item.thumbnailLink as string,
          imageMediaMetadata: item.imageMediaMetadata
            ? {
                width: Number(item.imageMediaMetadata.width ?? 0),
                height: Number(item.imageMediaMetadata.height ?? 0),
                rotation: Number(item.imageMediaMetadata.rotation ?? 0),
              }
            : undefined,
          videoMediaMetadata: item.videoMediaMetadata
            ? {
                width: Number(item.videoMediaMetadata.width ?? 0),
                height: Number(item.videoMediaMetadata.height ?? 0),
                durationMillis: Number(item.videoMediaMetadata.durationMillis ?? 0),
              }
            : undefined,
        })) ?? [];
    const readmeExists =
      fetchFolderContents.data.files?.some((item) => item.name === gIndexConfig.apiConfig.specialFile.readme) ?? false;
    const bannerExists =
      fetchFolderContents.data.files?.some(
        (item) =>
          item.name?.startsWith(gIndexConfig.apiConfig.specialFile.banner) && item.mimeType?.startsWith("image/"),
      ) ?? false;
    const passwordExists =
      fetchFolderContents.data.files?.some((item) => item.name === gIndexConfig.apiConfig.specialFile.password) ??
      false;

    const res: APIFilesResponse = {
      timestamp: Date.now(),
      responseTime: Date.now() - reqStart,
      folders,
      files,
      nextPageToken: fetchFolderContents.data.nextPageToken || undefined,
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
