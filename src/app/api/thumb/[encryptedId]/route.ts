import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

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
    const searchParams = new URL(request.nextUrl).searchParams;
    const size = searchParams.get("size") || "512";

    const validSize = z.coerce.number().safeParse(size);
    if (!validSize.success) {
      throw new Error("Invalid size");
    }

    const defaultImage = NextResponse.redirect(
      new URL("/og.png", config.basePath),
      {
        status: 302,
      },
    );
    const decryptedId = await decryptData(encryptedId);

    const fileMeta = await gdrive.files.get({
      fileId: decryptedId,
      fields:
        "id, name, mimeType, fileExtension, webContentLink, thumbnailLink",
      supportsAllDrives: config.apiConfig.isTeamDrive,
    });

    if (
      !fileMeta.data.mimeType?.startsWith("image") &&
      !fileMeta.data.mimeType?.startsWith("video")
    ) {
      return defaultImage;
    }

    const url = `https://drive.google.com/thumbnail?id=${decryptedId}&sz=w${size}`;

    if (!config.apiConfig.proxyThumbnail) {
      return NextResponse.redirect(url);
    }

    const downloadThumb = await fetch(url, {
      cache: "force-cache",
    });
    const buffer = await downloadThumb.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Type": "image/jpeg",
        "Content-Length": buffer.byteLength.toString(),
      },
    });
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
