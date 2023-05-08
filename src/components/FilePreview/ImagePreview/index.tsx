import { TFile } from "types/googleapis";
import { drive_v3 } from "googleapis";
import { useEffect, useState } from "react";
import config from "config/site.config";
import { reverseString } from "utils/hashHelper";
import SWRLayout from "components/layout/SWRLayout";

type Props = {
  data: TFile | drive_v3.Schema$File;
  hash?: string;
};

export default function ImagePreview({ data, hash }: Props) {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [imageSrc, setImageSrc] = useState<string>("");

  useEffect(() => {
    const timeout = setTimeout(() => {
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
        <img
          src={imageSrc}
          alt={(data.name as string) || reverseString(hash as string)}
          className='max-h-full max-w-full rounded-lg'
        />
      </SWRLayout>
    </div>
  );
}
