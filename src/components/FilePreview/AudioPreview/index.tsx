import { TFile } from "types/googleapis";
import { drive_v3 } from "googleapis";
import { useEffect, useState } from "react";
import config from "config/site.config";
import H5AudioPlayer from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";
import SWRLayout from "components/layout/SWRLayout";

type Props = {
  data: TFile | drive_v3.Schema$File;
};

export default function AudioPreview({ data }: Props) {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [audioSrc, setAudioSrc] = useState<string>("");

  useEffect(() => {
    const timeout = setTimeout(() => {
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
      <SWRLayout
        data={data}
        error={errorMessage}
        isLoading={isLoading}
      >
        <div className={"preview-audio w-full"}>
          <H5AudioPlayer
            src={audioSrc}
            autoPlay={false}
            showFilledVolume={true}
            customAdditionalControls={[]}
          />
        </div>
      </SWRLayout>
    </div>
  );
}
