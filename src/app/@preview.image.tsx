"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import { Schema_File } from "~/schema";
import { cn } from "~/utils";

import Icon from "~/components/Icon";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";

import config from "~/config/gIndex.config";

import { CreateDownloadToken } from "./actions";

type Props = {
  file: z.infer<typeof Schema_File>;
};
export default function PreviewImage({ file }: Props) {
  const [imgSrc, setImgSrc] = useState<string>(
    `/api/thumb/${file.encryptedId}?size=4`,
  );
  const [imgLoaded, setImgLoaded] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    (async () => {
      try {
        if (!file.encryptedWebContentLink) {
          setError("No image to preview");
          return;
        }
        const token = await CreateDownloadToken();

        const streamURL = new URL(
          `/api/thumb/${file.encryptedId}?size=1000`,
          config.basePath,
        );
        streamURL.searchParams.set("token", token);
        fetch(streamURL, {
          headers: {
            Range: `bytes=0-${(file.size || 1) - 1}`,
          },
        })
          .then((res) => {
            if (!res.ok) {
              throw new Error("Could not load image");
            }
            return res.blob();
          })
          .then((blob) => {
            const urlobject = URL.createObjectURL(blob);
            setImgSrc(urlobject);
            const timeout = setTimeout(() => {
              setImgLoaded(true);
              clearTimeout(timeout);
            }, 150); // Add a delay to show the image
          });
      } catch (error) {
        const e = error as Error;
        console.error(e);
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [file]);

  return (
    <div className='flex min-h-[33dvh] w-full items-center justify-center py-3'>
      {loading ? (
        <div
          className={cn(
            "h-auto min-h-[50dvh] w-full",
            "flex flex-grow flex-col items-center justify-center gap-3",
          )}
        >
          <Icon
            name='LoaderCircle'
            size={32}
            className='animate-spin text-foreground'
          />
          <p>Loading image...</p>
        </div>
      ) : error ? (
        <div className='flex h-full flex-col items-center justify-center gap-3'>
          <Icon
            name='CircleX'
            size={24}
            className='text-destructive'
          />
          <span className='text-center text-destructive'>{error}</span>
        </div>
      ) : (
        <div className='h-fit w-full space-y-3 overflow-hidden rounded-[var(--radius)]'>
          <img
            src={imgSrc}
            alt={file.name}
            className={cn(
              "h-full max-h-[70dvh] w-full bg-muted object-contain object-center transition",
              imgLoaded ? "blur-none" : "animate-pulse blur",
            )}
            onError={(e) => {
              console.error(e);
              setError(
                "Could not preview this image, try downloading the file",
              );
            }}
          />

          <Alert className='bg-yellow-50 text-yellow-600 dark:bg-yellow-950 dark:text-yellow-500'>
            <div className='flex items-start gap-3'>
              <Icon
                name='TriangleAlert'
                className='size-5'
              />
              <div className='flex flex-col'>
                <AlertTitle>Preview Only</AlertTitle>
                <AlertDescription>
                  This image is a preview and may not be the full resolution.
                  Please download the file for the full resolution.
                </AlertDescription>
              </div>
            </div>
          </Alert>
        </div>
      )}
    </div>
  );
}
