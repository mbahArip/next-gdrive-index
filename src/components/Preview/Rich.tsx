import axios from "axios";
import gIndexConfig from "config";
import { useEffect, useState } from "react";

import Markdown from "components/Markdown";

import { generatedDownloadLink } from "utils/generateDownloadLink";

import { PreviewProps } from "types/api/files";

import ErrorPreview from "./Error";

export default function RichPreview(props: PreviewProps) {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [content, setContent] = useState<string>("");

  useEffect(() => {
    axios
      .get(generatedDownloadLink(props.file))
      .then((res) => {
        setContent(res.data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsError(true);
      });
  }, [props.file]);

  return (
    <div className='w-full h-full'>
      {isLoading ? (
        <div className='w-full h-auto min-h-[50vh] flex items-center justify-center'>
          <div className='flex flex-col gap-4 items-center justify-center animate-pulse'>
            <div className='w-fit h-fit relative grid place-items-center'>
              <img
                src={gIndexConfig.siteConfig.siteIcon}
                alt={gIndexConfig.siteConfig.siteName}
                className='w-12 -top-1 relative'
              />
              <div className='absolute w-12 h-12 bg-transparent border border-primary-50 rounded-full animate-ping' />
            </div>
            <span>Loading content...</span>
          </div>
        </div>
      ) : (
        <>{isError ? <ErrorPreview /> : <Markdown content={content} />}</>
      )}
    </div>
  );
}
