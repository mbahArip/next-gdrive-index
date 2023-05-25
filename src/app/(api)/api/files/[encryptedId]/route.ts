import { drive_v3 } from "googleapis";
import { NextRequest, NextResponse } from "next/server";

import createErrorPayload from "utils/apiHelper/createErrorPayload";
import gdrive from "utils/apiHelper/gdrive";
import getSearchParams from "utils/apiHelper/getSearchParams";
import shortEncryption from "utils/encryptionHelper/shortEncryption";
import ExtendedError from "utils/generalHelper/extendedError";

import { API_Response } from "types/api";
import {
  FileResponse,
  FilesResponse,
} from "types/api/files";
import { Constant } from "types/general/constant";

import apiConfig from "config/api.config";

export async function GET(
  request: NextRequest,
  { params }: { params: { encryptedId: string } },
) {
  const _start = Date.now();

  try {
    const { pageToken, banner, thumbnail } =
      getSearchParams(request.url, [
        "pageToken",
        "banner",
        "thumbnail",
      ]);
    const id = shortEncryption.decrypt(params.encryptedId);
    if (id === apiConfig.files.rootFolder) {
      return NextResponse.redirect(
        `${apiConfig.basePath}/api/files`,
        {
          status: 301,
        },
      );
    }

    const file = await gdrive.files.get({
      fileId: id,
      fields: apiConfig.files.field,
    });

    if (!file || file.data.trashed) {
      const msg = file.data.trashed
        ? "File has been deleted"
        : "File not found";
      throw new ExtendedError(
        Constant.apiFileNotFound,
        404,
        "notFound",
        msg,
      );
    }

    if (
      file.data.mimeType !==
      "application/vnd.google-apps.folder"
    ) {
      if (thumbnail === "1") {
        if (!file.data.thumbnailLink) {
          const imgStream = await fetch(
            `${apiConfig.basePath}/og.png`,
          ).then((res) => res.arrayBuffer());
          return new NextResponse(imgStream, {
            status: 200,
          });
        }
        if (file.data.mimeType?.startsWith("image/")) {
          const imgStream = await gdrive.files.get(
            {
              fileId: id,
              alt: "media",
            },
            { responseType: "stream" },
          );
          if (
            Number(file.data.size) <
              apiConfig.files.download.maxFileSize &&
            apiConfig.files.download.maxFileSize > 0
          ) {
            const arrayBuffer =
              await new Promise<ArrayBuffer>(
                (resolve, reject) => {
                  const chunks: Buffer[] = [];
                  imgStream.data.on("data", (chunk) =>
                    chunks.push(chunk),
                  );
                  imgStream.data.on("end", () => {
                    const buffer = Buffer.concat(chunks);
                    resolve(
                      buffer.buffer.slice(
                        buffer.byteOffset,
                        buffer.byteOffset +
                          buffer.byteLength,
                      ),
                    );
                  });
                  imgStream.data.on("error", reject);
                },
              );
            return new NextResponse(arrayBuffer, {
              status: 200,
              headers: {
                "Content-Type":
                  file.data.mimeType ||
                  "application/octet-stream",
                "Cache-Control": apiConfig.cacheControl,
                "Content-Disposition": `inline; filename="${file.data.name}"`,
              },
            });
          }
        }

        return NextResponse.redirect(
          file.data.thumbnailLink as string,
          {
            status: 302,
          },
        );
      }

      const payload: API_Response<FileResponse> = {
        success: true,
        timestamp: new Date().toISOString(),
        responseTime: Date.now() - _start,
        data: {
          ...file.data,
          id: shortEncryption.encrypt(
            file.data.id as string,
          ),
          webContentLink:
            shortEncryption.encrypt(
              file.data.webContentLink as string,
            ) || undefined,
        },
      };

      return NextResponse.json(payload, {
        status: 200,
        headers: {
          "Cache-Control": apiConfig.cacheControl,
        },
      });
    }

    const query = [
      `'${id}' in parents`,
      "trashed = false",
      "'me' in owners",
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
        }/api/banner?id=${shortEncryption.encrypt(
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
