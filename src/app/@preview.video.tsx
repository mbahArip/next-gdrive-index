"use client";

import { useEffect, useState } from "react";
import ReactPlayer from "react-player";
import { z } from "zod";
import { Schema_File } from "~/schema";
import { cn } from "~/utils";

import Icon from "~/components/Icon";

import { CreateDownloadToken } from "./actions";

type Props = {
  file: z.infer<typeof Schema_File>;
};
export default function PreviewVideo({ file }: Props) {
  const [videoSrc, setVideoSrc] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    (async () => {
      try {
        if (!file.encryptedWebContentLink) {
          setError("No video to preview");
          return;
        }
        const token = await CreateDownloadToken();
        setVideoSrc(`/api/download/${file.encryptedId}?token=${token}`);
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
    <div className='flex h-full min-h-[33dvh] w-full items-center justify-center py-3'>
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
          <p>Loading video...</p>
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
        <ReactPlayer
          key={file.encryptedId}
          url={videoSrc}
          controls
          pip
          wrapper={({ children }) => (
            <div className='h-[60dvh] w-full overflow-hidden rounded-[var(--radius)] bg-muted'>
              {children}
            </div>
          )}
          style={{
            width: "100%",
            height: "100%",
            maxHeight: "60vh",
          }}
          onError={(error) => {
            console.error(error.message);
            if (error instanceof Error) {
              setError(error.message);
            } else {
              setError("Failed to load video. (Probably not supported?)");
            }
          }}
        />
      )}
    </div>
  );
}
