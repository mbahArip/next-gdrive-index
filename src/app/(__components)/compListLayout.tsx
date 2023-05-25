"use client";

import { drive_v3 } from "googleapis";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MdContentCopy,
  MdDownload,
  MdFolder,
  MdPlayCircle,
} from "react-icons/md";

import useCopyText from "hooks/useCopyText";
import formatDate from "utils/fileHelper/formatDate";
import formatSize from "utils/fileHelper/formatSize";
import getFileGroup from "utils/fileHelper/typeMap";

import { FilesResponse } from "types/api/files";
import { Constant } from "types/general/constant";

import apiConfig from "config/api.config";
import siteConfig from "config/site.config";

type Props = {
  data: FilesResponse;
};

function ListLayout({ data }: Props) {
  const pathname = usePathname();
  return (
    <div className={"flex h-full w-full flex-col gap-4"}>
      <div className={"flex flex-col gap-2"}>
        <div
          className={
            "grid grid-cols-4 p-2 tablet:grid-cols-12"
          }
        >
          <span
            role={"columnheader"}
            className={
              "col-span-3 font-bold tablet:col-span-7"
            }
          >
            Name
          </span>
          <span
            role={"columnheader"}
            className={
              "hidden text-center font-bold tablet:col-span-2 tablet:block"
            }
          >
            Modified At
          </span>
          <span
            role={"columnheader"}
            className={
              "hidden text-center font-bold tablet:col-span-1 tablet:block"
            }
          >
            Size
          </span>
          <span
            role={"columnheader"}
            className={
              "hidden text-center font-bold tablet:col-span-1 tablet:block"
            }
          >
            Type
          </span>
          <span
            role={"columnheader"}
            className={
              "col-span-1 text-center font-bold tablet:col-span-1"
            }
          >
            Actions
          </span>
        </div>
        <div className={"divider-horizontal"} />
        <div className={"flex w-full flex-col"}>
          {data.folders.length === 0 &&
            data.files.length === 0 && (
              <div
                className={
                  "col-span-full flex items-center justify-center py-2"
                }
              >
                <span
                  className={
                    "text-lg font-bold text-center"
                  }
                >
                  No files or folders found
                </span>
              </div>
            )}
          {data.folders.length > 0 && (
            <>
              {data.folders.map((folder) => (
                <ListFolder
                  folder={folder}
                  key={`list-${folder.id}`}
                  path={
                    pathname === "/"
                      ? ""
                      : (pathname as string)
                  }
                />
              ))}
            </>
          )}
          {data.files.length > 0 && (
            <>
              {data.files.map((file) => (
                <ListFile
                  file={file}
                  key={`list-${file.id}`}
                  path={
                    pathname === "/"
                      ? ""
                      : (pathname as string)
                  }
                />
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function ListFolder({
  folder,
  path = "",
}: {
  folder: drive_v3.Schema$File;
  path?: string;
}) {
  const folderURL = `${path}/${encodeURIComponent(
    folder.name ?? "",
  )}`;
  return (
    <Link
      href={folderURL}
      title={folder.name ?? ""}
      className={"w-full"}
    >
      <div
        className={
          "file-list grid w-full grid-cols-4 py-2 tablet:grid-cols-12"
        }
      >
        <span
          className={
            "col-span-3 flex items-center gap-2 tablet:col-span-7"
          }
        >
          <MdFolder
            className={
              "aspect-square h-8 w-8 flex-shrink-0 flex-grow-0 rounded object-contain p-1"
            }
          />
          <div className={"line-clamp-1 w-full break-all"}>
            <span className={"flex-shrink-0 flex-grow-0"}>
              {folder.name}
            </span>
          </div>
        </span>
        <span
          className={
            "hidden text-center tablet:col-span-2 tablet:block"
          }
        >
          {formatDate(new Date(folder.modifiedTime ?? ""))}
        </span>
        <span
          className={
            "hidden text-center tablet:col-span-1 tablet:block"
          }
        >
          {folder.size ? formatSize(folder.size) : "-"}
        </span>
        <span
          className={
            "hidden text-center tablet:col-span-1 tablet:block"
          }
        >
          {Constant.type_folder}
        </span>
        <span
          className={
            "col-span-1 text-center tablet:col-span-1"
          }
        >
          <Action path={folderURL} />
        </span>
      </div>
    </Link>
  );
}

function ListFile({
  file,
  path = "",
}: {
  file: drive_v3.Schema$File;
  path?: string;
}) {
  const fileGroup = getFileGroup(
    file.fileExtension ?? "",
    file.mimeType ?? "",
  );
  const isThumbnailAllowed =
    siteConfig.files.allowThumbnailFileType.includes(
      fileGroup,
    );
  const fileURL = `${path}/${encodeURIComponent(
    file.name ?? "",
  )}`;

  return (
    <Link
      href={fileURL}
      title={file.name ?? ""}
      className={"w-full"}
    >
      <div
        className={
          "file-list group grid w-full grid-cols-4 items-center justify-center py-2 tablet:grid-cols-12"
        }
      >
        <span
          className={
            "col-span-3 flex items-center gap-2 tablet:col-span-7"
          }
        >
          {file.thumbnailLink && isThumbnailAllowed ? (
            <div className={"relative"}>
              <img
                src={file.thumbnailLink}
                alt={file.name ?? ""}
                className={
                  "relative aspect-square h-8 w-8 flex-shrink-0 flex-grow-0 rounded bg-checkerboard object-cover dark:bg-checkerboard-dark"
                }
              />
              {file.videoMediaMetadata && (
                <div
                  className={
                    "absolute inset-0 flex items-center justify-center"
                  }
                >
                  <MdPlayCircle
                    className={
                      "global-duration h-6 w-6 opacity-75 transition-opacity group-hover:opacity-100"
                    }
                  />
                </div>
              )}
            </div>
          ) : (
            <img
              src={file.iconLink ?? ""}
              alt={file.name ?? ""}
              className={
                "aspect-square h-8 w-8 flex-shrink-0 flex-grow-0 rounded object-contain p-2"
              }
            />
          )}
          <div
            className={
              "line-clamp-1 w-full flex-grow-0 break-all"
            }
          >
            <span className={"flex-shrink-0 flex-grow-0"}>
              {file.name}
            </span>
          </div>
        </span>
        <span
          className={
            "hidden text-center tablet:col-span-2 tablet:block"
          }
        >
          {formatDate(new Date(file.modifiedTime ?? ""))}
        </span>
        <span
          className={
            "hidden text-center tablet:col-span-1 tablet:block"
          }
        >
          {file.size ? formatSize(file.size) : "-"}
        </span>
        <span
          className={`hidden text-center capitalize tablet:col-span-1 tablet:block`}
        >
          {Constant[`type_${fileGroup}`] ??
            Constant.type_default}
        </span>
        <span
          className={
            "col-span-1 text-center tablet:col-span-1"
          }
        >
          <Action
            path={fileURL}
            isDownloadable={true}
          />
        </span>
      </div>
    </Link>
  );
}

function Action({
  path = "",
  isDownloadable = false,
}: {
  path?: string;
  isDownloadable?: boolean;
}) {
  const copyLink = useCopyText();
  let url: string = apiConfig.basePath;
  if (path) {
    url += path;
  }
  if (path && isDownloadable) {
    url += `/download${path}`;
  }
  return (
    <div
      className={
        "flex w-full items-center justify-center gap-2"
      }
    >
      <div
        role={"button"}
        className={
          "global-duration grid aspect-square h-8 w-8 cursor-pointer place-items-center rounded-full p-1 transition-colors hover:bg-zinc-300 active:bg-zinc-400 dark:hover:bg-zinc-700 dark:active:bg-zinc-600"
        }
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          copyLink(url);
        }}
      >
        <MdContentCopy
          title={"Copy raw link"}
          className={
            "h-6 w-6 opacity-75 transition-opacity group-hover:opacity-100"
          }
        />
      </div>
      {isDownloadable && (
        <Link
          title={"Download"}
          href={url}
          target={"_blank"}
          rel={"noopener noreferrer"}
          onClick={(e) => {
            e.stopPropagation();
          }}
          className={
            "global-duration grid aspect-square h-8 w-8 cursor-pointer place-items-center rounded-full p-1 transition-colors hover:bg-zinc-300 active:bg-zinc-400 dark:hover:bg-zinc-700 dark:active:bg-zinc-600"
          }
        >
          <MdDownload
            className={
              "h-6 w-6 opacity-75 transition-opacity group-hover:opacity-100"
            }
          />
        </Link>
      )}
    </div>
  );
}

export default ListLayout;
