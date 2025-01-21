import { type NextRequest, NextResponse } from "next/server";

import { encryptionService, gdrive } from "~/lib/utils.server";

import { GetFile } from "~/actions/files";
import { CheckIndexPassword, CheckPagePassword } from "~/actions/password";
import { ValidatePaths } from "~/actions/paths";
import { ValidateFileToken } from "~/actions/token";

import config from "config";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, { params }: { params: Promise<{ rest: string[] }> }) {
  const { rest } = await params;
  const sp = new URL(request.nextUrl).searchParams;
  const forceRedirect = sp.get("redirect") === "1";
  const token = sp.get("token");
  const paths = rest.map((path) => {
    if (path.startsWith("/")) return decodeURIComponent(path.slice(1));
    return decodeURIComponent(path);
  });

  try {
    if (!config.apiConfig.allowDownloadProtectedFile) {
      if (!token) {
        throw new Error("[401] Token not found", {
          cause: "This endpoint requires a token to download the file",
        });
      }

      const validateToken = await ValidateFileToken(token);
      if (!validateToken.success) {
        throw new Error(`[401] ${validateToken.message}`, {
          cause: validateToken.error,
        });
      }
    }

    const validatedPaths = await ValidatePaths(paths);
    if (!validatedPaths.success) {
      throw new Error(`[404] ${validatedPaths.message}`, {
        cause: validatedPaths.error,
      });
    }

    const currentFile = validatedPaths.data.pop();
    if (!currentFile) {
      throw new Error("[404] File not found", {
        cause: "Failed to get current file",
      });
    }

    if (config.siteConfig.privateIndex && !config.apiConfig.allowDownloadProtectedFile) {
      const [indexUnlocked, pageUnlocked] = await Promise.all([
        CheckIndexPassword(),
        CheckPagePassword(validatedPaths.data),
      ]);
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

    const file = await GetFile(currentFile.id);
    if (!file.success) {
      throw new Error(`[404] ${file.message}`, {
        cause: file.error,
      });
    }
    if (!file.data?.encryptedWebContentLink) {
      throw new Error("[500] No download link found", {
        cause: "No download link found",
      });
    }

    const fileSize = Number(file.data?.size ?? 0);
    if ((config.apiConfig.maxFileSize > 0 && fileSize > config.apiConfig.maxFileSize) || forceRedirect) {
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
        fileId: await encryptionService.decrypt(file.data.encryptedId),
        alt: "media",
        supportsAllDrives: config.apiConfig.isTeamDrive,
        acknowledgeAbuse: true,
      },
      {
        responseType: "stream",
      },
    );
    const fileBuffer = await new Promise<Buffer>((res, rej) => {
      const chunks: Buffer<ArrayBufferLike>[] = [];
      content.data.on("data", (chunk) => {
        chunks.push(Buffer.from(chunk as ArrayBufferLike));
      });
      content.data.on("end", () => {
        res(Buffer.concat(chunks));
      });
      content.data.on("error", (err) => {
        rej(err);
      });
    });

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": file.data.mimeType,
        "Content-Length": fileBuffer.length.toString(),
        "Content-Disposition": `attachment; filename="${file.data.name}"`,
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
