"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { type z } from "zod";

import { Status } from "~/components/global";
import { PageLoader } from "~/components/layout";

import useLoading from "~/hooks/useLoading";
import { cn } from "~/lib/utils";

import { type Schema_File } from "~/types/schema";

import config from "config";

type Props = {
  file: z.infer<typeof Schema_File>;
  token: string;
};

export default function PreviewDocument({ file, token }: Props) {
  const pathname = usePathname();
  const loading = useLoading();
  const [dlUrl] = useState<string>(() => {
    const url = new URL(`/api/download/${pathname}`.replace(/\/+/g, "/"), config.basePath);
    url.searchParams.set("token", token);
    url.searchParams.set("redirect", "1");
    return url.toString();
  });
  const [loaded, setLoaded] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  return (
    <div className='flex h-fit min-h-[50dvh] w-full items-center justify-center py-3'>
      {loading ? (
        <PageLoader message='Loading document...' />
      ) : error ? (
        <Status
          icon='Frown'
          message={error}
          destructive
        />
      ) : (
        <div className='relative grid min-h-[50dvh] w-full place-items-center'>
          <div className={cn("pointer-events-none absolute w-full", loaded && "hidden")}>
            <PageLoader message='Loading document...' />
          </div>
          <iframe
            src={`https://docs.google.com/gview?url=${encodeURIComponent(dlUrl)}&embedded=true`}
            title={file.name}
            className={cn("h-full w-full rounded-lg transition", loaded ? "opacity-100" : "opacity-0")}
            allow='autoplay'
            onLoad={() => setLoaded(true)}
            onError={() => setError("Failed to load PDF")}
            allowFullScreen
          />
        </div>
      )}
    </div>
  );
}
