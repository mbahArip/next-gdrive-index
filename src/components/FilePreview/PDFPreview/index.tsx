import { drive_v3 } from "googleapis";
import { useState } from "react";
import config from "config/site.config";
import { createFileId } from "utils/driveHelper";
import SWRLayout from "components/layout/SWRLayout";

type Props = {
  data: drive_v3.Schema$File;
};

export default function PDFPreview({ data }: Props) {
  const fileId = createFileId(data);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const fileURL = `${process.env.NEXT_PUBLIC_DOMAIN}/api/files/${fileId}?download=1`;
  let providerURL;
  switch (config.preview.pdfProvider) {
    case "google":
      providerURL = `https://drive.google.com/viewerng/viewer?embedded=true&url=${fileURL}`;
      break;
    case "mozilla":
      providerURL = `https://mozilla.github.io/pdf.js/web/viewer.html?file=${fileURL}`;
      break;
    default:
      providerURL = `https://drive.google.com/viewerng/viewer?embedded=true&url=${fileURL}`;
      break;
  }

  return (
    <div className='flex w-full items-center justify-center'>
      <SWRLayout
        data={data}
        error={errorMessage}
        isLoading={isLoading}
      >
        <></>
      </SWRLayout>
      <div
        className={`${
          isLoading ? "hidden" : "block"
        } mx-auto h-full w-full overflow-hidden rounded-lg`}
      >
        <iframe
          width={"100%"}
          height={"100%"}
          className={"h-[50vh] tablet:h-[75vh]"}
          src={providerURL}
          title={data.name as string}
          onLoad={() => {
            setIsLoading(false);
          }}
          onError={(error: any) => {
            setErrorMessage(error.message);
            setIsLoading(false);
          }}
        />
      </div>
    </div>
  );
}
