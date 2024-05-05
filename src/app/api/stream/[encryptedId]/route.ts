import { NextRequest, NextResponse } from "next/server";

import { CheckDownloadToken } from "~/app/actions";

import { decryptData } from "~/utils/encryptionHelper/hash";
import { gdriveNoCache as gdrive } from "~/utils/gdriveInstance";

import config from "~/config/gIndex.config";

import { streamFile } from "./helper";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  {
    params: { encryptedId },
  }: {
    params: {
      encryptedId: string;
    };
  },
) {
  try {
    const sp = new URL(request.nextUrl).searchParams;
    const token = sp.get("token");
    if (!token) throw new Error("Token not found");

    // Only allow if referrer is from the same site
    if (!request.headers.get("Referer")?.includes(config.basePath)) {
      throw new Error("Invalid request");
    }

    const tokenValidity = await CheckDownloadToken(token);
    if (!tokenValidity.success) throw new Error(tokenValidity.message);

    const decryptedId = await decryptData(encryptedId);
    const _fileMeta = gdrive.files.get({
      fileId: decryptedId,
      fields: "id, name, mimeType, size, fileExtension, webContentLink",
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
    if (!fileMeta.data.webContentLink)
      throw new Error("No download link found");

    const stream: ReadableStream = streamFile(fileContent.data);
    const ranges = request.headers.get("Range");
    if (ranges) {
      const [start, end] = ranges.replace(/bytes=/, "").split("-");
      const startByte = parseInt(start, 10);
      const endByte = end ? parseInt(end, 10) : fileSize - 1;
      return new NextResponse(stream, {
        status: 206,
        headers: {
          "Content-Type": fileMeta.data.mimeType || "application/octet-stream",
          "Content-Disposition": `attachment; filename="${encodeURIComponent(
            fileMeta.data.name || `Untitled.${fileMeta.data.fileExtension}`,
          )}"`,
          "Content-Length": (endByte - startByte + 1).toString(),
          "Accept-Ranges": "bytes",
          "Content-Range": `bytes ${startByte}-${endByte}/${fileSize}`,
        },
      });
    }

    return new NextResponse(stream, {
      status: 200,
      headers: {
        "Content-Type": fileMeta.data.mimeType || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(
          fileMeta.data.name || `Untitled.${fileMeta.data.fileExtension}`,
        )}"`,
        "Content-Length": fileSize.toString(),
        "Accept-Ranges": "bytes",
      },
    });
  } catch (error) {
    const e = error as Error;
    console.error(e.message);
    return new NextResponse(e.message, {
      status: 500,
    });
  }
}
