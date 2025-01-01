"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { z } from "zod";

import { Loader, Status } from "~/components/global";

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
export default function PreviewVideo({ file }: Props) {
  const [videoSrc, setVideoSrc] = useState<string>("");
  const [error, setError] = useState<string>("");
  const loading = useLoading(async () => {
    try {
      if (!file.encryptedWebContentLink) {
        setError("No video to preview");
        return;
      }
      const token = await CreateDownloadToken();
      setVideoSrc(`/api/stream/${file.encryptedId}?token=${token}`);
    } catch (error) {
      const e = error as Error;
      console.error(e);
      setError(e.message);
    }
  }, [file]);

  return (
    <div className='flex h-full min-h-[33dvh] w-full items-center justify-center py-3'>
      {loading ? (
        <Loader message='Loading video...' />
      ) : error ? (
        <Status
          icon='TriangleAlert'
          message={error}
          destructive
        />
      ) : (
        <div className='h-full w-full'>
          <Plyr
            source={{
              type: "video",
              sources: [
                {
                  src: videoSrc,
                  type: file.mimeType,
                  size: file.size,
                },
              ],
              poster: `/api/thumb/${file.encryptedId}?size=1000`,
            }}
            options={{
              toggleInvert: true,
              settings: ["quality", "speed"],
              ratio: "16:9",
              controls: [
                "play-large",
                "play",
                "progress",
                "current-time",
                "duration",
                "mute",
                "volume",
                "settings",
                "pip",
                "download",
                "fullscreen",
              ],
              volume: 0.5,
              muted: false,
              loop: { active: false },
              speed: { selected: 1, options: [0.5, 1, 1.5, 2] },
              keyboard: {
                focused: true,
                global: true,
              },
            }}
          />
        </div>
      )}
    </div>
  );
}
