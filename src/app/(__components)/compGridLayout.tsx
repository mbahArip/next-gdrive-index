"use client";

import { drive_v3 } from "googleapis";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MdFolder, MdPlayCircle } from "react-icons/md";

import formatDuration from "utils/fileHelper/formatDuration";
import getFileIcon from "utils/fileHelper/iconMap";
import getFileGroup from "utils/fileHelper/typeMap";

import { FilesResponse } from "types/api/files";

import siteConfig from "config/site.config";

type Props = {
  data: FilesResponse;
};

function GridLayout({ data }: Props) {
  const pathname = usePathname();
  return (
    <div className={"flex h-full w-full flex-col gap-8"}>
      {data.folders.length === 0 &&
        data.files.length === 0 && (
          <div
            className={
              "w-full flex items-center justify-center py-2"
            }
          >
            <span
              className={"text-lg font-bold text-center"}
            >
              No files or folders found
            </span>
          </div>
        )}
      {data.folders.length > 0 && (
        <div
          className={
            "grid grid-cols-1 gap-4 tablet:grid-cols-4"
          }
        >
          {data.folders.map((folder) => (
            <GridFolder
              folder={folder}
              key={folder.id}
              path={
                pathname === "/" ? "" : (pathname as string)
              }
            />
          ))}
        </div>
      )}
      {data.files.length > 0 && (
        <div
          className={
            "grid grid-cols-1 gap-4 tablet:grid-cols-4"
          }
        >
          {data.files.map((file) => (
            <GridFile
              file={file}
              key={file.id}
              path={
                pathname === "/" ? "" : (pathname as string)
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

function GridFolder({
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
    >
      <div className={"file h-fit py-2"}>
        <MdFolder className={"flex-shrink-0 flex-grow-0"} />
        <div className={"line-clamp-1 w-full break-all"}>
          <span className={"flex-shrink-0 flex-grow-0"}>
            {folder.name}
          </span>
        </div>
      </div>
    </Link>
  );
}

function GridFile({
  file,
  path = "",
}: {
  file: drive_v3.Schema$File;
  path?: string;
}) {
  const Icon = getFileIcon(
    file.fileExtension ?? "",
    file.mimeType ?? "",
  );
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
    >
      <div
        className={
          "file group relative h-full flex-col items-center"
        }
      >
        {file.thumbnailLink && isThumbnailAllowed ? (
          <>
            <img
              src={file.thumbnailLink ?? ""}
              alt={file.name ?? ""}
              className={
                "relative h-52 w-full overflow-hidden rounded bg-checkerboard object-cover dark:bg-checkerboard-dark"
              }
            />
            {file.videoMediaMetadata && (
              <div
                className={
                  "absolute grid h-52 w-full place-items-center"
                }
              >
                <MdPlayCircle
                  className={
                    "global-duration h-16 w-16 opacity-75 transition-opacity group-hover:opacity-100"
                  }
                />
                {file.videoMediaMetadata.durationMillis && (
                  <div
                    className={
                      "global-duration absolute bottom-0 right-2 rounded-tl-lg bg-zinc-900 px-4 py-0.5 text-center text-sm transition-colors group-hover:bg-zinc-200 group-active:bg-zinc-50 dark:group-hover:bg-zinc-800 dark:group-active:bg-zinc-950"
                    }
                  >
                    {formatDuration(
                      file.videoMediaMetadata
                        .durationMillis,
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div
            className={
              "grid h-52 w-full place-items-center overflow-hidden rounded"
            }
          >
            <Icon className={"h-20 w-20"} />
          </div>
        )}
        <div
          className={
            "relative my-auto flex w-full items-center gap-4"
          }
        >
          <img
            src={file.iconLink ?? ""}
            alt={file.name ?? ""}
            className={"h-4 w-4"}
          />
          <div className={"line-clamp-2 w-full break-all"}>
            <span className={"flex-shrink-0 flex-grow-0"}>
              {file.name}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default GridLayout;
