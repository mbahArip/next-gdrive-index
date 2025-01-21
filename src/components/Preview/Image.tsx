"use client";

import { useState } from "react";
import { type z } from "zod";

import { PageLoader } from "~/components/layout";
import Icon from "~/components/ui/icon";

import useLoading from "~/hooks/useLoading";
import { cn } from "~/lib/utils";

import { type Schema_File } from "~/types/schema";

import { Status } from "../global";

type Props = {
  file: z.infer<typeof Schema_File>;
};
export default function PreviewImage({ file }: Props) {
  const [loaded, setLoaded] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const loading = useLoading();

  return (
    <div className='flex min-h-[33dvh] w-full items-center justify-center py-3'>
      {loading ? (
        <PageLoader message='Loading image...' />
      ) : error ? (
        <Status
          icon='Frown'
          message='Failed to load image'
        />
      ) : (
        <div className='relative grid h-auto max-h-[66dvh] min-h-[50dvh] w-full place-items-center'>
          <img
            src={`/api/thumb/${file.encryptedId}`}
            alt={file.name}
            className={cn(
              "absolute top-0 h-full max-h-[66dvh] min-h-[50dvh] w-auto rounded-lg bg-muted object-contain object-center opacity-50 transition ease-in-out",
              loaded ? "opacity-0" : "",
            )}
          />
          <div
            className={cn(
              "pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2",
              loaded ? "hidden" : "block",
            )}
          >
            <Icon
              name='LoaderCircle'
              className='size-16 animate-spin stroke-primary'
            />
          </div>
          <img
            src={`/api/preview/${file.encryptedId}`}
            alt={file.name}
            className={cn(
              "absolute top-0 h-full max-h-[66dvh] min-h-[50dvh] w-auto rounded-lg bg-muted object-contain object-center transition",
              loaded ? "opacity-100" : "opacity-0",
            )}
            onLoad={() => setLoaded(true)}
            onError={(_e) => {
              setError(true);
            }}
          />

          {/* <img
          src={`/api/preview/${file.encryptedId}`}
          alt={file.name}
          className={cn(
            "h-full max-h-[70dvh] w-full rounded-[var(--radius)] bg-muted object-contain object-center transition",
          )}
          onError={(e) => {
            console.error(e);
            toast.error("Failed to load image");
          }}
        /> */}
        </div>
      )}
    </div>
  );
}
