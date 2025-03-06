import { type NextRequest, NextResponse } from "next/server";
import stream from "stream";
import { promisify } from "util";

import { gdrive } from "~/lib/utils.server";

const pipeline = promisify(stream.pipeline);
const fileId = "1KvMU9sy8fQKKmVKU5xf_u3Y2JZefe0kt";

export async function GET(request: NextRequest) {
  try {
    const start = Date.now();
    console.log("Fetching metadata", Date.now() - start);
    const meta = await gdrive.files.get({
      fileId,
      fields: "size,mimeType,name",
      supportsAllDrives: true,
    });
    const { data: metadata } = meta;

    console.log("Fetching file", Date.now() - start);
    // const data = await gdrive.files.get(
    //   {
    //     fileId: fileId,
    //     alt: "media",
    //     acknowledgeAbuse: true,
    //   },
    //   {
    //     responseType: "stream",
    //   },
    // );

    console.log("Setting headers", Date.now() - start);
    const headers = new Headers();
    headers.set("Content-Type", metadata.mimeType ?? "application/octet-stream");
    if (metadata.size) headers.set("Content-Length", metadata.size.toString());
    headers.set("Content-Disposition", `attachment; filename="${metadata.name}"`);

    // console.log("Streaming file", Date.now() - start);
    // const contentStream = data.data;
    // const webStream = new ReadableStream({
    //   async start(controller) {
    //     contentStream.on("data", (chunk) => {
    //       controller.enqueue(chunk);
    //     });
    //     contentStream.on("end", () => {
    //       controller.close();
    //     });
    //     contentStream.on("error", (err) => {
    //       console.error(err);
    //       controller.error(err);
    //     });
    //   },
    //   cancel() {
    //     contentStream.destroy();
    //   },
    // });

    // console.log("Returning response", Date.now() - start);
    return new Response(
      new ReadableStream({
        async start(controller) {
          try {
            gdrive.files.get(
              {
                fileId: fileId,
                alt: "media",
                acknowledgeAbuse: true,
                supportsAllDrives: true,
              },
              {
                responseType: "stream",
              },
              (err, res) => {
                if (err) throw err;
                res?.data
                  .on("data", (chunk) => {
                    controller.enqueue(chunk);
                  })
                  .on("end", () => {
                    controller.close();
                  })
                  .on("error", (err) => {
                    console.error(err);
                    controller.error(err);
                  });
              },
            );
          } catch (error) {
            controller.error(error);
            console.error(error);
          }
        },
      }),
      {
        headers,
      },
    );
  } catch (error) {
    const e = error as Error;
    console.error(e);
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
