import { NextRequest, NextResponse } from "next/server";

import { decryptData } from "~/utils/encryptionHelper/hash";
import gdrive from "~/utils/gdriveInstance";

import config from "~/config/gIndex.config";

type Props = {
  params: {
    encryptedId: string;
  };
};

export async function GET(
  request: NextRequest,
  { params: { encryptedId } }: Props,
) {
  try {
    const defaultImage = NextResponse.redirect(
      new URL("/og.png", config.basePath),
      {
        status: 302,
      },
    );
    const decryptedId = await decryptData(encryptedId);
    const _fileMeta = gdrive.files.get({
      fileId: decryptedId,
      fields:
        "id, name, mimeType, fileExtension, webContentLink, thumbnailLink",
      supportsAllDrives: config.apiConfig.isTeamDrive,
    });
    const _fileContent = gdrive.files.get(
      {
        fileId: decryptedId,
        alt: "media",
        supportsAllDrives: config.apiConfig.isTeamDrive,
      },
      {
        responseType: "stream",
      },
    );

    const [fileMeta, fileContent] = await Promise.all([
      _fileMeta,
      _fileContent,
    ]);
    const fileSize = Number(fileMeta.data.size || 0);

    if (!fileMeta.data.webContentLink) return defaultImage;
    if (!fileMeta.data.thumbnailLink) return defaultImage;
    if (
      !fileMeta.data.mimeType?.startsWith("image") &&
      !fileMeta.data.mimeType?.startsWith("video")
    )
      return defaultImage;

    // If svg, return actual image since there is no thumbnail for svg
    if (
      fileMeta.data.mimeType?.includes("svg") &&
      fileSize <= config.apiConfig.maxFileSize
    ) {
      const fileBuffer = await new Promise<Buffer>((resolve, reject) => {
        const chunks: Buffer[] = [];
        fileContent.data.on("data", (chunk) => {
          chunks.push(chunk);
        });
        fileContent.data.on("end", () => {
          resolve(Buffer.concat(chunks));
        });
        fileContent.data.on("error", (err) => {
          reject(err);
        });
      });

      return new NextResponse(fileBuffer, {
        headers: {
          "Cache-Control": "public, max-age=31536000, immutable",
          "Content-Type": fileMeta.data.mimeType || "application/octet-stream",
          "Content-Length": fileBuffer.length.toString(),
          "Content-Disposition": `attachment; filename="${encodeURIComponent(
            fileMeta.data.name || `Untitled.${fileMeta.data.fileExtension}`,
          )}"`,
        },
      });
    }

    if (config.apiConfig.proxyThumbnail) {
      const downloadThumb = await fetch(fileMeta.data.thumbnailLink, {
        cache: "force-cache",
      });
      const buffer = await downloadThumb.arrayBuffer();

      return new NextResponse(buffer, {
        headers: {
          "Cache-Control": "public, max-age=31536000, immutable",
          "Content-Type": fileMeta.data.mimeType || "application/octet-stream",
          "Content-Length": buffer.byteLength.toString(),
          "Content-Disposition": `attachment; filename="${encodeURIComponent(
            fileMeta.data.name || `Untitled.${fileMeta.data.fileExtension}`,
          )}"`,
        },
      });
    }

    return NextResponse.redirect(fileMeta.data.thumbnailLink);
  } catch (error) {
    const e = error as Error;
    console.error(e.message);
    return NextResponse.json(
      {
        error: e.message,
      },
      {
        status: 500,
      },
    );
  }
}
