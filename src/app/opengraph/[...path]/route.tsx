import {
  ImageResponse,
  NextRequest,
  NextResponse,
} from "next/server";

import createErrorPayload from "utils/apiHelper/createErrorPayload";
import ExtendedError from "utils/generalHelper/extendedError";

import { API_Response } from "types/api";
import {
  FileResponse,
  FilesResponse,
} from "types/api/files";
import {
  FilePath,
  ValidateFilePathResponse,
} from "types/api/path";
import { RequestContext } from "types/general";
import { Constant } from "types/general/constant";

import apiConfig from "config/api.config";
import siteConfig from "config/site.config";

export const runtime = "edge";

export const alt = siteConfig.siteName;
export const size = {
  width: 1200,
  height: 630,
};

export async function GET(
  request: NextRequest,
  { params }: RequestContext<"path", string[]>,
) {
  const _start = Date.now();
  const { path } = params;

  try {
    const pathValidation = await fetch(
      `${apiConfig.basePath}/api/validate/${path.join(
        "/",
      )}`,
      {
        headers: {
          [Constant.cookieMaster]: process.env
            .MASTER_KEY as string,
        },
      },
    ).then(
      (res) =>
        res.json() as Promise<
          API_Response<ValidateFilePathResponse>
        >,
    );
    if (!pathValidation.success) {
      throw new ExtendedError(
        Constant.apiFileNotFound,
        404,
        "notFound",
        "Can't find the file you're looking for.",
      );
    }

    const targetFile = pathValidation.data?.[
      pathValidation.data.length - 1
    ] as FilePath;

    const fetchFile = fetch(
      `${apiConfig.basePath}/api/files/${targetFile.encryptedId}`,
      {
        headers: {
          [Constant.cookieMaster]: process.env
            .MASTER_KEY as string,
        },
      },
    ).then(
      (res) =>
        res.json() as Promise<
          API_Response<FilesResponse | FileResponse>
        >,
    );
    const fetchFontBold = fetch(
      `${apiConfig.basePath}/fonts/Exo2-Bold.ttf`,
    ).then((res) => res.arrayBuffer());
    const fetchFontRegular = fetch(
      `${apiConfig.basePath}/fonts/Exo2-Regular.ttf`,
    ).then((res) => res.arrayBuffer());

    const [file, fontBold, fontRegular] = await Promise.all(
      [fetchFile, fetchFontBold, fetchFontRegular],
    );

    if (
      targetFile.mimeType ===
        "application/vnd.google-apps.folder" &&
      !(file.data as FilesResponse).isBannerExists
    ) {
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
              src={`${apiConfig.basePath}/api/files/${targetFile.encryptedId}?banner=1&thumbnail=1`}
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
              {targetFile.name}
            </div>
          </div>
          <div tw='flex items-center justify-center rounded-l-lg overflow-hidden h-4/5 my-auto w-3/5 ml-auto'>
            <img
              src={`${apiConfig.basePath}/api/files/${targetFile.encryptedId}?banner=1&thumbnail=1`}
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
  } catch (error: any) {
    const payload = createErrorPayload(
      error,
      "GET /opengraph",
      _start,
    );
    return NextResponse.json(payload, {
      status: payload.code,
    });
  }
}
