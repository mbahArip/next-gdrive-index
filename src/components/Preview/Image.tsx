import gIndexConfig from "config";
import { useEffect, useState } from "react";

import { generatedDownloadLink } from "utils/generateDownloadLink";

import { PreviewProps } from "types/api/files";

import ErrorPreview from "./Error";

export default function ImagePreview(props: PreviewProps) {
  const [imgSrc, setImgSrc] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    setIsError(false);
    setIsLoading(true);

    const timeout = setTimeout(() => {
      setIsError(true);
      setErrorMessage("Image took too long to load");
      return;
    }, 15000);

    fetch(generatedDownloadLink(props.file, false))
      .then((res) => {
        if (!res.ok) throw new Error(res.statusText);
        return res.blob();
      })
      .then((blob) => {
        const reader = new FileReader();
        reader.onload = () => {
          setImgSrc(reader.result as string);
        };
        reader.readAsDataURL(blob);
      })
      .catch((err) => {
        console.error(err);
        setIsError(true);
        setErrorMessage(err.message);
      })
      .finally(() => {
        setIsLoading(false);
        clearTimeout(timeout);
      });

    return () => clearTimeout(timeout);
  }, [props.file]);

  return (
    <>
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
            <span>Loading image...</span>
          </div>
        </div>
      ) : (
        <>
          {isError ? (
            <ErrorPreview />
          ) : (
            <img
              src={imgSrc}
              alt={props.file.name}
              className='w-full h-full rounded-md'
            />
          )}
        </>
      )}
    </>
  );
}
