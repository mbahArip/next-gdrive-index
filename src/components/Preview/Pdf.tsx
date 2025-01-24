"use client";

import { useState } from "react";
import { type z } from "zod";

import { Status } from "~/components/global";
import { PageLoader } from "~/components/layout";

import useLoading from "~/hooks/useLoading";
import { cn } from "~/lib/utils";

import { type Schema_File } from "~/types/schema";

type Props = {
  file: z.infer<typeof Schema_File>;
};

export default function PreviewPdf({ file }: Props) {
  const loading = useLoading();
  const [loaded, setLoaded] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  return (
    <div className='flex h-fit min-h-[50dvh] w-full items-center justify-center py-3'>
      {loading ? (
        <PageLoader message='Loading PDF...' />
      ) : error ? (
        <Status
          icon='Frown'
          message={error}
          destructive
        />
      ) : (
        <div className='relative grid min-h-[50dvh] w-full place-items-center'>
          <div className={cn("pointer-events-none absolute w-full", loaded && "hidden")}>
            <PageLoader message='Loading PDF...' />
          </div>
          <iframe
            src={`/api/preview/${file.encryptedId}?inline=1`}
            title={file.name}
            className={cn("h-full w-full rounded-lg transition", loaded ? "opacity-100" : "opacity-0")}
            allow='autoplay'
            onLoad={() => setLoaded(true)}
            onError={() => setError("Failed to load PDF")}
          />
        </div>
      )}
    </div>
  );
}
