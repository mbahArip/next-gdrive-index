import { NextRequest, NextResponse } from "next/server";
import { ErrorResponse } from "types/googleapis";
import getSearchParams from "utils/getSearchParams";
import { ExtendedError } from "utils/driveHelper";
import driveClient from "utils/driveClient";
import { shortDecrypt } from "utils/encryptionHelper";

export async function GET(request: NextRequest) {
  const _start = Date.now();
  try {
    const { id } = getSearchParams(request.url, ["id"]);
    if (!id) {
      throw new ExtendedError(
        "No id provided",
        400,
        "badRequest",
      );
    }

    const getMetadata = driveClient.files.get({
      fileId: shortDecrypt(id),
      fields: "id, name, mimeType",
    });
    const getStream = driveClient.files.get(
      {
        fileId: shortDecrypt(id),
        alt: "media",
      },
      { responseType: "stream" },
    );

    const [metadata, stream] = await Promise.all([
      getMetadata,
      getStream,
    ]);

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
