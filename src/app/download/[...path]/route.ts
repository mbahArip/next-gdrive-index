import { ErrorResponse } from "types/googleapis";
import { NextRequest, NextResponse } from "next/server";
import driveClient from "utils/driveClient";
import apiConfig from "config/api.config";
import { ExtendedError } from "utils/driveHelper";
import axios from "axios";

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } },
) {
  const _start = Date.now();

  try {
    const validatePath = await axios.get(
      `${
        apiConfig.basePath
      }/api/validatePath?path=${params.path.join("/")}`,
    );

    return NextResponse.json(
      { data: validatePath.data },
      { status: 200 },
    );

    let id = "";
    // const id = shortDecrypt(params.encryptedId);
    // const { token } = getSearchParams(request.url, [
    //   "token",
    // ]);
    //
    // if (!apiConfig.files.download.allowProtectedFile) {
    //   const decryptToken = shortDecrypt(token ? token : "");
    //   const parsedToken = JSON.parse(
    //     decryptToken || "{}",
    //   ) as DownloadToken;
    //   if (!parsedToken) {
    //     throw new ExtendedError(
    //       "Protected file not allowed.",
    //       403,
    //       "forbidden",
    //     );
    //   }
    // }

    const getMetadata = driveClient.files.get({
      fileId: id,
      fields: apiConfig.files.field,
    });
    const getStream = driveClient.files.get(
      {
        fileId: id,
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
      throw new ExtendedError(msg, 404, "notFound");
    }

    if (
      metadata.data.mimeType ===
      "application/vnd.google-apps.folder"
    ) {
      throw new ExtendedError(
        "Can't download folder",
        400,
        "badRequest",
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
        "Cache-Control":
          "public, max-age=31536000, immutable",
        "Content-Disposition": `inline; filename="${metadata.data.name}"`,
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
