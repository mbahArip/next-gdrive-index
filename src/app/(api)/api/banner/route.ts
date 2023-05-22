import { NextRequest, NextResponse } from "next/server";
import createErrorPayload from "utils/apiHelper/createErrorPayload";
import getSearchParams from "utils/apiHelper/getSearchParams";
import ExtendedError from "utils/generalHelper/extendedError";
import { Constant } from "types/general/constant";
import gdrive from "utils/apiHelper/gdrive";
import shortEncryption from "utils/encryptionHelper/shortEncryption";
import apiConfig from "config/api.config";

export async function GET(request: NextRequest) {
  const _start = Date.now();
  try {
    const { id } = getSearchParams(request.url, ["id"]);
    if (!id) {
      throw new ExtendedError(
        Constant.apiBadRequest,
        400,
        "badRequest",
        "Missing id",
      );
    }

    const getMetadata = gdrive.files.get({
      fileId: shortEncryption.decrypt(id),
      fields: "id, name, mimeType, webContentLink",
    });
    const getStream = gdrive.files.get(
      {
        fileId: shortEncryption.decrypt(id),
        alt: "media",
      },
      { responseType: "stream" },
    );

    const [metadata, stream] = await Promise.all([
      getMetadata,
      getStream,
    ]);
    if (!metadata || metadata.data.trashed) {
      const msg = metadata.data.trashed
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
      Number(metadata.data.size) >
      apiConfig.files.download.maxFileSize
    ) {
      return NextResponse.redirect(
        metadata.data.webContentLink as string,
        { status: 302 },
      );
    }

    const arrayBuffer = await new Promise<ArrayBuffer>(
      (resolve, reject) => {
        const chunks: Buffer[] = [];
        stream.data.on("data", (chunk) =>
          chunks.push(chunk),
        );
        stream.data.on("end", () => {
          const buffer = Buffer.concat(chunks);
          resolve(
            buffer.buffer.slice(
              buffer.byteOffset,
              buffer.byteOffset + buffer.byteLength,
            ),
          );
        });
        stream.data.on("error", reject);
      },
    );

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        "Content-Type":
          metadata.data.mimeType ||
          "application/octet-stream",
        "Cache-Control": apiConfig.cacheControl,
        "Content-Disposition": `inline; filename="${metadata.data.name}"`,
      },
    });
  } catch (error: any) {
    const payload = createErrorPayload(
      error,
      "GET /api/banner",
      _start,
    );

    return NextResponse.json(payload, {
      status: payload.code || 500,
    });
  }
}
