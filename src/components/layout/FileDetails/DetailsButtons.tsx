import { TFile } from "@/types/googleapis";
import { drive_v3 } from "googleapis";
import { MdCopyAll, MdDownload, MdOpenInBrowser } from "react-icons/md";
import Link from "next/link";
import { toast } from "react-toastify";

type Props = {
  data: TFile | drive_v3.Schema$File;
};

export default function DetailsButtons({ data }: Props) {
  return (
    <div className={"flex flex-col gap-2"}>
      <Link
        href={`/api/files/${data.id}/download`}
        className={
          "flex w-full items-center justify-center gap-2 rounded-lg bg-blue-500 py-4 text-center text-zinc-100 dark:bg-blue-400 tablet:py-2"
        }
        target={"_blank"}
        rel={"noopener noreferrer"}
      >
        <MdDownload />
        Download file
      </Link>
      <Link
        href={`/api/files/${data.id}/view`}
        className={
          "flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-500 py-4 text-center text-zinc-100 dark:bg-zinc-500 tablet:py-2"
        }
        target={"_blank"}
        rel={"noopener noreferrer"}
      >
        <MdOpenInBrowser />
        Open in new tab
      </Link>
      <Link
        href={``}
        className={
          "flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-500 py-4 text-center text-zinc-100 dark:bg-zinc-500 tablet:py-2"
        }
        target={"_blank"}
        rel={"noopener noreferrer"}
        onClick={async (e) => {
          e.preventDefault();
          if (!window.navigator) {
            toast.error("Your browser does not support this feature");
            return;
          }

          const host = window.location.host;
          const url = `${host}/api/files/${data.id}/view`;
          await window.navigator.clipboard.writeText(url);
          toast.success("Copied to clipboard");
        }}
      >
        <MdCopyAll />
        Copy direct link
      </Link>
    </div>
  );
}
