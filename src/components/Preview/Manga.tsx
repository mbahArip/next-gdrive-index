"use client";

import { AsyncUnzipInflate, Unzip } from "fflate";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";

import { Icon, Loader, Status } from "~/components/Global";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "~/components/ui/carousel";
import { Progress } from "~/components/ui/progress";

import { cn } from "~/utils/cn";

import useMediaQuery from "~/hooks/useMediaQuery";

import { Schema_File } from "~/types/schema";

import { CreateDownloadToken } from "actions";
import config from "config";

type Props = {
  file: z.infer<typeof Schema_File>;
};

export default function PreviewManga({ file }: Props) {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [images, setImages] = useState<{ name: string; blob: string }[]>([]);
  const [currentImage, setCurrentImage] = useState<number>(1);
  const [viewSize, setViewSize] = useState<"fit" | "full">("fit");
  const [api, setApi] = useState<CarouselApi>();

  const [loadedPercent, setLoadedPercent] = useState<number>(0);
  const [loadFirstX] = useState<number>(5); // 5MB

  const abortController = useRef<AbortController>(new AbortController());

  const isDesktop = useMediaQuery("(min-width: 768px)");

  useEffect(() => {
    (async () => {
      try {
        if (!abortController.current) {
          abortController.current = new AbortController();
        }
        if (!file.encryptedWebContentLink) {
          setError("No video to preview");
          return;
        }
        const token = await CreateDownloadToken();
        const streamURL = new URL(`/api/stream/${file.encryptedId}`, config.basePath);
        streamURL.searchParams.set("token", token);

        const bufferStream = await fetch(streamURL, {
          signal: abortController.current.signal,
          headers: {
            Range: `bytes=0-${Math.min(Number(file.size || 1), loadFirstX * 1024 * 1024) - 1}`,
          },
        });

        const contentLength = bufferStream.headers.get("Content-Length");
        const totalBytes = parseInt(contentLength || "0", 10);

        const reader = bufferStream.body?.getReader();
        if (reader) {
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

          const unzip = new Unzip((file) => {
            file.ondata = (err, data, final) => {
              if (err) throw err;
              // Check if the file is an image
              if (!file.name.toLowerCase().includes(".jpg" || ".jpeg" || ".png" || ".gif" || ".webp")) return;
              if (!final) return; // Skip if not fully loaded

              const blob = new Blob([data]);
              const reader = new FileReader();
              reader.onload = () => {
                setImages((prev) => {
                  const exist = prev.find((p) => p.name === file.name);
                  if (exist) return prev;
                  return [...prev, { name: file.name, blob: reader.result as string }];
                });
              };
              reader.readAsDataURL(blob);
            };
            file.start();
          });
          unzip.register(AsyncUnzipInflate);
          unzip.push(buffer);
        }
      } catch (error) {
        const e = error as Error;
        console.error(e);
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!api) return;

    api.on("select", (embla, e) => {
      const index = embla.selectedScrollSnap();
      setCurrentImage(index + 1);
    });
  }, [api]);

  return (
    <div className='flex h-full min-h-[33dvh] w-full items-center justify-center py-3'>
      {loading ? (
        <Loader
          message='Please wait while we downloading the content for preview'
          extra={
            <div className='flex w-full max-w-sm flex-col items-center gap-1'>
              <Progress
                className='h-2 w-full'
                value={loadedPercent}
              />
              <span className='text-center text-xs text-muted-foreground'>{Math.round(loadedPercent)}% loaded</span>
              <Button
                size={"sm"}
                variant={"secondary"}
                onClick={async () => {
                  abortController.current.abort("Cancelled by user");
                  const timeout = setTimeout(() => {
                    setLoading(false);
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
        <div className='flex w-full flex-col items-center justify-center gap-3'>
          <Alert className='bg-yellow-50 text-yellow-600 dark:bg-yellow-950 dark:text-yellow-500'>
            <div className='flex items-start gap-3'>
              <Icon
                name='TriangleAlert'
                className='size-5'
              />
              <div className='flex flex-col'>
                <AlertTitle>Preview Only</AlertTitle>
                <AlertDescription>
                  We only load the first {loadFirstX}MB of the file for preview. Please download the file for full
                  content.
                </AlertDescription>
              </div>
            </div>
          </Alert>

          <div
            slot='manga-content'
            className='h-full w-full tablet:px-8'
          >
            <Carousel
              className={cn("w-full", viewSize === "fit" ? "h-full max-h-[70dvh]" : "h-full")}
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
                        className={cn("w-full object-contain", viewSize === "fit" ? "h-full max-h-[70dvh]" : "h-full")}
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
            className='flex w-full items-center justify-end gap-3'
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
