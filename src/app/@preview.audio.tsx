"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import "react-h5-audio-player/lib/styles.css";
import { z } from "zod";
import { Schema_File } from "~/schema";
import { cn } from "~/utils";

import Icon from "~/components/Icon";

import { CreateDownloadToken } from "./actions";

// import "./r5-style.css";

const Plyr = dynamic(() => import("plyr-react"), {
  ssr: false,
  loading: () => (
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
      <p>Loading player...</p>
    </div>
  ),
});

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
        setAudioSrc(`/api/stream/${file.encryptedId}?token=${token}`);
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
          <p>Loading player...</p>
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
        <div className='w-full'>
          <Plyr
            source={{
              type: "audio",
              sources: [
                {
                  src: audioSrc,
                  type: file.mimeType,
                  size: file.size,
                },
              ],
              title: file.name,
            }}
            options={{
              controls: [
                "play-large",
                "play",
                "progress",
                "current-time",
                "duration",
                "mute",
                "volume",
                "settings",
                "fullscreen",
              ],
              volume: 0.5,
              muted: false,
              loop: {
                active: false,
              },
              speed: {
                selected: 1,
                options: [0.5, 1, 1.5, 2],
              },
              keyboard: {
                focused: true,
                global: false,
              },
            }}
          />
        </div>
      )}
    </div>
  );
}
