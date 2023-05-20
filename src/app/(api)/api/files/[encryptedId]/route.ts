import {
  ErrorResponse,
  FileResponse,
  FilesResponse,
} from "types/googleapis";
import { NextRequest, NextResponse } from "next/server";
import getSearchParams from "utils/getSearchParams";
import {
  shortDecrypt,
  shortEncrypt,
} from "utils/encryptionHelper";
import driveClient from "utils/driveClient";
import apiConfig from "config/api.config";
import {
  ExtendedError,
  hiddenFiles,
} from "utils/driveHelper";

export async function GET(
  request: NextRequest,
  { params }: { params: { encryptedId: string } },
) {
  const _start = Date.now();

  try {
    const { pageToken, banner, thumbnail } =
      getSearchParams(request.url, ["pageToken", "banner"]);
    const id = shortDecrypt(params.encryptedId);
    if (id === apiConfig.files.rootFolder) {
      return NextResponse.redirect(
        `${apiConfig.basePath}/api/files`,
        {
          status: 301,
        },
      );
    }

    const file = await driveClient.files.get({
      fileId: id,
      fields: apiConfig.files.field,
    });

    if (!file || file.data.trashed) {
      const msg = file.data.trashed
        ? "File has been deleted"
        : "File not found";
      throw new ExtendedError(msg, 404, "notFound");
    }

    if (
      file.data.mimeType !==
      "application/vnd.google-apps.folder"
    ) {
      if (thumbnail === "1") {
        return NextResponse.redirect(
          file.data.thumbnailLink as string,
          {
            status: 302,
          },
        );
      }

      const payload: FileResponse = {
        success: true,
        timestamp: new Date().toISOString(),
        responseTime: Date.now() - _start,
        file: {
          ...file.data,
          id: shortEncrypt(file.data.id as string),
          webContentLink:
            shortEncrypt(
              file.data.webContentLink as string,
            ) || undefined,
        },
      };

      return NextResponse.json(payload, {
        status: 200,
        headers: {
          "Cache-Control": apiConfig.cache,
        },
      });
    }

    const query = [
      `'${id}' in parents`,
      "trashed = false",
      "'me' in owners",
    ];
    const folderContents = await driveClient.files.list({
      q: `${query.join(" and ")}`,
      fields: `files(${apiConfig.files.field}), nextPageToken`,
      orderBy: apiConfig.files.orderBy,
      pageSize: apiConfig.files.itemsPerPage,
      pageToken: pageToken || undefined,
    });

    const readmeFile = folderContents.data.files?.find(
      (file) =>
        file.name === apiConfig.files.specialFile.readme,
    );
    const bannerFile = folderContents.data.files?.find(
      (file) =>
        file.name?.startsWith(
          apiConfig.files.specialFile.banner,
        ) && file.mimeType?.startsWith("image/"),
    );

    if (banner === "1") {
      if (!bannerFile) {
        throw new ExtendedError(
          "Banner not found.",
          404,
          "notFound",
        );
      }
      if (
        Number(bannerFile.size) >
        apiConfig.files.download.maxFileSize
      ) {
        return NextResponse.redirect(
          bannerFile.webContentLink as string,
          { status: 302 },
        );
      }

      return NextResponse.redirect(
        `${apiConfig.basePath}/api/banner?id=${shortEncrypt(
          bannerFile.id as string,
        )}`,
        {
          status: 302,
        },
      );
    }

    const folderList =
      folderContents.data.files
        ?.filter(
          (file) =>
            file.mimeType ===
            "application/vnd.google-apps.folder",
        )
        .map((file) => ({
          ...file,
          id: shortEncrypt(file.id as string),
        })) || [];
    const fileList =
      folderContents.data.files
        ?.filter(
          (file) =>
            file.mimeType !==
              "application/vnd.google-apps.folder" &&
            !hiddenFiles.some((hiddenFile) =>
              file.name?.startsWith(hiddenFile),
            ),
        )
        .map((file) => ({
          ...file,
          id: shortEncrypt(file.id as string),
          webContentLink:
            shortEncrypt(file.webContentLink as string) ||
            undefined,
        })) || [];

    const payload: FilesResponse = {
      success: true,
      timestamp: new Date().toISOString(),
      responseTime: Date.now() - _start,
      folders: folderList,
      files: fileList,
      isReadmeExists: !!readmeFile,
      isBannerExists: !!bannerFile,
      nextPageToken:
        folderContents.data.nextPageToken || undefined,
    };

    return NextResponse.json(payload, {
      status: 200,
      headers: {
        "Cache-Control": apiConfig.cache,
      },
    });
  } catch (error: any) {
    const payload: ErrorResponse = {
      success: false,
      timestamp: new Date().toISOString(),
      responseTime: Date.now() - _start,
      code: error.code || 500,
      errors: {
        message:
          error.errors?.[0].message ||
          error.message ||
          "Unknown error",
        reason:
          error.errors?.[0].reason ||
          error.cause ||
          "internalError",
      },
    };

    return NextResponse.json(payload, {
      status: payload.code || 500,
    });
  }
}
