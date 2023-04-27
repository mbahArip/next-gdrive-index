import { TFile } from "@/types/googleapis";
import { drive_v3 } from "googleapis";
import LoadingFeedback from "@components/APIFeedback/Loading";
import { formatBytes, formatDate, formatDuration } from "@utils/formatHelper";
import { useEffect, useState } from "react";
import DetailsButtons from "@components/layout/FileDetails/DetailsButtons";
import { getFilePreview } from "@utils/mimeTypesHelper";

type Props = {
  data: TFile | drive_v3.Schema$File;
  hash?: string;
};

export default function FileDetails({ data, hash }: Props) {
  const [metadata, setMetadata] = useState<{ label: string; value: string }[]>(
    [],
  );
  const [PreviewComponent, setPreviewComponent] = useState<JSX.Element | null>(
    null,
  );

  useEffect(() => {
    const Preview = getFilePreview(
      data.fileExtension as string,
      data.mimeType as string,
    );
    setPreviewComponent(
      <Preview
        data={data}
        hash={hash || ""}
      />,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (data) {
      const _metadata = [
        {
          label: "File name",
          value: (data.name as string).split(
            `.${data.fileExtension as string}`,
          )[0],
        },
        { label: "Size", value: formatBytes(data.size as string) },
        { label: "Type", value: data.mimeType as string },
        {
          label: "Created",
          value: formatDate(new Date(data.createdTime as string)),
        },
        {
          label: "Modified",
          value: formatDate(new Date(data.modifiedTime as string)),
        },
      ];
      // Insert at index 3
      if (
        data.imageMediaMetadata &&
        !(data.mimeType as string).endsWith("svg+xml")
      ) {
        const { width, height } = data.imageMediaMetadata;
        _metadata.splice(3, 0, {
          label: "Dimension",
          value: `${width || 0}px x ${height || 0}px`,
        });
      }
      if (data.videoMediaMetadata) {
        const { width, height, durationMillis } = data.videoMediaMetadata;
        _metadata.splice(3, 0, {
          label: "Dimension",
          value: `${width || 0}px x ${height || 0}px`,
        });
        _metadata.splice(4, 0, {
          label: "Duration",
          value: formatDuration(durationMillis as string),
        });
      }
      setMetadata(_metadata);
    }
  }, [data]);

  return (
    <>
      {!data ? (
        <LoadingFeedback message={"Loading file details..."} />
      ) : (
        <div className={"grid grid-cols-1 gap-4 tablet:grid-cols-4"}>
          <div className={"card h-fit tablet:col-span-3"}>
            <div className='flex w-full items-center justify-between rounded-lg'>
              <span className='font-bold'>Preview</span>
            </div>

            <div className={"divider-horizontal"} />

            {PreviewComponent}
          </div>
          <div
            className={
              "col-span-1 flex h-fit flex-col gap-2 tablet:sticky tablet:top-16"
            }
          >
            <div className={"card"}>
              <div className='flex w-full items-center justify-between rounded-lg'>
                <span className='font-bold'>Details</span>
              </div>

              <div className={"divider-horizontal"} />

              <div className='flex w-full flex-col items-center justify-center gap-4 px-2'>
                {metadata.map((item, index) => (
                  <div
                    className='flex w-full flex-col justify-center'
                    key={index}
                  >
                    <span className='font-bold text-inherit'>{item.label}</span>
                    <span className='whitespace-pre-wrap break-words text-inherit'>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className={"card"}>
              <DetailsButtons
                data={data}
                hash={hash || ""}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
