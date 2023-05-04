import { TFile } from "types/googleapis";
import { drive_v3 } from "googleapis";
import { useState } from "react";
import config from "config/site.config";
import LoadingFeedback from "components/APIFeedback/Loading";
import ErrorFeedback from "components/APIFeedback/Error";

type Props = {
  data: TFile | drive_v3.Schema$File;
};

export default function PDFPreview({ data }: Props) {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const fileURL = `${process.env.NEXT_PUBLIC_DOMAIN}/api/files/${data.id}/download`;
  let providerURL;
  switch (config.preview.pdfProvider) {
    case "google":
      providerURL = `https://drive.google.com/viewerng/viewer?embedded=true&url=${fileURL}`;
      break;
    case "microsoft":
      providerURL = `https://view.officeapps.live.com/op/embed.aspx?src=${fileURL}`;
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
      {isLoading ? (
        <LoadingFeedback
          message={"Loading PDF preview..."}
          useContainer={false}
        />
      ) : isError ? (
        <ErrorFeedback
          message={errorMessage}
          useContainer={false}
        />
      ) : (
        <></>
      )}
      <div
        className={`${
          isLoading || isError ? "hidden" : "flex"
        } mx-auto min-h-[70vh] w-full overflow-hidden rounded-lg`}
      >
        <iframe
          width={"100%"}
          className={"h-auto"}
          src={providerURL}
          title={data.name as string}
          onLoad={() => {
            setIsLoading(false);
          }}
          onError={(error: any) => {
            setIsError(true);
            setErrorMessage(error.message);
            setIsLoading(false);
          }}
        />
      </div>
    </div>
  );
}
