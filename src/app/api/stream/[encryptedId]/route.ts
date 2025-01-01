import { type NextRequest, NextResponse } from "next/server";
import { IS_DEV } from "~/constant";

import { decryptData } from "~/utils/encryptionHelper";
import { gdriveNoCache as gdrive } from "~/utils/gdriveInstance";

import { CheckDownloadToken, CheckPassword, CheckPaths, RedirectSearchFile } from "actions";
import config from "config";

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

    // Only allow if the request is from the same domain or the referer is the same domain
    if (!IS_DEV && !request.headers.get("Referer")?.includes(config.basePath)) {
      throw new Error("Invalid request");
    }

    const tokenValidity = await CheckDownloadToken(token);
    if (!tokenValidity.success) throw new Error(tokenValidity.message);

    const decryptedId = await decryptData(encryptedId);

    const _filePaths = RedirectSearchFile(encryptedId);
    const _fileMeta = gdrive.files.get(
      {
        fileId: decryptedId,
        fields: "id, name, mimeType, size, fileExtension, webContentLink",
        supportsAllDrives: config.apiConfig.isTeamDrive,
      },
      {
        headers: {
          "Accept-Ranges": "bytes",
          "Range": request.headers.get("Range") || `bytes=0-${1024 * 1024 - 1}`,
        },
      },
    );

    const [filePaths, fileMeta] = await Promise.all([_filePaths, _fileMeta]);

    const isFull = Number(request.headers.get("Range")?.split("-")[1] || 0) === Number(fileMeta.data.size || "1") - 1;

    const fileSize = Number(fileMeta.data.size || 0);
    if (!fileMeta.data.webContentLink) throw new Error("No download link found");

    if (config.apiConfig.streamMaxSize && fileSize > config.apiConfig.streamMaxSize) {
      throw new Error("File is too large to stream");
    }

    if (!config.apiConfig.allowDownloadProtectedFile) {
      const checkPath = await CheckPaths(filePaths.split("/"));
      if (!checkPath.success) throw new Error("File not found");
      const unlocked = await CheckPassword(checkPath.data);
      if (!unlocked.success) {
        if (!unlocked.path) throw new Error("No path returned from password checking");

        const lockedIndex = checkPath.data.findIndex((path) => path.id === unlocked.path);
        // Get all path until the locked index, then join them
        const path = checkPath.data
          .slice(0, lockedIndex + 1)
          .map((path) => path.path)
          .join("/");
        return new NextResponse(
          `The file you're trying to access is protected by password.
Please open the file link and enter the password to access the file, then try to download the file again.

Protected Path: ${new URL(path, config.basePath).toString()}

If you've already entered the password, please make sure your browser is not blocking cookies from this site.`,
          {
            status: 401,
          },
        );
      }
    }

    const ranges = request.headers.get("Range") || "bytes=0-";
    const chunkSize = 5 * 1024 * 1024; // Load 5MB at a time
    let rangeStart = 0;
    let rangeEnd = Math.min(chunkSize, fileSize - 1);
    const rangeRegex = /bytes=(\d+)-(\d+)?/;
    const rangeSize = rangeRegex.exec(ranges);
    if (rangeSize) {
      rangeStart = parseInt(rangeSize[1], 10);

      if (isFull) {
        rangeEnd = fileSize - 1;
      } else {
        rangeEnd = Math.min(rangeStart + chunkSize, fileSize - 1);
      }
    }

    const contentRange = `bytes=${rangeStart}-${rangeEnd}/${fileSize}`;
    const contentLength = rangeEnd ? rangeEnd - rangeStart + 1 : fileSize;

    const fileContent = await gdrive.files.get(
      {
        fileId: decryptedId,
        alt: "media",
        supportsAllDrives: config.apiConfig.isTeamDrive,
        acknowledgeAbuse: true,
      },
      {
        responseType: "stream",
        headers: {
          "Accept-Ranges": "bytes",
          "Range": `bytes=${rangeStart}-${rangeEnd}`,
        },
      },
    );

    const stream = fileContent.data as NodeJS.ReadableStream;
    const fileRange = fileContent.headers["content-range"];
    const fileLength = fileContent.headers["content-length"];

    const readable = new ReadableStream({
      start(controller) {
        stream.on("data", (chunk) => {
          controller.enqueue(chunk);
        });
        stream.on("end", () => {
          controller.close();
        });
        stream.on("error", (error) => {
          controller.error(error);
        });
      },
    });

    return new NextResponse(readable, {
      status: 206,
      headers: {
        "Content-Range": fileRange || contentRange,
        "Content-Length": fileLength || contentLength.toString(),
        "Content-Type": fileMeta.data.mimeType || "application/octet-stream",
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
