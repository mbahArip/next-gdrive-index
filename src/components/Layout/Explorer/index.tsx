import axios from "axios";
import gIndexConfig from "config";
import { useRouter } from "next/router";
import { poppins } from "pages/_app";
import { ReactNode, useCallback, useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";

import Breadcrumb from "components/Breadcrumb";
import Button from "components/Button";
import Markdown from "components/Markdown";

import { addNewPassword } from "utils/passwordHelper";

import { IGDriveFiles } from "types/api/files";
import { APIGetFileResponse } from "types/api/response";
import { Constant } from "types/constant";

import Header from "../Header";
import PasswordLayout from "../Password";
import ViewGrid from "./Grid";
import ViewList from "./List";

const Loading = () => (
  <div className='w-full h-auto min-h-[50vh] flex items-center justify-center'>
    <div className='flex flex-col gap-4 items-center justify-center animate-pulse'>
      <div className='w-fit h-fit relative grid place-items-center'>
        <img
          src={gIndexConfig.siteConfig.siteIcon}
          alt={gIndexConfig.siteConfig.siteName}
          className='w-12 -top-1 relative'
        />
        <div className='absolute w-12 h-12 bg-transparent border border-primary-50 rounded-full animate-ping' />
      </div>
      <span>Loading view...</span>
    </div>
  </div>
);

interface ExplorerLayoutProps {
  data: {
    file: IGDriveFiles | null;
    files: IGDriveFiles[];
    folders: IGDriveFiles[];
    pageToken: string | null;
  };
  readmeFile: string | null;
  isProtected: boolean;
  isFileProtected?: boolean;
  encryptedId?: string;
}

export default function ExplorerLayout(props: ExplorerLayoutProps) {
  const router = useRouter();
  const [data, setData] = useState<ExplorerLayoutProps["data"]>(props.data);
  const [view, setView] = useState<"grid" | "list">(() => {
    const viewType = localStorage.getItem(Constant.storage_ViewType);
    if (!viewType) {
      localStorage.setItem(Constant.storage_ViewType, "list");
      return "list";
    }
    if (viewType === "grid") {
      return "grid";
    } else {
      return "list";
    }
  });
  const [isViewLoading, setIsViewLoading] = useState<boolean>(false);
  const [isButtonLoading, setIsButtonLoading] = useState<boolean>(false);
  const [ViewComponent, setViewComponent] = useState<ReactNode>(
    <ViewList
      key={"file-explorer"}
      data={data}
      isProtected={props.isFileProtected ?? false}
    />,
  );
  const [showPasswordLayout, setShowPasswordLayout] = useState<boolean>(props.isProtected);
  const [breadcrumbPaths, setBreadcrumbPaths] = useState<Record<"label" | "path", string>[]>([]);

  useEffect(() => {
    new Promise(async (resolve) => {
      if (view === "list") {
        setViewComponent(
          <ViewList
            key={"file-explorer"}
            data={data}
            isProtected={props.isFileProtected ?? false}
          />,
        );
      } else if (view === "grid") {
        setViewComponent(
          <ViewGrid
            key={"file-explorer"}
            data={data}
            isProtected={props.isFileProtected ?? false}
          />,
        );
      }

      await new Promise((resolve) => setTimeout(resolve, 50));
      resolve(true);
    }).then(() => {
      setIsViewLoading(false);
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, data]);
  useEffect(() => {
    setShowPasswordLayout(props.isProtected);
  }, [props.isProtected]);

  useEffect(() => {
    const paths = router.asPath.split("/").filter((path) => path !== "");
    const newPaths: Record<"label" | "path", string>[] = [];
    paths.forEach((path, index) => {
      newPaths.push({
        label: path,
        path: `/${paths.slice(0, index + 1).join("/")}`,
      });
    });

    setBreadcrumbPaths(newPaths);
  }, [router]);

  const handleChangeView = useCallback(
    (view: "grid" | "list") => {
      setIsViewLoading(true);
      setView(view);
      localStorage.setItem(Constant.storage_ViewType, view);
    },
    [setView],
  );
  const handleLoadNextPage = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      setIsButtonLoading(true);
      if (!data.pageToken) {
        setIsButtonLoading(false);
        return;
      }
      const newData = await axios.get<APIGetFileResponse>("/api/getData", {
        params: {
          encryptedId: props.encryptedId,
          pageToken: data.pageToken,
        },
      });
      setData((prev) => ({
        ...prev,
        files: [...prev.files, ...newData.data.data.files],
        folders: [...prev.folders, ...newData.data.data.folders],
        pageToken: newData.data.data.pageToken,
      }));
      setIsButtonLoading(false);
    },
    [data, props.encryptedId],
  );

  return (
    <div className='w-full flex h-full flex-col gap-4 relative'>
      {/* Top */}
      <Header
        viewSelector={{ view, setView: handleChangeView }}
        showPasswordLayout={showPasswordLayout}
      />

      <div className='w-full h-px bg-primary-500' />

      {/* Header */}
      {!showPasswordLayout && (
        <div className='w-full flex relative z-10 flex-col md:flex-row items-center justify-between gap-4'>
          {/* Breadcrumb */}
          <Breadcrumb paths={breadcrumbPaths} />
        </div>
      )}

      {/* Content */}
      {showPasswordLayout ? (
        <PasswordLayout
          path={decodeURIComponent(router.asPath.split("/")[router.asPath.split("/").length - 1] ?? "/")}
          onSubmitted={(password) => {
            const cookie =
              document.cookie.split(";").find((cookie) => cookie.startsWith(`${Constant.cookies_SitePassword}=`)) ??
              undefined;
            addNewPassword(decodeURIComponent(router.asPath), password, cookie?.split("=")[1] ?? undefined);
            router.reload();
          }}
        />
      ) : (
        <div
          className={twMerge(
            "w-full relative grid grid-cols-1 tablet:grid-cols-8 desktop:grid-cols-12 gap-4",
            !props.readmeFile && "grid-cols-1 tablet:grid-cols-12 desktop:grid-cols-12",
          )}
        >
          <div
            className={twMerge(
              "col-span-full desktop:col-span-8 overflow-auto",
              !props.readmeFile && "desktop:col-span-full",
            )}
          >
            {isViewLoading ? (
              <Loading />
            ) : (
              <div className='w-full flex flex-col gap-4'>
                {data.files.length || data.folders.length ? (
                  <>{ViewComponent}</>
                ) : (
                  <div className='w-full min-h-[5rem] grid place-items-center'>
                    Can&apos;t find any files or folders in this directory
                  </div>
                )}

                {data.pageToken && (
                  <Button
                    variant='accent'
                    fullWidth
                    rounded='large'
                    className='mt-4'
                    loading={isButtonLoading}
                    onClick={handleLoadNextPage}
                  >
                    Load more...
                  </Button>
                )}
              </div>
            )}
          </div>
          {props.readmeFile && (
            <div className='col-span-full desktop:col-span-4'>
              <div
                className={`w-full flex flex-col gap-2 bg-primary-900 px-4 py-2 rounded-lg sticky top-4 overflow-auto ${poppins.className}`}
              >
                <Markdown content={props.readmeFile} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
