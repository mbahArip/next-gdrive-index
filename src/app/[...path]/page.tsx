import { Metadata, ResolvingMetadata } from "next";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";

import Breadcrumb from "components/compBreadcrumb";
import FileLayout from "components/compFileLayout";
import CompReadmeRender from "components/compReadmeRender";
import SwitchLayout from "components/compSwitchLayout";

import { handleError } from "utils/generalHelper/axiosFetch";

import { API_Error, API_Response } from "types/api";
import { FilesResponse } from "types/api/files";
import { ValidateFilePathResponse } from "types/api/path";
import { Constant } from "types/general/constant";

import apiConfig from "config/api.config";
import siteConfig from "config/site.config";

type Props = {
  params: { path: string[] };
  searchParams: {
    [key: string]: string | string[] | undefined;
  };
};

export async function generateMetadata(
  { params, searchParams }: Props,
  parent?: ResolvingMetadata,
): Promise<Metadata> {
  const pathValidation = await fetch(
    `${apiConfig.basePath}/api/validate/${params.path.join(
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

  let pageName = siteConfig.siteName;

  if (pathValidation.success) {
    pageName = pathValidation.data?.[
      pathValidation.data?.length - 1
    ].name as string;
  }
  if (
    !pathValidation.success &&
    (pathValidation as API_Error).code === 401
  ) {
    pageName = "Protected Folder";
  }

  // optionally access and extend (rather than replace) parent metadata
  const prevMeta = (await parent) as Metadata;

  return {
    ...prevMeta,
    title: `${pageName} | ${siteConfig.siteName}`,
    openGraph: {
      title: `${pageName} | ${siteConfig.siteName}`,
      description: siteConfig.siteDescription,
      url: `/${params.path.join("/")}`,
      siteName: siteConfig.siteName,
      images: [
        {
          alt: `${pageName} | ${siteConfig.siteName}`,
          type: "image/png",
          width: 1200,
          height: 630,
          url: `/opengraph/${params.path.join("/")}`,
        },
      ],
    },
    twitter: {
      title: `${pageName} | ${siteConfig.siteName}`,
      description: siteConfig.siteDescription,
      card: "summary_large_image",
      site: siteConfig.siteName,
      images: [
        {
          alt: `${pageName} | ${siteConfig.siteName}`,
          type: "image/png",
          width: 1200,
          height: 630,
          url: `/opengraph/${params.path.join("/")}`,
        },
      ],
    },
  };
}

async function FilePage({ params }: Props) {
  const passwordCookies =
    cookies().get(Constant.cookiePassword)?.value || "";

  const pathValidation = await fetch(
    `${apiConfig.basePath}/api/validate/${params.path.join(
      "/",
    )}`,
    {
      headers: {
        Cookie: `${Constant.cookiePassword}=${passwordCookies}`,
      },
    },
  ).then(
    (res) =>
      res.json() as Promise<
        API_Response<ValidateFilePathResponse>
      >,
  );

  if (!pathValidation.success) {
    const errorData = pathValidation as API_Error;
    if (errorData.code === 401) {
      const protectedPath = errorData.reason
        .split('"')[1]
        .split('"')[0];
      redirect(
        `/password?redirect=${params.path.join(
          "/",
        )}&path=${protectedPath}`,
      );
    }
    if (errorData.code === 404) {
      notFound();
    }
    const payload = handleError(errorData);
    throw new Error(payload);
  }

  let isFolder = false;
  if (
    pathValidation.data?.[pathValidation.data?.length - 1]
      .mimeType === "application/vnd.google-apps.folder"
  ) {
    isFolder = true;
  }
  const lastId = pathValidation.data?.[
    pathValidation.data?.length - 1
  ].encryptedId as string;

  const filesData = await fetch(
    `${apiConfig.basePath}/api/files/${lastId}`,
    {
      headers: {
        Cookie: `${Constant.cookiePassword}=${passwordCookies}`,
      },
    },
  ).then(
    (res) =>
      res.json() as Promise<API_Response<FilesResponse>>,
  );
  if (!filesData.success) {
    const errorData = filesData as API_Error;
    const payload = handleError(errorData);
    throw new Error(payload);
  }

  return (
    <div
      className={
        "mx-auto flex h-full w-auto max-w-screen-xl flex-col gap-2"
      }
    >
      <div
        id={"content-head"}
        className={
          "flex w-full items-center justify-between gap-2 tablet:gap-4"
        }
      >
        <Breadcrumb data={pathValidation.data} />
        <SwitchLayout />
      </div>

      <div
        id={"content-files"}
        className={"card"}
      >
        {isFolder ? (
          <FileLayout
            data={
              filesData.data
                ? (filesData.data as FilesResponse)
                : { folders: [], files: [] }
            }
          />
        ) : (
          <span>File preview</span>
        )}
      </div>

      {filesData.data?.isReadmeExists &&
        filesData.data?.readmeContent && (
          <div
            id={"content-readme"}
            className={"card"}
          >
            <CompReadmeRender
              data={filesData.data.readmeContent}
            />
          </div>
        )}
    </div>
  );
}

export default FilePage;
