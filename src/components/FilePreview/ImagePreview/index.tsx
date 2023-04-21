import { TFile } from "@/types/googleapis";
import { drive_v3 } from "googleapis";
import { useEffect, useState } from "react";
import LoadingFeedback from "@components/APIFeedback/Loading";
import ErrorFeedback from "@components/APIFeedback/Error";
import config from "@config/site.config";

type Props = {
  data: TFile | drive_v3.Schema$File;
};

export default function ImagePreview({ data }: Props) {
  const [image, setImage] = useState<string>("");
  const [isImageLoaded, setIsImageLoaded] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (data) {
      try {
        let loaded = false;
        const _image = new Image();
        _image.src = `/api/files/${data.id}/view`;
        _image.onload = () => {
          setImage(_image.src);
          setIsImageLoaded(true);
          loaded = true;
        };
        timeout = setTimeout(() => {
          if (!loaded) {
            setIsError(true);
            setError(
              new Error(
                "Cannot load image preview, extension probably not supported",
              ),
            );
          }
        }, config.preview.timeout);
      } catch (error: any) {
        setIsError(true);
        setError(error);
        console.error(error);
      }
    }
    return () => {
      clearTimeout(timeout);
    };
  }, [data]);

  return (
    <div className='flex w-full items-center justify-center'>
      {!isImageLoaded && !isError && (
        <LoadingFeedback
          message={"Loading image preview..."}
          useContainer={false}
        />
      )}
      {!isImageLoaded && isError && (
        <ErrorFeedback
          message={error?.message || "Error loading image preview"}
          useContainer={false}
        />
      )}
      {isImageLoaded && !isError && (
        <img
          src={image}
          alt={data.name as string}
          className='bg-size-checkerboard h-full w-full rounded-lg bg-checkerboard dark:bg-checkerboard-dark'
        />
      )}
    </div>
  );
}
