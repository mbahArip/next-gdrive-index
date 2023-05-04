import { TFile } from "types/googleapis";
import { drive_v3 } from "googleapis";
import { useEffect, useState } from "react";
import LoadingFeedback from "components/APIFeedback/Loading";
import ErrorFeedback from "components/APIFeedback/Error";
import config from "config/site.config";
import { reverseString } from "utils/hashHelper";

type Props = {
  data: TFile | drive_v3.Schema$File;
  hash?: string;
};

export default function ImagePreview({ data, hash }: Props) {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [imageSrc, setImageSrc] = useState<string>("");

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsError(true);
      setErrorMessage("Image took too long to load");
      setIsLoading(false);
    }, config.preview.timeout);
    const image = new Image();
    image.src = `/media/${data.id}/${data.name}`;
    image.onload = () => {
      setImageSrc(image.src);
      setIsLoading(false);
      clearTimeout(timeout);
    };
    image.onerror = (error: any) => {
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
          message={"Loading image preview..."}
          useContainer={false}
        />
      ) : isError ? (
        <ErrorFeedback
          message={errorMessage}
          useContainer={false}
        />
      ) : (
        <img
          src={imageSrc}
          alt={(data.name as string) || reverseString(hash as string)}
          className='max-h-full max-w-full rounded-lg'
        />
      )}
    </div>
  );
}
