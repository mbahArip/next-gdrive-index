"use client";

import { useEffect, useState } from "react";
import AudioPlayer from "react-h5-audio-player";
import { z } from "zod";
import { Schema_File } from "~/schema";
import { cn } from "~/utils";

import Icon from "~/components/Icon";

import { CreateDownloadToken } from "./actions";
import "./r5-style.css";

type Props = {
  file: z.infer<typeof Schema_File>;
};
export default function PreviewAudio({ file }: Props) {
  const [audioSrc, setAudioSrc] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    (async () => {
      try {
        if (!file.encryptedWebContentLink) {
          setError("No audio to preview");
          return;
        }
        const token = await CreateDownloadToken();
        setAudioSrc(`/api/download/${file.encryptedId}?token=${token}`);
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
        <AudioPlayer
          autoPlay={false}
          layout='stacked-reverse'
          src={audioSrc}
          showJumpControls={false}
          showFilledVolume
          style={{
            borderRadius: "var(--radius)",
          }}
          onError={(e) => {
            console.error(e);
            setError("Could not preview this audio, try downloading the file");
          }}
        />
      )}
    </div>
  );
}
