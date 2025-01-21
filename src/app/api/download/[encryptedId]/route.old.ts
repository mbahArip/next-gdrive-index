import { type NextRequest, NextResponse } from "next/server";

import { encryptionService } from "~/lib/utils.server";
import { gdriveNoCache as gdrive } from "~/utils/gdriveInstance";

import { GetFile } from "~/actions/files";
import { CheckIndexPassword, CheckPagePassword } from "~/actions/password";
import { ValidatePaths } from "~/actions/paths";
import { GetSearchResultPath } from "~/actions/search";
import { ValidateFileToken } from "~/actions/token";

import config from "config";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      encryptedId: string;
    }>;
  },
) {
  const { encryptedId } = await params;
  const sp = new URL(request.nextUrl).searchParams;
  const token = sp.get("token");

  try {
    if (!token) {
      throw new Error("[401] Token not found", {
        cause: "This endpoint requires a token to download the file",
      });
    }

    const decryptedId = await encryptionService.decrypt(encryptedId);
    console.log(decryptedId);
    const filePath = await GetSearchResultPath(encryptedId);
    console.log("filePath");
    // const [decryptedId, filePath] = await Promise.all([
    //   encryptionService.decrypt(encryptedId),
    //   GetSearchResultPath(encryptedId),
    // ]).then((data) => {
    //   console.log(data);
    //   return data;
    // });
    if (!filePath.success) {
      throw new Error(`[404] ${filePath.message}`, {
        cause: filePath.error,
      });
    }
    if (config.siteConfig.privateIndex && !config.apiConfig.allowDownloadProtectedFile) {
      const paths = await ValidatePaths(filePath.data.split("/"));
      if (!paths.success) {
        throw new Error(`[404] ${paths.message}`, {
          cause: paths.error,
        });
      }

      const [indexUnlocked, pageUnlocked] = await Promise.all([CheckIndexPassword(), CheckPagePassword(paths.data)]);
      if (!indexUnlocked.success) {
        throw new Error(`[401] ${indexUnlocked.message}`, {
          cause: indexUnlocked.error,
        });
      }
      if (!pageUnlocked.success) {
        throw new Error(`[401] ${pageUnlocked.message}`, {
          cause: pageUnlocked.error,
        });
      }
    }

    const validateToken = await ValidateFileToken(token);
    if (!validateToken.success) {
      throw new Error(`[401] ${validateToken.message}`, {
        cause: validateToken.error,
      });
    }

    const file = await GetFile(encryptedId);
    if (!file.success) {
      throw new Error(`[404] ${file.message}`, {
        cause: file.error,
      });
    }

    const fileSize = Number(file.data?.size ?? 0);
    if (!file.data?.encryptedWebContentLink) {
      throw new Error("[500] No download link found", {
        cause: "No download link returned from file data",
      });
    }

    if (config.apiConfig.maxFileSize && fileSize > config.apiConfig.maxFileSize) {
      const decryptedContentUrl = await encryptionService.decrypt(file.data.encryptedWebContentLink);
      const contentUrl = new URL(decryptedContentUrl);
      contentUrl.searchParams.set("confirm", "1");
      return new NextResponse(null, {
        status: 302,
        headers: {
          Location: contentUrl.toString(),
        },
      });
    }

    const content = await gdrive.files.get(
      {
        fileId: decryptedId,
        alt: "media",
        supportsAllDrives: config.apiConfig.isTeamDrive,
        acknowledgeAbuse: true,
      },
      {
        responseType: "stream",
      },
    );
    const fileBuffer = await new Promise<Buffer>((resolve, reject) => {
      const chunks: Buffer<ArrayBufferLike>[] = [];
      content.data.on("data", (chunk) => {
        chunks.push(Buffer.from(chunk as ArrayBufferLike));
      });
      content.data.on("end", () => {
        resolve(Buffer.concat(chunks));
      });
      content.data.on("error", (err) => {
        reject(err);
      });
    });

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": file.data.mimeType ?? "application/octet-stream",
        "Content-Length": fileBuffer.length.toString(),
        "Content-Disposition": `attachment; filename="${encodeURIComponent(
          file.data.name ?? `Untitled.${file.data.fileExtension}`,
        )}"`,
        "Cache-Control": config.cacheControl,
      },
    });
  } catch (error) {
    const e = error as Error;
    const message = e.message.replace(/\[.*\]/, "").trim();
    const status = /\[.*\]/.exec(e.message)?.[0].replace(/\[|\]/g, "").trim() ?? 500;

    return NextResponse.json(
      {
        scope: "api/download",
        message,
        cause: e.cause ?? "Unknown",
      },
      {
        status: Number(status),
      },
    );
  }
}
