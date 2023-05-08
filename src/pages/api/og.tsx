import { ImageResponse } from "@vercel/og";
import siteConfig from "config/site.config";
import { NextRequest } from "next/server";

export const config = {
  runtime: "edge",
};

const fontBold = fetch(
  new URL("../../../public/fonts/Exo2-Bold.ttf", import.meta.url),
).then((res) => res.arrayBuffer());
const fontRegular = fetch(
  new URL("../../../public/fonts/Exo2-Regular.ttf", import.meta.url),
).then((res) => res.arrayBuffer());

export default async function handler(request: NextRequest) {
  try {
    const exoFont = await fontRegular;
    const exoFontBold = await fontBold;

    const { searchParams } = new URL(request.url);

    const siteName = searchParams.get("siteName") || siteConfig.siteName;
    const fileId = searchParams.get("fileId") || null;
    const fileName =
      searchParams.get("fileName") || fileId?.split(":")[0] || null;
    const fileExt = fileName?.split(".").pop() || null;

    const isImage = ["jpg", "jpeg", "png", "gif", "webp"].includes(
      fileExt || "",
    );

    let fileImage;
    if (fileId && isImage) {
      await fetch(
        `${process.env.NEXT_PUBLIC_DOMAIN}/api/files/${fileId}?download=1`,
      )
        .then((res) => {
          if (res.headers.get("content-type")?.startsWith("image")) {
            return { success: true };
          }
          return res.json();
        })
        .then((data) => {
          if (!data.success) {
            throw new Error("File not found");
          }
          fileImage = `${process.env.NEXT_PUBLIC_DOMAIN}/api/files/${fileId}?download=1`;
        })
        .catch((err) => {
          throw new Error(err);
        });
    } else if (fileId && !isImage) {
      await fetch(
        `${process.env.NEXT_PUBLIC_DOMAIN}/api/files/${fileId}?thumbnail=1`,
      )
        .then((res) => {
          if (res.headers.get("content-type")?.startsWith("image")) {
            return { success: true };
          }
          return res.json();
        })
        .then((data) => {
          if (!data.success) {
            throw new Error("File not found");
          }
          fileImage = `${process.env.NEXT_PUBLIC_DOMAIN}/api/files/${fileId}?thumbnail=1`;
        })
        .catch((err) => {
          throw new Error(err);
        });
    } else {
      throw new Error("Default image");
    }

    return new ImageResponse(
      (
        <div
          tw='flex w-full h-full relative bg-zinc-900 text-zinc-50'
          style={{
            fontFamily: "Exo2",
          }}
        >
          <div
            tw='absolute flex w-full h-full opacity-25'
            style={{
              width: "120%",
              height: "120%",
              filter: "blur(5px)",
            }}
          >
            <img
              src={fileImage}
              alt={""}
              width={1250}
              height={680}
              style={{
                objectFit: "cover",
              }}
            />
          </div>
          <div tw='flex flex-col items-start max-w-2/5 w-full h-4/5 my-auto justify-start p-8'>
            <div tw='flex items-center justify-center w-full'>
              <img
                src={`${process.env.NEXT_PUBLIC_DOMAIN}${siteConfig.siteIcon}`}
                alt={""}
                tw='w-12 h-12 mb-4'
              />
            </div>
            <div
              tw='font-bold text-5xl flex items-center justify-center w-full'
              style={{
                fontWeight: 700,
              }}
            >
              {siteName}
            </div>
            <div
              tw='text-3xl py-8'
              style={{
                letterSpacing: "0",
                display: "flex",
                whiteSpace: "pre-wrap",
                width: "100%",
                wordBreak: "break-word",
              }}
            >
              {fileName}
            </div>
          </div>
          <div tw='flex items-center justify-center rounded-l-3xl overflow-hidden h-4/5 my-auto w-3/5 ml-auto'>
            <img
              src={fileImage}
              alt={""}
              tw='w-full shadow-xl rounded-3xl'
              width={1200}
              height={630}
              style={{
                objectFit: "cover",
              }}
            />
          </div>

          <div tw='absolute flex items-center bottom-4 w-full justify-center text-xl'>
            <div>Powered by</div>
            <img
              src={`${process.env.NEXT_PUBLIC_DOMAIN}/logo.svg`}
              alt={""}
              tw='w-8 h-8 ml-2'
            />
            <div
              tw='font-bold'
              style={{
                fontWeight: 700,
              }}
            >
              next-gdrive-index
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        fonts: [
          {
            name: "Exo2",
            data: exoFont,
            weight: 400,
            style: "normal",
          },
          {
            name: "Exo2",
            data: exoFontBold,
            weight: 700,
            style: "normal",
          },
        ],
      },
    );
  } catch (e) {
    return new ImageResponse(
      (
        <div
          tw='flex w-full h-full relative bg-zinc-900 text-zinc-50'
          style={{
            fontFamily: "Exo2",
          }}
        >
          <img
            src={`${process.env.NEXT_PUBLIC_DOMAIN}/og.png`}
            alt={""}
            width={1200}
          />
        </div>
      ),
      {
        width: 1200,
        height: 630,
      },
    );
  }
}
