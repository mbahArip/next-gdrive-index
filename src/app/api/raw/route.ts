import { type NextRequest, NextResponse } from "next/server";

import { encryptionService } from "~/lib/utils.server";

import { GetFile } from "~/actions/files";
import { ValidatePaths } from "~/actions/paths";

// TODO: Barebone implementation, add more protection like token, etc
export async function GET(req: NextRequest) {
  const sp = new URL(req.nextUrl).searchParams;
  const url = sp.get("url");
  try {
    if (!url)
      throw new Error("[400] Invalid raw api usage", {
        cause: "No URL provided",
      });
    const paths = url.split("/").filter(Boolean);
    const validatePaths = await ValidatePaths(paths);
    if (!validatePaths.success)
      throw new Error(`[404] ${validatePaths.message}`, {
        cause: validatePaths.error,
      });

    const currentFile = validatePaths.data.pop();
    if (!currentFile)
      throw new Error("[404] File not found", {
        cause: "Failed to get current file",
      });
    if (["image", "video", "audio"].every((type) => !currentFile.mimeType.includes(type)))
      throw new Error("[400] Invalid file type", {
        cause: "Raw link only available for video, image, and audio files",
      });
    const file = await GetFile(currentFile.id);
    if (!file.success)
      throw new Error(`[500] ${file.message}`, {
        cause: file.error,
      });
    if (!file.data?.encryptedWebContentLink)
      throw new Error("[500] No download link found", {
        cause: "No download link found",
      });

    const decryptedLink = await encryptionService.decrypt(file.data.encryptedWebContentLink);

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
