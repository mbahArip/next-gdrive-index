"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import "react-h5-audio-player/lib/styles.css";
import { z } from "zod";

import { Loader, Status } from "~/components/Global";

import useLoading from "~/hooks/useLoading";

import { Schema_File } from "~/types/schema";

import { CreateDownloadToken } from "actions";

const Plyr = dynamic(() => import("plyr-react"), {
  ssr: false,
  loading: () => <Loader message='Loading player...' />,
});

type Props = {
  file: z.infer<typeof Schema_File>;
};
export default function PreviewAudio({ file }: Props) {
  const [audioSrc, setAudioSrc] = useState<string>("");
  const [error, setError] = useState<string>("");

  const loading = useLoading(async () => {
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
    }
  }, [file]);

  return (
    <div className='flex h-full min-h-[33dvh] w-full items-center justify-center py-3'>
      {loading ? (
        <Loader message='Loading audio...' />
      ) : error ? (
        <Status
          icon='TriangleAlert'
          message={error}
          destructive
        />
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
