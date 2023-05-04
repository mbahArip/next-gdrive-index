import { drive_v3 } from "googleapis";
import Link from "next/link";
import { formatBytes, formatDate } from "utils/formatHelper";
import { toast } from "react-toastify";
import { MdContentCopy, MdDownload } from "react-icons/md";
import { getFileIcon } from "utils/mimeTypesHelper";
import { BsFolderFill } from "react-icons/bs";

type Props = {
  data: drive_v3.Schema$File;
};

function CopyButton({ url, isFolder }: { url: string; isFolder: boolean }) {
  return (
    <button
      className={"p-2"}
      title={isFolder ? "Copy folder link" : "Copy raw file link"}
      onClick={async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!navigator.clipboard) {
          toast.error("Your browser doesn't support clipboard API");
          return;
        }

        try {
          const host = window.location.host;
          const copyUrl = isFolder ? host + url : host + url + "/view";
          await navigator.clipboard.writeText(copyUrl);
          toast.success(
            isFolder ? "Folder link copied" : "Raw file link copied",
          );
        } catch (error: any) {
          toast.error("Failed to copy to clipboard");
          console.error(error.message);
        }
      }}
    >
      <MdContentCopy />
    </button>
  );
}
function DownloadButton({
  fileId,
  fileName,
}: {
  fileId: string;
  fileName: string;
}) {
  return (
    <button
      className={"p-2"}
      onClick={async (e) => {
        e.preventDefault();
        e.stopPropagation();

        window.open(`/download/${fileId}/${fileName}`, "_self");
        toast.info("Downloading file...");
      }}
    >
      <MdDownload />
    </button>
  );
}

export default function ListFile({ data }: Props) {
  const isFolder = data.mimeType === "application/vnd.google-apps.folder";
  const Icon = isFolder
    ? BsFolderFill
    : getFileIcon(data.fileExtension as string, data.mimeType as string);
  if (!data) return null;

  return (
    <Link
      href={isFolder ? `/folder/${data.id}` : `/file/${data.id}`}
      key={data.id}
      className={
        "col-span-full grid grid-cols-1 gap-2 rounded-lg px-4 py-2 hover:bg-zinc-300 dark:hover:bg-zinc-700 tablet:grid-cols-8"
      }
    >
      <div className={"flex w-full items-center gap-4 tablet:col-span-4"}>
        <Icon className={"h-4 w-4 flex-shrink-0"} />
        <span className={"line-clamp-1 block w-auto flex-grow-0"}>
          {data.name}
        </span>
      </div>
      <div className={"hidden tablet:col-span-2 tablet:block"}>
        {formatDate(new Date(data.modifiedTime as string))}
      </div>
      <div className={"hidden tablet:block"}>
        {isFolder ? "" : formatBytes(data.size as string)}
      </div>
      <div className={"hidden gap-2 tablet:flex"}>
        <CopyButton
          url={isFolder ? `/folder/${data.id}` : `/file/${data.id}`}
          isFolder={isFolder}
        />
        {isFolder ? null : (
          <DownloadButton
            fileId={data.id as string}
            fileName={data.name as string}
          />
        )}
      </div>
    </Link>
  );
}
