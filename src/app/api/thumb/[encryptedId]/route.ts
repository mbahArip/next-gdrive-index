import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { IS_DEV } from "~/constant";

import { encryptionService } from "~/lib/utils.server";

import config from "config";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{
    encryptedId: string;
  }>;
};

export async function GET(request: NextRequest, { params }: Props) {
  const { encryptedId } = await params;
  try {
    const searchParams = new URL(request.nextUrl).searchParams;
    const size = searchParams.get("size") ?? "512";

    // Only allow if the request is from the same domain or the referer is the same domain
    if (!IS_DEV && !request.headers.get("Referer")?.includes(config.basePath)) {
      throw new Error("Invalid request");
    }

    const validSize = z.coerce.number().safeParse(size);
    if (!validSize.success) {
      throw new Error("Invalid size");
    }

    const decryptedId = await encryptionService.decrypt(encryptedId);

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
