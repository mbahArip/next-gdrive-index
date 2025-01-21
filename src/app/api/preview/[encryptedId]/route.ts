import { type NextRequest, NextResponse } from "next/server";
import { IS_DEV } from "~/constant";

import { encryptionService, gdriveNoCache } from "~/lib/utils.server";

import { GetFile } from "~/actions/files";

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
  const sp = new URL(request.url).searchParams;
  const isInline = sp.get("inline") === "1";
  const isFull = sp.get("full") === "1";
  const origin = request.headers.get("Origin") ?? request.headers.get("Referer") ?? request.headers.get("Host") ?? null;

  try {
    if (!origin) {
      throw new Error("[500] Invalid request", {
        cause: "Request headers is invalid",
      });
    }

    // // Only allow if the request is from the same domain or the referer is the same domain
    if (!IS_DEV && !origin?.toLowerCase().includes(config.basePath.toLowerCase())) {
      throw new Error("[403] Unauthorized", {
        cause: "Request is not allowed",
      });
    }

    const decryptedId = await encryptionService.decrypt(encryptedId);
    const file = await GetFile(encryptedId);
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

    const fileSize = Number(file.data.size ?? 0);
    const isFullyLoaded = isFull ? true : Number(request.headers.get("Range")?.split("-")[1] ?? 0) === fileSize - 1;

    if (config.apiConfig.streamMaxSize && fileSize > config.apiConfig.streamMaxSize) {
      throw new Error("[400] File is too large to stream", {
        cause: "File size is larger than the maximum allowed size, please download the file instead",
      });
    }

    const ranges = request.headers.get("Range") ?? "bytes=0-";
    const chunkSize = 5 * 1024 * 1024; // Load 5MB at a time
    let rangeStart = 0;
    let rangeEnd = Math.min(chunkSize, fileSize - 1);
    const rangeSize = /bytes=(\d+)-(\d+)?/.exec(ranges);
    if (rangeSize) {
      rangeStart = Number(rangeSize?.[1] ?? 0);

      if (isFullyLoaded) {
        rangeEnd = fileSize - 1;
      } else {
        rangeEnd = Math.min(rangeStart + chunkSize, fileSize - 1);
      }
    }

    const content = await gdriveNoCache.files.get(
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

    const headers = new Headers(content.headers);
    if (isInline) {
      headers.set("Content-Disposition", `inline; filename="${file.data.name}"`);
    }

    return new NextResponse(content.data as unknown as BodyInit, {
      status: isFullyLoaded ? 200 : content.status,
      headers: headers,
    });
  } catch (error) {
    const e = error as Error;
    const message = e.message.replace(/\[.*\]/, "").trim();
    const status = /\[.*\]/.exec(e.message)?.[0].replace(/\[|\]/g, "").trim() ?? 500;

    return NextResponse.json(
      {
        scope: "api/preview",
        message,
        cause: e.cause ?? "Unknown",
      },
      {
        status: Number(status),
      },
    );
  }
}
