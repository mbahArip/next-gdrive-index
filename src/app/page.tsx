import { Metadata } from "next";
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

export const metadata: Metadata = {
  metadataBase: new URL(apiConfig.basePath),
  title: siteConfig.siteName,
  description: siteConfig.siteDescription,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: siteConfig.siteName,
    description: siteConfig.siteDescription,
    url: `/`,
    siteName: siteConfig.siteName,
  },
  twitter: {
    title: siteConfig.siteName,
    description: siteConfig.siteDescription,
    card: "summary_large_image",
    site: siteConfig.siteName,
  },
};

async function RootPage() {
  const passwordCookies =
    cookies().get(Constant.cookiePassword)?.value || "";

  const getPathValidation = fetch(
    `${apiConfig.basePath}/api/validate`,
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

  const getFilesData = fetch(
    `${apiConfig.basePath}/api/files`,
    {
      headers: {
        Cookie: `${Constant.cookiePassword}=${passwordCookies}`,
      },
    },
  ).then(
    (res) =>
      res.json() as Promise<API_Response<FilesResponse>>,
  );

  const [pathValidation, filesData] = await Promise.all([
    getPathValidation,
    getFilesData,
  ]);

  if (!pathValidation.success) {
    const errorData = pathValidation as API_Error;
    if (errorData.code === 401) {
      const protectedPath = errorData.reason
        .split('"')[1]
        .split('"')[0];
      redirect(
        `/password?redirect=/&path=${protectedPath}`,
      );
    }
    if (errorData.code === 404) {
      notFound();
    }
    const payload = handleError(errorData);
    throw new Error(payload);
  }
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
        <Breadcrumb />
        <SwitchLayout />
      </div>

      <div
        id={"content-files"}
        className={"card"}
      >
        <FileLayout
          data={
            filesData.data
              ? filesData.data
              : { folders: [], files: [] }
          }
        />
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

export default RootPage;
