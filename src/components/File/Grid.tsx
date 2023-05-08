import { formatDuration } from "utils/formatHelper";
import { drive_v3 } from "googleapis";
import Link from "next/link";
import { MdPlayCircleFilled } from "react-icons/md";
import { getFileIcon, getFileType } from "utils/mimeTypesHelper";
import { BsFolderFill } from "react-icons/bs";
import { createFileId } from "utils/driveHelper";
import siteConfig from "config/site.config";

type Props = {
  data: drive_v3.Schema$File;
};

export default function GridFile({ data }: Props) {
  const isFolder = data.mimeType === "application/vnd.google-apps.folder";
  // const Icon = getMimeIcon(data.mimeType as string);
  const Icon = isFolder
    ? BsFolderFill
    : getFileIcon(data.fileExtension as string, data.mimeType as string);
  const fileType = getFileType(
    data.fileExtension as string,
    data.mimeType as string,
  );
  const allowThumbnail =
    siteConfig.files.allowThumbnailFileType.includes(fileType);

  return (
    <Link
      href={
        isFolder
          ? `/folder/${createFileId(data, true)}`
          : `/file/${createFileId(data, true)}`
      }
      key={data.id}
      className={"file"}
      title={data.name as string}
    >
      {/* Thumbnail */}
      <div
        className={`relative mx-auto grid h-40 w-full place-items-center overflow-hidden rounded-lg tablet:h-32 tablet:rounded-xl ${
          !allowThumbnail && "border border-zinc-300 dark:border-zinc-700"
        }`}
      >
        {data.thumbnailLink && allowThumbnail ? (
          <div
            className={"group relative h-full max-h-40 w-full tablet:max-h-32"}
          >
            <img
              src={data.thumbnailLink}
              alt={data.name as string}
              className={"h-full w-full bg-checkerboard-dark object-cover"}
            />
            {data.videoMediaMetadata && (
              <div
                className={
                  "absolute top-0 z-10 grid h-full w-full place-items-center"
                }
              >
                <MdPlayCircleFilled className='h-16 w-16 text-white/50 transition-colors duration-300 group-hover:text-white/80' />
                <span
                  className={
                    "absolute bottom-0 right-0 rounded bg-black/50 px-2 py-0.5 drop-shadow tablet:text-xs"
                  }
                >
                  {formatDuration(data.videoMediaMetadata.durationMillis || 0)}
                </span>
              </div>
            )}
          </div>
        ) : (
          <Icon className='h-16 w-16' />
        )}
      </div>

      {/* File name */}
      <div
        className={
          "flex-grow-1 mx-auto my-2 flex h-auto w-full flex-shrink-0 items-center gap-2"
        }
      >
        {siteConfig.files.showFileNameIcon && (
          <>
            {data.iconLink ? (
              <img
                src={data.iconLink}
                alt={"icon"}
                className='h-4 w-4 flex-shrink-0'
              />
            ) : (
              <Icon className='h-4 w-4 flex-shrink-0' />
            )}
          </>
        )}
        <span
          className={
            "line-clamp-2 h-full w-full whitespace-pre-wrap break-words text-center"
          }
        >
          {data.name}
        </span>
      </div>
    </Link>
  );
}
