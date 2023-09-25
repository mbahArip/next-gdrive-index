import gIndexConfig from "config";
import { NextRequest, NextResponse } from "next/server";

import getSearchParams from "utils/apiHelper/getSearchParams";
import { decryptData } from "utils/encryptionHelper/hash";
import ExtendedError from "utils/extendedError";
import gdrive from "utils/gdriveInstance";
import { isDownloadTokenValid } from "utils/tokenHelper";

import { ErrorResponse } from "types/api/response";

export async function GET(
  request: NextRequest,
  {
    params,
  }: {
    params: {
      encryptedId: string;
      fileName: string;
    };
  },
) {
  const reqStart = Date.now();
  const { encryptedId, fileName } = params;
  try {
    const data = JSON.parse(decryptData(encryptedId)) as {
      id: string;
      isProtected: boolean;
    };
    const { token, preview, disableLimit } = getSearchParams(request.url, ["token", "preview", "disableLimit"]);

    if (!gIndexConfig.apiConfig.allowDownloadProtectedFile && data.isProtected && !token)
      throw new ExtendedError("Missing download token", 403, "You are not authorized to download this file");
    if (!gIndexConfig.apiConfig.allowDownloadProtectedFile && data.isProtected && token && !isDownloadTokenValid(token))
      throw new ExtendedError("Invalid download token", 403, "You are not authorized to download this file");

    const _fileMeta = gdrive.files.get({
      fileId: decryptData(data.id),
      fields: "id, name, size, mimeType, webContentLink",
      supportsAllDrives: gIndexConfig.apiConfig.isTeamDrive,
    });
    const _fileContent = gdrive.files.get(
      {
        fileId: decryptData(data.id),
        supportsAllDrives: gIndexConfig.apiConfig.isTeamDrive,
        alt: "media",
      },
      { responseType: "stream" },
    );

    const [fileMeta, fileContent] = await Promise.all([_fileMeta, _fileContent]);
    const fileSize = Number(fileMeta.data.size) ?? 0;
    if (fileSize > gIndexConfig.apiConfig.maxFileSize && !disableLimit) {
      return NextResponse.redirect(fileMeta.data.webContentLink!, {
        status: 302,
        headers: {
          "Cache-Control": gIndexConfig.cacheControl,
        },
      });
    }
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
      status: 200,
      headers: {
        "Content-Type": fileMeta.data.mimeType ?? "application/octet-stream",
        "Content-Disposition": `${preview ? "inline;" : "attachment;"} filename="${encodeURIComponent(fileName)}"`,
        "Cache-Control": gIndexConfig.cacheControl,
      },
    });
  } catch (error: any) {
    const res: ErrorResponse = {
      timestamp: Date.now(),
      responseTime: Date.now() - reqStart,
      error: {
        code: error.code || 500,
        message: error.message,
        reason: error.errors?.[0].reason,
      },
    };
    return NextResponse.json(res, {
      status: error.code || 500,
    });
  }
}
