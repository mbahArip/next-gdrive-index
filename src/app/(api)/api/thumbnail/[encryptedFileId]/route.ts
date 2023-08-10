import { NextRequest, NextResponse } from "next/server";

import createErrorPayload from "utils/apiHelper/createErrorPayload";
import gdrive from "utils/apiHelper/gdrive";
import shortEncryption from "utils/encryptionHelper/shortEncryption";
import ExtendedError from "utils/generalHelper/extendedError";

import { Constant } from "types/general/constant";

import apiConfig from "config/api.config";

export async function GET(
  request: NextRequest,
  { params }: { params: { encryptedFileId: string } },
) {
  const _start = Date.now();
  const { encryptedFileId } = params;

  try {
    const getMetadata = gdrive.files.get({
      fileId: shortEncryption.decrypt(encryptedFileId),
      fields:
        "id, name, mimeType, webContentLink, thumbnailLink, size",
    });
    const getStream = gdrive.files.get(
      {
        fileId: shortEncryption.decrypt(encryptedFileId),
        alt: "media",
      },
      { responseType: "arraybuffer" },
    );

    const [metadata, stream] = await Promise.all([
      getMetadata,
      getStream,
    ]);

    if (!metadata || metadata.data.trashed) {
      throw new ExtendedError(
        Constant.apiFileNotFound,
        404,
        "notFound",
        Constant.reasonNotFound,
      );
    }

    if (!metadata.data.thumbnailLink) {
      const imgStream = await fetch(
        `${apiConfig.basePath}/og.png`,
      ).then((res) => res.arrayBuffer());

      return new NextResponse(imgStream, {
        status: 200,
        headers: {
          "Content-Type":
            metadata.data.mimeType ||
            "application/octet-stream",
          "Cache-Control": apiConfig.cacheControl,
          "Content-Disposition": `inline; filename="${metadata.data.name}"`,
        },
      });
    }

    const isWithinMaxFileSize =
      Number(metadata.data.size) <
        apiConfig.files.download.maxFileSize &&
      apiConfig.files.download.maxFileSize > 0;

    if (
      metadata.data.mimeType?.startsWith("image") &&
      isWithinMaxFileSize
    ) {
      const imgBuffer = (await stream.data) as ArrayBuffer;

      return new NextResponse(imgBuffer, {
        status: 200,
        headers: {
          "Cache-Control": apiConfig.cacheControl,
        },
      });
    }

    return NextResponse.redirect(
      metadata.data.thumbnailLink as string,
      {
        status: 302,
        headers: {
          "Cache-Control": apiConfig.cacheControl,
        },
      },
    );
  } catch (error: any) {
    const payload = createErrorPayload(
      error,
      "GET /api/thumbnail/:id",
      _start,
    );

    return NextResponse.json(payload, {
      status: payload.code,
    });
  }
}
