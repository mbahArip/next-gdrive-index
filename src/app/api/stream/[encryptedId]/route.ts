import { NextRequest, NextResponse } from "next/server";

import { CheckDownloadToken } from "~/app/actions";

import { decryptData } from "~/utils/encryptionHelper/hash";
import { gdriveNoCache as gdrive } from "~/utils/gdriveInstance";

import config from "~/config/gIndex.config";

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

    // Only allow if referrer is from the same site
    // if (!request.headers.get("Referer")?.includes(config.basePath)) {
    //   throw new Error("Invalid request");
    // }

    const tokenValidity = await CheckDownloadToken(token);
    if (!tokenValidity.success) throw new Error(tokenValidity.message);

    const decryptedId = await decryptData(encryptedId);

    const fileMeta = await gdrive.files.get({
      fileId: decryptedId,
      fields: "id, name, mimeType, size, fileExtension, webContentLink",
      supportsAllDrives: config.apiConfig.isTeamDrive,
    });

    const fileSize = Number(fileMeta.data.size || 0);
    if (!fileMeta.data.webContentLink)
      throw new Error("No download link found");

    const ranges = request.headers.get("Range") || "bytes=0-";
    let rangeStart = 0;
    let rangeEnd = fileSize - 1;
    const rangeRegex = /bytes=(\d+)-(\d+)?/;
    const rangeSize = ranges.match(rangeRegex);
    if (rangeSize) {
      rangeStart = parseInt(rangeSize[1], 10);
      rangeEnd = rangeSize ? parseInt(rangeSize[2], 10) : fileSize - 1;
    }

    const contentRange = `bytes=${rangeStart}-${Math.min(
      rangeEnd,
      fileSize - 1,
    )}/${fileSize}`;
    const contentLength = rangeEnd ? rangeEnd - rangeStart + 1 : fileSize;

    const fileContent = await gdrive.files.get(
      {
        fileId: decryptedId,
        alt: "media",
        supportsAllDrives: config.apiConfig.isTeamDrive,
      },
      {
        responseType: "stream",
        headers: {
          "Accept-Ranges": "bytes",
          "Range": ranges,
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
        // 'Content-Disposition': `attachment; filename="${encodeURIComponent(fileMeta.data.name || `Untitled.${fileMeta.data.fileExtension}`)}"`,
      },
    });

    // async function* readStream() {
    //   for await (const chunk of fileContent.data as any) {
    //     yield chunk;
    //   }
    // }
    // function iteratorToStream(iterator: AsyncGenerator<any>) {
    //   return new ReadableStream({
    //     async pull(controller) {
    //       const { done, value } = await iterator.next();
    //       if (done) {
    //         controller.close();
    //       } else {
    //         controller.enqueue(value);
    //       }
    //     },
    //   });
    // }
    // const stream: ReadableStream = iteratorToStream(readStream());

    // const res = new Response(stream, {
    //   status: 206,
    //   headers: {
    //     "Content-Type": fileMeta.data.mimeType || "application/octet-stream",
    //     "Content-Disposition": `attachment; filename="${encodeURIComponent(
    //       fileMeta.data.name || `Untitled.${fileMeta.data.fileExtension}`,
    //     )}"`,
    //     "Content-Length": contentLength.toString(),
    //     "Content-Range": ranges ? contentRange : "",
    //   },
    // });
    // NextResponse.next(res);
    // new NextResponse(stream, {
    //   status: request.headers.get("Range") ? 206 : 200,
    //   headers: {
    //     "Content-Type": fileMeta.data.mimeType || "application/octet-stream",
    //     "Content-Disposition": `attachment; filename="${encodeURIComponent(
    //       fileMeta.data.name || `Untitled.${fileMeta.data.fileExtension}`,
    //     )}"`,
    //     "Content-Length": fileSize.toString(),
    //     "Accept-Ranges": "bytes",
    //     "Range": ranges ? `bytes ${rangeStart}-${rangeEnd}/${fileSize}` : "",
    //   },
    // });

    // return new NextResponse(stream, {
    //   status: 206,
    //   headers: {
    //     "Content-Type": fileMeta.data.mimeType || "application/octet-stream",
    //     "Content-Disposition": `attachment; filename="${encodeURIComponent(
    //       fileMeta.data.name || `Untitled.${fileMeta.data.fileExtension}`,
    //     )}"`,
    //     "Content-Length": fileSize.toString(),
    //     "Accept-Ranges": "bytes",
    //     "Range": ranges ? `bytes ${rangeStart}-${rangeEnd}/${fileSize}` : "",
    //   },
    // });
  } catch (error) {
    const e = error as Error;
    console.error(e.message);
    return new NextResponse(e.message, {
      status: 500,
    });
  }
}
