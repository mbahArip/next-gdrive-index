import { TFile } from "@/types/googleapis";
import { drive_v3 } from "googleapis";
import { MdCopyAll, MdDownload } from "react-icons/md";
import Link from "next/link";
import config from "@config/site.config";
import { useEffect, useState } from "react";
import useCopyText from "@hooks/useCopyText";

type Props = {
  data: TFile | drive_v3.Schema$File;
  hash?: string;
};

export default function DetailsButtons({ data, hash }: Props) {
  const [downloadURL, setDownloadURL] = useState<string>("");
  const [viewURL, setViewURL] = useState<string>("");
  const copyText = useCopyText();

  useEffect(() => {
    setDownloadURL(`/download/${data.id}/${data.name}`);
    setViewURL(`${window.location.host}/media/${data.id}/${data.name}`);
  }, [data]);

  return (
    <div className={"flex flex-col gap-2"}>
      <Link
        href={downloadURL}
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
      <button
        className={`flex w-full items-center justify-center gap-2 py-4 tablet:py-2 ${
          config.files.allowDownloadProtectedWithoutAccess
            ? "secondary"
            : "danger"
        }`}
        onClick={async (e) => {
          e.preventDefault();
          copyText(viewURL);
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
