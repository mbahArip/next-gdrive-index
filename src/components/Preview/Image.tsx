"use client";

import { useState } from "react";
import { z } from "zod";

import { Icon, Loader, Status } from "~/components/global";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";

import useLoading from "~/hooks/useLoading";
import { cn } from "~/lib/utils";

import { Schema_File } from "~/types/schema";

import { CreateDownloadToken } from "actions";
import config from "config";

type Props = {
  file: z.infer<typeof Schema_File>;
};
export default function PreviewImage({ file }: Props) {
  const [imgSrc, setImgSrc] = useState<string>(`/api/thumb/${file.encryptedId}?size=4`);
  const [imgLoaded, setImgLoaded] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const loading = useLoading(async () => {
    try {
      if (!file.encryptedWebContentLink) {
        setError("No image to preview");
        return;
      }
      const token = await CreateDownloadToken();

      const streamURL = new URL(`/api/thumb/${file.encryptedId}?size=1000`, config.basePath);
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
    }
  }, [file]);

  return (
    <div className='flex min-h-[33dvh] w-full items-center justify-center py-3'>
      {loading ? (
        <Loader message='Loading image...' />
      ) : error ? (
        <Status
          icon='TriangleAlert'
          message={error}
          destructive
        />
      ) : (
        <div className='h-fit w-full space-y-3 overflow-hidden'>
          <Alert className='bg-yellow-50 text-yellow-600 dark:bg-yellow-950 dark:text-yellow-500'>
            <div className='flex items-start gap-4'>
              <Icon
                name='TriangleAlert'
                className='size-5'
              />
              <div className='flex flex-col'>
                <AlertTitle>Preview Only</AlertTitle>
                <AlertDescription>
                  This image is a preview and may not be the full resolution. Please download the file for the full
                  resolution.
                </AlertDescription>
              </div>
            </div>
          </Alert>

          <img
            src={imgSrc}
            alt={file.name}
            className={cn(
              "h-full max-h-[70dvh] w-full rounded-[var(--radius)] bg-muted object-contain object-center transition",
              imgLoaded ? "blur-none" : "animate-pulse blur",
            )}
            onError={(e) => {
              console.error(e);
              setError("Could not preview this image, try downloading the file");
            }}
          />
        </div>
      )}
    </div>
  );
}
