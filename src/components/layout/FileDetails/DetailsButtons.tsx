import { TFile } from "@/types/googleapis";
import { drive_v3 } from "googleapis";
import { MdCopyAll, MdDownload, MdOpenInBrowser } from "react-icons/md";
import Link from "next/link";
import { toast } from "react-toastify";
import config from "@config/site.config";
import { reverseString } from "@utils/hashHelper";

type Props = {
  data: TFile | drive_v3.Schema$File;
  hash?: string;
};

export default function DetailsButtons({ data, hash }: Props) {
  return (
    <div className={"flex flex-col gap-2"}>
      <Link
        href={`/api/files/${data.id}/download${
          hash ? `?hash=${reverseString(hash)}` : ""
        }`}
        target={"_blank"}
        rel={"noopener noreferrer"}
      >
        <button
          className={
            "primary flex w-full items-center justify-center gap-2 py-4 tablet:py-2"
          }
        >
          <MdDownload />
          Download file
        </button>
      </Link>
      <Link
        href={`/api/files/${data.id}/view${
          hash ? `?hash=${reverseString(hash)}` : ""
        }`}
        target={"_blank"}
        rel={"noopener noreferrer"}
      >
        <button
          className={
            "secondary flex w-full items-center justify-center gap-2 py-4 tablet:py-2"
          }
        >
          <MdOpenInBrowser />
          Open in new tab
        </button>
      </Link>
      <button
        className={`flex w-full items-center justify-center gap-2 py-4 tablet:py-2 ${
          config.files.allowDownloadProtectedWithoutAccess
            ? "secondary"
            : "danger"
        }`}
        onClick={async (e) => {
          e.preventDefault();
          if (!window.navigator) {
            toast.error("Your browser does not support this feature");
            return;
          }

          const host = window.location.host;
          const url = `${host}/api/files/${data.id}/view${
            hash ? `?hash=${reverseString(hash)}` : ""
          }`;
          await window.navigator.clipboard.writeText(url);
          toast.success("Copied to clipboard");
        }}
      >
        <MdCopyAll />
        Copy direct link
      </button>
      {hash && !config.files.allowDownloadProtectedWithoutAccess && (
        <div className={"banner warning text-sm"}>
          <div className={"flex flex-col gap-2"}>
            <div className={"font-bold"}>
              Copying the direct link will also copy the access token.
            </div>
            <p className={"text-sm"}>
              Only share the direct link with people you trust.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
