import { useState } from "react";
import ReactPlayer from "react-player";

import { generatedDownloadLink } from "utils/generateDownloadLink";

import { PreviewProps } from "types/api/files";

import ErrorPreview from "./Error";

export default function VideoPreview(props: PreviewProps) {
  const [isError, setIsError] = useState<boolean>(false);

  return (
    <div className='w-full h-full'>
      {isError ? (
        <ErrorPreview />
      ) : (
        <ReactPlayer
          key={props.file.encryptedId}
          url={generatedDownloadLink(props.file, false)}
          controls
          pip
          wrapper={({ children }) => (
            <div className='w-full h-[60vh] bg-primary-950 rounded-md overflow-hidden'>{children}</div>
          )}
          style={{
            width: "100%",
            height: "100%",
            maxHeight: "60vh",
          }}
          onError={() => setIsError(true)}
        />
      )}
    </div>
  );
}
