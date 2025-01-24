"use client";

import { AsyncUnzipInflate, Unzip } from "fflate";
import { useEffect, useRef, useState } from "react";
import { type z } from "zod";

import { Status } from "~/components/global";
import { PageLoader } from "~/components/layout";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "~/components/ui/carousel";
import Icon from "~/components/ui/icon";
import { Progress } from "~/components/ui/progress";

import { useResponsive } from "~/context/responsiveContext";
import useLoading from "~/hooks/useLoading";
import { cn } from "~/lib/utils";

import { type Schema_File } from "~/types/schema";

import config from "config";

type Props = {
  file: z.infer<typeof Schema_File>;
};

export default function PreviewManga({ file }: Props) {
  const [error, setError] = useState<string>("");
  const [images, setImages] = useState<{ name: string; blob: string }[]>([]);
  const [currentImage, setCurrentImage] = useState<number>(1);
  const [viewSize, setViewSize] = useState<"fit" | "full">("fit");
  const [api, setApi] = useState<CarouselApi>();

  const [loadedPercent, setLoadedPercent] = useState<number>(0);
  const [loadFirstX] = useState<number>(config.siteConfig.previewSettings.manga.maxSize);
  const [loadFirxtItems] = useState<number>(config.siteConfig.previewSettings.manga.maxItem);

  const abortController = useRef<AbortController>(new AbortController());
  const loading = useLoading(async () => {
    if (!abortController.current) abortController.current = new AbortController();
    if (!file.encryptedWebContentLink) {
      setError("No content to preview");
      return;
    }

    const streamURL = new URL(`/api/preview/${file.encryptedId}`, config.basePath);
    const bufferStream = await fetch(streamURL, {
      signal: abortController.current.signal,
      headers: {
        Range: `bytes=0-${Math.min(Number(file.size ?? 1), loadFirstX * 1024 * 1024) - 1}`,
      },
    });

    const contentLength = bufferStream.headers.get("Content-Length");
    const totalBytes = Number(contentLength ?? "0");

    const reader = bufferStream.body?.getReader();
    if (!reader) {
      setError("Failed to load content, can't initialize buffer reader");
      return;
    }

    const chunks: Uint8Array[] = [];
    let receivedLength = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      if (value) {
        chunks.push(value);
        receivedLength += value.length;

        const percent = (receivedLength / totalBytes) * 100;
        setLoadedPercent((prev) => {
          if (percent > prev) return percent;
          return prev;
        });
      }
    }

    const buffer = new Uint8Array(receivedLength);
    let position = 0;
    for (const chunk of chunks) {
      buffer.set(chunk, position);
      position += chunk.length;
    }
    let itemLoaded = 0;

    const unzip = new Unzip((file) => {
      file.ondata = (err, data, final) => {
        if (err) {
          setError(err.message);
          return;
        }
        const allowedExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
        if (!allowedExtensions.some((ext) => file.name.toLowerCase().endsWith(ext))) return;
        if (!final) return;

        const blob = new Blob([data]);
        const reader = new FileReader();
        reader.onload = () => {
          if (itemLoaded >= loadFirxtItems) return;
          setImages((prev) => {
            const exist = prev.find((p) => p.name === file.name);
            if (exist) return prev;
            return [...prev, { name: file.name.split("/").pop() ?? file.name, blob: reader.result as string }];
          });
          itemLoaded++;
        };
        reader.readAsDataURL(blob);
      };
      file.start();
    });
    unzip.register(AsyncUnzipInflate);
    unzip.push(buffer);
  }, []);

  const { isDesktop } = useResponsive();

  useEffect(() => {
    if (!api) return;

    api.on("select", (embla) => {
      const index = embla.selectedScrollSnap();
      setCurrentImage(index + 1);
    });
  }, [api]);

  return (
    <div className='flex h-full min-h-[33dvh] w-full items-center justify-center py-3'>
      {loading ? (
        <PageLoader
          message='Please wait while we downloading the content for preview'
          extra={
            <div className='flex w-full max-w-sm flex-col items-center justify-center gap-1'>
              <Progress
                className='h-2 grow'
                value={loadedPercent}
              />
              <span className='text-center text-xs text-muted-foreground'>{Math.round(loadedPercent)}% loaded</span>
              <Button
                size={"sm"}
                variant={"secondary"}
                onClick={async () => {
                  abortController.current.abort("Cancelled by user");
                  const timeout = setTimeout(() => {
                    setError("Preview cancelled by user");
                    clearTimeout(timeout);
                  }, 100);
                }}
              >
                Cancel Preview
              </Button>
            </div>
          }
        />
      ) : error ? (
        <Status
          icon='TriangleAlert'
          message={error}
          destructive
        />
      ) : (
        <div className='flex w-full flex-col items-center justify-center gap-4'>
          <Alert className='bg-yellow-50 text-yellow-600 dark:bg-yellow-950 dark:text-yellow-500'>
            <div className='flex items-start gap-4'>
              <Icon
                name='TriangleAlert'
                className='size-5'
              />
              <div className='flex flex-col'>
                <AlertTitle>Preview Only</AlertTitle>
                <AlertDescription>
                  We only load the first {loadFirstX}MB or {loadFirxtItems} items of the file for preview. Please
                  download the file for full content.
                </AlertDescription>
              </div>
            </div>
          </Alert>

          <div
            slot='manga-content'
            className='h-full w-full tablet:px-8'
          >
            <Carousel
              className={cn("h-full w-full select-none", viewSize === "fit" ? "max-h-[66dvh]" : "max-h-[100dvh]")}
              opts={{
                loop: false,
              }}
              setApi={setApi}
            >
              <CarouselContent className='h-full w-full'>
                {images
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((image, index) => (
                    <CarouselItem
                      key={index}
                      className='flex h-full flex-col items-center justify-center'
                    >
                      <img
                        src={image.blob}
                        alt={`${image.name} - Page ${index + 1}`}
                        className={cn(
                          "h-full w-full object-contain",
                          viewSize === "fit" ? "max-h-[66dvh]" : "max-h-[100dvh]",
                        )}
                      />
                      <span className='muted text-center text-xs'>{image.name}</span>
                    </CarouselItem>
                  ))}
              </CarouselContent>
              {isDesktop ? (
                <>
                  <CarouselPrevious />
                  <CarouselNext />
                </>
              ) : null}
            </Carousel>
          </div>
          <div
            slot='manga-info'
            className='flex w-full items-center justify-end gap-4'
          >
            <span className='text-muted-foreground'>
              {currentImage}/{images.length}
            </span>
            <Button
              size='icon'
              variant={"ghost"}
              className='aspect-square size-8 p-0.5'
              onClick={() =>
                setViewSize((prev) => {
                  if (prev === "fit") return "full";
                  return "fit";
                })
              }
            >
              <Icon
                name={viewSize === "fit" ? "Maximize" : "Minimize"}
                size={16}
              />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
