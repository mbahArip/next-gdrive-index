import { drive_v3 } from "googleapis";
import Link from "next/link";
import { formatBytes, formatDate } from "utils/formatHelper";
import { MdContentCopy, MdDownload } from "react-icons/md";
import { getFileIcon } from "utils/mimeTypesHelper";
import { BsFolderFill } from "react-icons/bs";
import siteConfig from "config/site.config";
import { createFileId } from "utils/driveHelper";
import useCopyText from "hooks/useCopyText";

type Props = {
  data: drive_v3.Schema$File;
};

export default function ListFile({ data }: Props) {
  const isFolder = data.mimeType === "application/vnd.google-apps.folder";
  const Icon = isFolder
    ? BsFolderFill
    : getFileIcon(data.fileExtension as string, data.mimeType as string);
  const copyText = useCopyText();

  if (!data) return null;

  return (
    <Link
      href={
        isFolder
          ? `/folder/${createFileId(data, true)}`
          : `/file/${createFileId(data, true)}`
      }
      key={data.id}
      className={
        "col-span-full grid grid-cols-1 gap-2 rounded-lg px-4 py-2 hover:bg-zinc-300 dark:hover:bg-zinc-700 tablet:grid-cols-8"
      }
    >
      <div className={"flex w-full items-center gap-4 tablet:col-span-4"}>
        {siteConfig.files.listUseFileIcon ? (
          <img
            src={data.iconLink as string}
            alt={"icon"}
            className={"h-4 w-4 flex-shrink-0 flex-grow-0"}
          />
        ) : (
          <Icon className={"h-4 w-4 flex-shrink-0 flex-grow-0"} />
        )}
        <div className={"line-clamp-1 flex w-full flex-col"}>
          <span
            className={
              "line-clamp-1 w-auto flex-grow-0 overflow-hidden break-words"
            }
          >
            {data.name}
          </span>
          <div className={"flex tablet:hidden"}>
            <span className={"text-xs"}>
              {formatDate(new Date(data.modifiedTime as string))}
            </span>
            {siteConfig.files.listMobileShowFileSize && (
              <span className={"text-xs"}>
                {isFolder ? "" : ` ・ ${formatBytes(data.size as string)}`}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className={"hidden tablet:col-span-2 tablet:block"}>
        {formatDate(new Date(data.modifiedTime as string))}
      </div>
      <div className={"hidden tablet:block"}>
        {isFolder ? "" : formatBytes(data.size as string)}
      </div>
      <div className={"hidden gap-2 tablet:flex"}>
        <button
          className={"p-2"}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            copyText(
              isFolder
                ? `${process.env.NEXT_PUBLIC_DOMAIN}/folder/${createFileId(
                    data,
                    true,
                  )}`
                : `${process.env.NEXT_PUBLIC_DOMAIN}/file/${createFileId(
                    data,
                    true,
                  )}`,
            );
          }}
        >
          <MdContentCopy />
        </button>
        {!isFolder && (
          <Link
            href={`/api/files/${createFileId(data, true)}?download=1`}
            target={"_blank"}
            rel={"noopener noreferrer"}
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <button className={"p-2"}>
              <MdDownload />
            </button>
          </Link>
        )}
      </div>
    </Link>
  );
}
