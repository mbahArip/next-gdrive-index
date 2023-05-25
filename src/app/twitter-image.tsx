import { ImageResponse } from "next/server";

import { Constant } from "types/general/constant";

import apiConfig from "config/api.config";
import siteConfig from "config/site.config";

export const runtime = "edge";

export const alt = siteConfig.siteName;
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  const fetchBannerData = fetch(
    `${apiConfig.basePath}/api/files`,
    {
      headers: {
        [Constant.cookieMaster]: process.env
          .MASTER_KEY as string,
      },
    },
  ).then((res) => res.json());
  const fetchFontBold = fetch(
    `${apiConfig.basePath}/fonts/Exo2-Bold.ttf`,
  ).then((res) => res.arrayBuffer());
  const fetchFontRegular = fetch(
    `${apiConfig.basePath}/fonts/Exo2-Regular.ttf`,
  ).then((res) => res.arrayBuffer());

  const [dataFetch, fontBold, fontRegular] =
    await Promise.all([
      fetchBannerData,
      fetchFontBold,
      fetchFontRegular,
    ]);

  if (!dataFetch.data.isBannerExists) {
    return new ImageResponse(
      (
        <img
          src={`${apiConfig.basePath}/og.png`}
          alt={alt}
          className={"h-full w-full object-cover"}
        />
      ),
      {
        ...size,
      },
    );
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
            src={`${apiConfig.basePath}/api/files?banner=1`}
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
              src={`${apiConfig.basePath}/favicon.svg`}
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
            {siteConfig.siteName}
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
            {siteConfig.siteDescription}
          </div>
        </div>
        <div tw='flex items-center justify-center rounded-l-lg overflow-hidden h-4/5 my-auto w-3/5 ml-auto'>
          <img
            src={`${apiConfig.basePath}/api/files?banner=1`}
            alt={""}
            tw='w-full shadow-xl rounded-lg'
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
      ...size,
      fonts: [
        {
          name: "Exo2",
          data: fontRegular,
          weight: 400,
          style: "normal",
        },
        {
          name: "Exo2",
          data: fontBold,
          weight: 700,
          style: "normal",
        },
      ],
    },
  );
}
