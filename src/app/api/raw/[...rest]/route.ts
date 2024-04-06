import { NextRequest, NextResponse } from "next/server";

import { CheckPassword, CheckPaths, GetFile } from "~/app/actions";

import { decryptData } from "~/utils/encryptionHelper/hash";

import config from "~/config/gIndex.config";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params: { rest } }: { params: { rest: string[] } },
) {
  try {
    const sp = new URL(request.nextUrl).searchParams;
    const token = sp.get("token");
    if (!token) throw new Error("Token not found");

    const paths = await CheckPaths(rest);
    if (!paths.success) throw new Error(paths.message);

    if (!config.apiConfig.allowDownloadProtectedFile) {
      const unlocked = await CheckPassword(paths.data);
      if (!unlocked.success)
        throw new Error(
          unlocked.path
            ? unlocked.message
            : "No path returned from password checking",
        );
    }

    const encryptedId = paths.data.pop()?.id;
    if (!encryptedId)
      throw new Error("Failed to get encrypted ID, try to refresh the page.");
    if (token !== encryptedId) throw new Error("Invalid token");

    const data = await GetFile(encryptedId);
    if (data.mimeType?.includes("folder"))
      throw new Error("Can't download folder");
    if (
      !data.mimeType.includes("video") &&
      !data.mimeType.includes("image") &&
      !data.mimeType.includes("audio")
    )
      throw new Error(
        "Raw link only available for video, image, and audio files",
      );
    if (!data.encryptedWebContentLink)
      throw new Error("No download link found");

    const decryptedWebContent = await decryptData(data.encryptedWebContentLink);
    return new NextResponse(null, {
      status: 302,
      headers: {
        Location: decryptedWebContent,
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
