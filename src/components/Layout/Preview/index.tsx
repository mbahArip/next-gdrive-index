import { Icon } from "@iconify/react";
import gIndexConfig from "config";
import Link from "next/link";
import { useRouter } from "next/router";
import { poppins } from "pages/_app";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { twMerge } from "tailwind-merge";

import Breadcrumb from "components/Breadcrumb";
import Button from "components/Button";

import bytesToReadable from "utils/bytesFormat";
import { durationToReadable } from "utils/durationFormat";
import { decryptData } from "utils/encryptionHelper/hash";
import { generatedDownloadLink } from "utils/generateDownloadLink";
import { addNewPassword } from "utils/passwordHelper";
import { getPreviewComponent } from "utils/previewHelper";
import { createDownloadToken } from "utils/tokenHelper";

import { IGDriveFiles } from "types/api/files";
import { Constant } from "types/constant";

import PasswordLayout from "../Password";

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

interface PreviewLayoutProps {
  data: {
    file: IGDriveFiles | null;
    files: IGDriveFiles[];
    folders: IGDriveFiles[];
    pageToken: string | null;
  };
  isProtected: boolean;
  isFileProtected: boolean;
  encryptedId?: string;
}

export default function PreviewLayout(props: PreviewLayoutProps) {
  const router = useRouter();
  const [data, setData] = useState<PreviewLayoutProps["data"]>(props.data);
  const [isViewLoading, setIsViewLoading] = useState<boolean>(false);
  const [PreviewComponent, setPreviewComponent] = useState<ReactNode>();
  const [showPasswordLayout, setShowPasswordLayout] = useState<boolean>(props.isProtected);
  const [breadcrumbPaths, setBreadcrumbPaths] = useState<Record<"label" | "path", string>[]>([]);
  const [downloadToken] = useState<string | null>(() => {
    if (gIndexConfig.apiConfig.allowDownloadProtectedFile) return null;

    if (props.isFileProtected) {
      return createDownloadToken();
    } else {
      return null;
    }
  });
  const [expiredIn, setExpiredIn] = useState<string>("");

  const fileMetadata = useMemo<
    {
      key: string;
      label: string;
      value: string | number | null;
    }[]
  >(() => {
    const metadata = [];
    if (data.file) {
      if (data.file.name)
        metadata.push({
          key: "name",
          label: "Name",
          value: data.file.name,
        });
      if (data.file.mimeType)
        metadata.push({
          key: "mimeType",
          label: "Type",
          value: data.file.mimeType,
        });
      if (data.file.modifiedTime)
        metadata.push({
          key: "modifiedTime",
          label: "Last Modified",
          value: new Date(data.file.modifiedTime).toLocaleDateString("default", {
            year: "numeric",
            month: "short",
            day: "numeric",
          }),
        });
      if (data.file.size)
        metadata.push({
          key: "size",
          label: "Size",
          value: bytesToReadable(data.file.size),
        });
      if (data.file.imageMediaMetadata && data.file.imageMediaMetadata.width && data.file.imageMediaMetadata.height)
        metadata.push({
          key: "imageMediaMetadata",
          label: "Dimension",
          value: `${data.file.imageMediaMetadata.width}x${data.file.imageMediaMetadata.height}`,
        });
      if (data.file.videoMediaMetadata)
        metadata.push(
          {
            key: "videoMediaMetadata",
            label: "Dimension",
            value: `${data.file.videoMediaMetadata.width}x${data.file.videoMediaMetadata.height}`,
          },
          {
            key: "videoMediaMetadata",
            label: "Duration",
            value: durationToReadable(data.file.videoMediaMetadata.durationMillis),
          },
        );
    }

    return metadata;
  }, [data.file]);

  useEffect(() => {
    if (!downloadToken) return;
    const interval = setInterval(() => {
      const expiredAt = Number(decryptData(downloadToken));
      const date = new Date(expiredAt);
      const now = new Date();
      const diff = date.getTime() - now.getTime();

      const hours = Math.floor(diff / 1000 / 60 / 60);
      const minutes = Math.floor(diff / 1000 / 60) % 60;
      const seconds = Math.floor(diff / 1000) % 60;

      setExpiredIn(`${hours}:${minutes}:${seconds}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [downloadToken]);

  useEffect(() => {
    new Promise(async (resolve) => {
      const Preview = getPreviewComponent(props.data.file?.fileExtension ?? "unknown", props.data.file?.mimeType ?? "");
      setPreviewComponent(<Preview file={props.data.file!} />);

      await new Promise((resolve) => setTimeout(resolve, 50));
      resolve(true);
    }).then(() => {
      setIsViewLoading(false);
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);
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

  return (
    <div className='w-full flex h-full flex-col gap-4 relative'>
      {/* Top */}
      <div className='flex items-center justify-between gap-4'>
        <h1 className='text-2xl font-medium'>{gIndexConfig.siteConfig.siteName}</h1>

        {!showPasswordLayout && (
          <div className='flex items-center gap-4'>
            {/* Disable until figure out how to search from root */}
            {/* <Tooltip content='Search file'>
            <ButtonIcon
              icon='ion:search'
              variant='transparent'
            />
          </Tooltip> */}
          </div>
        )}
      </div>

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
          path={decodeURIComponent(router.asPath.split("/")[router.asPath.split("/").length - 2] ?? "/")}
          onSubmitted={(password) => {
            const cookie =
              document.cookie.split(";").find((cookie) => cookie.startsWith(`${Constant.cookies_SitePassword}=`)) ??
              undefined;
            addNewPassword(decodeURIComponent(router.asPath), password, cookie?.split("=")[1] ?? undefined);
            router.reload();
          }}
        />
      ) : (
        <div className={twMerge("w-full relative grid grid-cols-1 tablet:grid-cols-8 desktop:grid-cols-12 gap-4")}>
          <div className={twMerge("col-span-full desktop:col-span-8 overflow-auto")}>
            {isViewLoading ? (
              <Loading />
            ) : (
              <div className='w-full flex flex-col gap-4'>
                <div
                  className={`w-full flex flex-col gap-2 bg-primary-900 p-4 mb-4 rounded-lg overflow-auto ${poppins.className}`}
                >
                  {PreviewComponent}
                </div>
              </div>
            )}
          </div>
          <div className='col-span-full desktop:col-span-4'>
            <div className='sticky top-4'>
              <div
                className={`w-full flex flex-col gap-2 bg-primary-900 px-4 py-2 mb-4 rounded-lg overflow-auto ${poppins.className}`}
              >
                <div className='flex items-center gap-2'>
                  <Icon
                    icon={"ion:information-circle"}
                    className='w-6 h-6'
                  />
                  <h2 className='text-2xl font-medium'>File info</h2>
                </div>

                <div className='w-full h-px bg-primary-500' />

                <div className='flex flex-col gap-2 w-full'>
                  {fileMetadata.map((item) => (
                    <div
                      className='grid grid-cols-3'
                      key={`${item.key}-${item.label.toLowerCase()}`}
                    >
                      <span className='col-span-1 font-bold'>{item.label}</span>
                      <p className='col-span-2 break-all whitespace-pre-line'>{item.value ?? "-"}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div
                className={`w-full flex flex-col gap-2 bg-primary-900 px-4 py-2 my-4 rounded-lg overflow-auto ${poppins.className}`}
              >
                <Link
                  href={generatedDownloadLink(data.file!, props.isFileProtected, false, downloadToken)}
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  <Button
                    fullWidth
                    variant='accent'
                    startIcon={"ion:download"}
                    rounded='large'
                  >
                    Download
                  </Button>
                </Link>
                <Button
                  fullWidth
                  variant='primary'
                  startIcon={"ion:copy"}
                  rounded='large'
                  onClick={() => {
                    try {
                      const url = generatedDownloadLink(data.file!, props.isFileProtected, true, downloadToken);
                      navigator.clipboard.writeText(url);
                      toast.success("URL copied to clipboard.");
                    } catch (error: any) {
                      toast.error("Failed to copy URL to clipboard.");
                      console.error(error.message);
                    }
                  }}
                >
                  Copy URL
                </Button>
                <div className='w-full px-2 bg-primary-950 outline-none rounded-lg border border-primary-500 select-all'>
                  <div className='overflow-x-scroll py-2 whitespace-nowrap'>
                    {generatedDownloadLink(data.file!, props.isFileProtected, true, downloadToken)}
                  </div>
                </div>
                {!gIndexConfig.apiConfig.allowDownloadProtectedFile && props.isFileProtected && (
                  <span className='text-center mt-4 text-sm'>
                    This file is inside protected folder.
                    <br />
                    Download link will be expired in <b>{expiredIn}</b>.
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
