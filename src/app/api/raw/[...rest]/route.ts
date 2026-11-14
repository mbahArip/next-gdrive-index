import { type NextRequest, NextResponse } from "next/server";

import { encryptionService } from "~/lib/utils.server";

import { GetFile } from "~/actions/files";
import { CheckIndexPassword, CheckPagePassword } from "~/actions/password";
import { ValidatePaths } from "~/actions/paths";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, { params }: { params: Promise<{ rest: string[] }> }) {
  const { rest } = await params;
  const ALLOWED_TYPES = ["image/*", "video/*", "audio/*"]; // Based from mime types
  const paths = rest.map((path) => {
    if (path.startsWith("/")) return decodeURIComponent(path.slice(1));
    return decodeURIComponent(path);
  });

  try {
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
    if (ALLOWED_TYPES.every((type) => !new RegExp(type.replace("*", ".*")).test(currentFile.mimeType))) {
      throw new Error("[400] Invalid file type", {
        cause: "Raw link only available for video, image, and audio files",
      });
    }

    // Enforce the same password protection as the page and the download endpoint.
    // Without this, a media file inside a password-protected folder (or any file
    // when the index is private) can be fetched directly via this endpoint,
    // bypassing the index and per-folder passwords.
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

    const fileMeta = await GetFile(currentFile.id);
    if (!fileMeta.success) {
      throw new Error(`[500] ${fileMeta.message}`, {
        cause: fileMeta.error,
      });
    }
    if (!fileMeta.data?.encryptedWebContentLink) {
      throw new Error("[500] No download link found", {
        cause: "No download link found",
      });
    }

    const decryptedLink = await encryptionService.decrypt(fileMeta.data.encryptedWebContentLink);
    return new NextResponse(null, {
      status: 302,
      headers: {
        Location: decryptedLink,
      },
    });
  } catch (error) {
    const e = error as Error;
    const message = e.message.replace(/\[.*\]/, "").trim();
    const status = /\[.*\]/.exec(e.message)?.[0].replace(/\[|\]/g, "").trim() ?? 500;

    return NextResponse.json(
      {
        scope: "api/raw",
        message,
        cause: e.cause ?? "Unknown",
      },
      {
        status: Number(status),
      },
    );
  }
}
