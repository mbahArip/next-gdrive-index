import { TFile } from "types/googleapis";
import { drive_v3 } from "googleapis";
import { useEffect, useState } from "react";
import config from "config/site.config";
import LoadingFeedback from "components/APIFeedback/Loading";
import ErrorFeedback from "components/APIFeedback/Error";
import H5AudioPlayer from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";

type Props = {
  data: TFile | drive_v3.Schema$File;
};

export default function AudioPreview({ data }: Props) {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [audioSrc, setAudioSrc] = useState<string>("");

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsError(true);
      setErrorMessage("Audio took too long to load");
      setIsLoading(false);
    }, config.preview.timeout);

    const audio = new Audio();
    audio.src = `/media/${data.id}/${data.name}`;
    audio.onloadeddata = () => {
      setAudioSrc(audio.src);
      setIsLoading(false);
      clearTimeout(timeout);
    };
    audio.onerror = (error: any) => {
      setIsError(true);
      setErrorMessage(error.message);
      setIsLoading(false);
      clearTimeout(timeout);
    };

    return () => {
      clearTimeout(timeout);
    };
  }, [data.id, data.name]);

  return (
    <div className='flex w-full items-center justify-center'>
      {isLoading ? (
        <LoadingFeedback
          message={"Loading audio preview..."}
          useContainer={false}
        />
      ) : isError ? (
        <ErrorFeedback
          message={errorMessage}
          useContainer={false}
        />
      ) : (
        <div className={"preview-audio w-full"}>
          <H5AudioPlayer
            src={audioSrc}
            autoPlay={false}
            showFilledVolume={true}
            customAdditionalControls={[]}
          />
        </div>
      )}
    </div>
  );
}
