import { GetServerSideProps } from "next";
import axios from "axios";
import { ErrorResponse, FileResponse } from "types/googleapis";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { urlDecrypt } from "utils/encryptionHelper";
import DefaultLayout from "components/layout/DefaultLayout";
import { NextSeo } from "next-seo";
import SWRLayout from "components/layout/SWRLayout";
import { getFilePreview, getFileType } from "utils/mimeTypesHelper";
import {
  capitalize,
  formatBytes,
  formatDate,
  formatDuration,
} from "utils/formatHelper";
import Link from "next/link";
import useCopyText from "hooks/useCopyText";

type Props = {
  id: string;
  fileName: string;
};
type Metadata = {
  label: string;
  value: string;
};
export default function File({ id, fileName }: Props) {
  const [data, setData] = useState<FileResponse>();
  const [PreviewComponent, setPreviewComponent] = useState<JSX.Element>();
  const [metadata, setMetadata] = useState<Metadata[]>([]);

  const copyLink = useCopyText();

  /**
   * ===========================
   * START - fetch file data
   * ===========================
   */
  const {
    data: swrData,
    error,
    isLoading,
  } = useSWR<FileResponse, ErrorResponse>(`/api/files/${id}`);

  useEffect(() => {
    if (swrData) {
      const decryptedData: FileResponse = {
        ...swrData,
        file: {
          ...swrData.file,
          id: urlDecrypt(swrData.file.id as string),
          webContentLink: urlDecrypt(swrData.file.webContentLink as string),
        },
      };
      setData(decryptedData);
    }
  }, [swrData]);
  /**
   * ===========================
   * END - fetch file data
   * ===========================
   */

  useEffect(() => {
    if (data) {
      const Preview = getFilePreview(
        data.file.fileExtension as string,
        data.file.mimeType as string,
      );
      setPreviewComponent(<Preview data={data.file} />);

      const defaultMetadata: Metadata[] = [
        {
          label: "Name",
          value: data.file.name as string,
        },
        {
          label: "Type",
          value: capitalize(
            getFileType(
              data.file.fileExtension as string,
              data.file.mimeType as string,
            ),
          ),
        },
        {
          label: "Size",
          value: formatBytes(data.file.size as string),
        },
        {
          label: "Created",
          value: formatDate(new Date(data.file.createdTime as string)),
        },
        {
          label: "Modified",
          value: formatDate(new Date(data.file.modifiedTime as string)),
        },
      ];
      if (data.file.imageMediaMetadata) {
        defaultMetadata.push({
          label: "Dimensions",
          value: `${data.file.imageMediaMetadata.width} x ${data.file.imageMediaMetadata.height}`,
        });
      }
      if (data.file.videoMediaMetadata) {
        defaultMetadata.push({
          label: "Duration",
          value: formatDuration(
            data.file.videoMediaMetadata.durationMillis as string,
          ),
        });
      }
      setMetadata(defaultMetadata);
    }
  }, [data]);

  return (
    <DefaultLayout
      fileId={id}
      renderSwitchLayout={false}
    >
      <NextSeo
        title={`Viewing ${fileName.split(".").slice(0, -1).join(".")}`}
        openGraph={{
          title: fileName.split(".").slice(0, -1).join("."),
          description: `Viewing ${fileName.split(".").slice(0, -1).join(".")}`,
          url: `${process.env.NEXT_PUBLIC_DOMAIN}/file/${encodeURIComponent(
            id,
          )}`,
          images: [
            {
              url: `${
                process.env.NEXT_PUBLIC_DOMAIN
              }/api/og?fileId=${encodeURIComponent(id)}`,
              alt: fileName,
              width: 1200,
              height: 630,
            },
          ],
        }}
      />
      <SWRLayout
        data={data}
        error={error}
        isLoading={isLoading}
      >
        <div
          className={
            "relative grid grid-cols-1 gap-2 tablet:grid-cols-4 tablet:gap-4"
          }
        >
          {/*  File Preview  */}
          <div className={"card h-fit tablet:col-span-3"}>
            <div className='flex w-full items-center justify-between rounded-lg'>
              <span className='font-bold'>Preview</span>
            </div>

            <div className={"divider-horizontal"} />

            {PreviewComponent}
          </div>

          {/*  Details and download  */}
          <div
            className={
              "sticky top-16 flex h-fit flex-col gap-2 max-tablet:flex-col-reverse tablet:col-span-1 tablet:gap-4"
            }
          >
            <div className={"card"}>
              <div className='flex w-full items-center justify-between rounded-lg'>
                <span className='font-bold'>Details</span>
              </div>

              <div className={"divider-horizontal"} />

              {metadata.map((item, index) => (
                <div
                  key={`fileDetails-${index}`}
                  className={"mb-2 flex w-full flex-col justify-center"}
                >
                  <span className={"font-bold text-inherit"}>{item.label}</span>
                  <span
                    className={"whitespace-pre-wrap break-words text-inherit"}
                  >
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
            <div className={"card"}>
              <div className='flex w-full items-center justify-between rounded-lg'>
                <span className='font-bold'>Download</span>
              </div>

              <div className={"divider-horizontal"} />

              <div className={"flex w-full flex-col justify-center gap-2"}>
                <Link
                  href={`/api/files/${id}?download=1`}
                  className={"w-full"}
                  target={"_blank"}
                  rel={"noopener noreferrer"}
                >
                  <button className={"primary w-full"}>Download</button>
                </Link>
                <button
                  className={"secondary"}
                  onClick={() => {
                    copyLink(
                      `${process.env.NEXT_PUBLIC_DOMAIN}/api/files/${id}?download=1`,
                    );
                  }}
                >
                  Copy direct link
                </button>
              </div>
            </div>
          </div>
        </div>
      </SWRLayout>
    </DefaultLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.query;

  const fetchFileMetadata = await axios.get<FileResponse>(
    `${process.env.NEXT_PUBLIC_DOMAIN}/api/files/${id}`,
  );
  if (!fetchFileMetadata.data.success) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      id,
      fileName: fetchFileMetadata.data.file.name,
    },
  };
};
