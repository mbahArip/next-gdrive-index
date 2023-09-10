import axios from "axios";
import gIndexConfig from "config";
import JSZip from "jszip";
import { useCallback, useEffect, useState } from "react";

import ButtonIcon from "components/ButtonIcon";

import { generatedDownloadLink } from "utils/generateDownloadLink";

import { PreviewProps } from "types/api/files";

import ErrorPreview from "./Error";

export default function MangaPreview(props: PreviewProps) {
  const [maxPageIndex, setMaxPageIndex] = useState<number>(4);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [viewPageIndex, setViewPageIndex] = useState<number>(0);
  const [images, setImages] = useState<string[]>([]);
  const [viewSize, setViewSize] = useState<"fit" | "full">("fit");

  useEffect(() => {
    const mangaImages: string[] = [];
    axios
      .get(generatedDownloadLink(props.file, false, false, null, true), {
        responseType: "blob",
      })
      .then(async (res) => {
        const zipData = await JSZip.loadAsync(res.data);
        for (let i = 0; i <= maxPageIndex; i++) {
          const file = zipData.file(Object.keys(zipData.files)[i]);
          if (file) {
            const blob = await file.async("blob");
            const reader = new FileReader();
            reader.onload = () => {
              mangaImages.push(reader.result as string);
            };
            reader.readAsDataURL(blob);
          }
        }
        setImages(mangaImages);
        setMaxPageIndex(mangaImages.length);
      })
      .catch((err) => {
        console.error(err);
        setIsError(true);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [props.file, maxPageIndex]);

  const handleCurrentView = useCallback(
    (pageNumber: number) => {
      if (pageNumber < 0 || pageNumber > maxPageIndex) return;
      setViewPageIndex(pageNumber);
    },
    [maxPageIndex],
  );

  return (
    <div className='w-full h-full'>
      <blockquote className='w-full h-auto flex items-center my-2 bg-primary-800 border-l-4 border-l-accent-500 pl-3 pr-2 py-2 text-sm tablet:text-base rounded-md'>
        Preview only shows the first 5 pages. Please download the file to view the rest.
      </blockquote>
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
        <>
          {isError ? (
            <ErrorPreview />
          ) : (
            <div className='flex flex-col'>
              <div className='w-full h-full relative'>
                <img
                  src={images[viewPageIndex]}
                  alt={`${props.file.name} - page ${viewPageIndex}`}
                  className={`w-full h-full object-contain bg-primary-950 rounded-md ${
                    viewSize === "fit" ? "max-h-[70vh]" : ""
                  }`}
                />
                <ButtonIcon
                  icon={viewSize === "fit" ? "ion:expand" : "ion:contract"}
                  className='absolute bottom-2 right-2'
                  onClick={() => setViewSize(viewSize === "fit" ? "full" : "fit")}
                />
              </div>
              <div className='flex flex-row gap-2 items-center justify-center my-2'>
                <ButtonIcon
                  variant='transparent'
                  icon={"ion:chevron-back"}
                  onClick={() => handleCurrentView(viewPageIndex - 1)}
                  disabled={viewPageIndex === 0}
                />
                <span>
                  {viewPageIndex + 1} / {maxPageIndex + 1}
                </span>
                <ButtonIcon
                  variant='transparent'
                  icon={"ion:chevron-forward"}
                  onClick={() => handleCurrentView(viewPageIndex + 1)}
                  disabled={viewPageIndex === maxPageIndex}
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
