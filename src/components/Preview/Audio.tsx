import { useState } from "react";
import AudioPlayer from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";

import { generatedDownloadLink } from "utils/generateDownloadLink";

import { PreviewProps } from "types/api/files";

import ErrorPreview from "./Error";

export default function AudioPreview(props: PreviewProps) {
  const [isError, setIsError] = useState<boolean>(false);

  return (
    <div className='w-full h-full'>
      {isError ? (
        <ErrorPreview />
      ) : (
        <AudioPlayer
          src={generatedDownloadLink(props.file, false)}
          showJumpControls={false}
          showFilledVolume
          style={{
            borderRadius: "0.375rem",
          }}
          onError={() => setIsError(true)}
        />
      )}
    </div>
  );
}
