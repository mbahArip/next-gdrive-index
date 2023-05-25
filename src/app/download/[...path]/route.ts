import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import createErrorPayload from "utils/apiHelper/createErrorPayload";
import gdrive from "utils/apiHelper/gdrive";
import shortEncryption from "utils/encryptionHelper/shortEncryption";
import ExtendedError from "utils/generalHelper/extendedError";

import { API_Response } from "types/api";
import { ValidateFilePathResponse } from "types/api/path";
import { Constant } from "types/general/constant";

import apiConfig from "config/api.config";

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } },
) {
  const _start = Date.now();
  const { path } = params;

  try {
    const passwordCookies =
      cookies().get(Constant.cookiePassword)?.value || "";

    const pathValidation = await fetch(
      `${apiConfig.basePath}/api/validate/${path.join(
        "/",
      )}`,
      {
        headers: {
          Cookie: `${Constant.cookiePassword}=${passwordCookies}`,
        },
      },
    ).then(
      (res) =>
        res.json() as Promise<
          API_Response<ValidateFilePathResponse>
        >,
    );

    let isFolder = false;
    if (
      pathValidation.data?.[pathValidation.data?.length - 1]
        .mimeType === "application/vnd.google-apps.folder"
    ) {
      isFolder = true;
    }
    const lastId = pathValidation.data?.[
      pathValidation.data?.length - 1
    ].encryptedId as string;

    if (isFolder) {
      throw new ExtendedError(
        Constant.apiBadRequest,
        400,
        "badRequest",
        "Can't download folder.",
      );
    }

    const getMetadata = gdrive.files.get({
      fileId: shortEncryption.decrypt(lastId),
      fields: "id, name, mimeType, webContentLink",
    });
    const getStream = gdrive.files.get(
      {
        fileId: shortEncryption.decrypt(lastId),
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
        apiConfig.files.download.maxFileSize &&
      apiConfig.files.download.maxFileSize > 0
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
        "Content-Disposition": `attachment; filename="${metadata.data.name}"`,
      },
    });
  } catch (error: any) {
    const payload = createErrorPayload(
      error,
      `GET /download/${path.join("/")}`,
      _start,
    );

    return NextResponse.json(payload, {
      status: payload.code || 500,
    });
  }
}
