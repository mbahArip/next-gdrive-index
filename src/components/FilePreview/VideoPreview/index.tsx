import { TFile } from "@/types/googleapis";
import { drive_v3 } from "googleapis";
import ReactPlayer from "react-player";
import { useState } from "react";
import LoadingFeedback from "@components/APIFeedback/Loading";
import ErrorFeedback from "@components/APIFeedback/Error";

type Props = {
  data: TFile | drive_v3.Schema$File;
};

export default function VideoPreview({ data }: Props) {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  return (
    <div className='flex w-full items-center justify-center'>
      {isLoading ? (
        <LoadingFeedback
          message={"Loading video preview..."}
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
          isLoading || isError ? "hidden" : "block"
        } aspect-video h-full max-h-[70vh] w-full`}
      >
        <ReactPlayer
          url={`/download/${data.id}/${data.name}`}
          controls={true}
          width='100%'
          height='100%'
          onReady={() => {
            setIsLoading(false);
          }}
          onError={(error) => {
            setIsError(true);
            setErrorMessage(error.message);
          }}
        />
      </div>
    </div>
  );
}
