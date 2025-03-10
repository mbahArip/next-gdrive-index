"use client";

import { useMemo, useState } from "react";
import { type z } from "zod";

import { Status } from "~/components/global";
import {
  PreviewDocument,
  PreviewImage,
  PreviewInformation,
  PreviewManga,
  PreviewMedia,
  PreviewRich,
  PreviewUnknown,
} from "~/components/preview";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

import { type getFileType } from "~/lib/previewHelper";
import { cn } from "~/lib/utils";

import { type Schema_File } from "~/types/schema";

import config from "config";

type Props = {
  data: z.infer<typeof Schema_File>;
  fileType: "unknown" | ReturnType<typeof getFileType>;
  token: string;
  playlist: z.infer<typeof Schema_File>[];
  paths: string[];
};
export default function PreviewLayout({ data, fileType, token, playlist }: Props) {
  const [view, setView] = useState<"markdown" | "raw">("markdown");
  const PreviewComponent = useMemo(() => {
    switch (fileType) {
      case "image":
        return <PreviewImage file={data} />;
      case "video":
      case "audio":
        return (
          <PreviewMedia
            file={data}
            type={fileType}
            playlist={playlist}
          />
        );
      case "code":
        return (
          <PreviewRich
            file={data}
            isCode
            view={"markdown"}
          />
        );
      case "markdown":
      case "text":
        return (
          <PreviewRich
            file={data}
            view={view}
          />
        );
      case "document":
        return (
          <PreviewDocument
            file={data}
            token={token}
          />
        );
      case "pdf":
        return (
          <PreviewDocument
            file={data}
            token={token}
          />
        );
      case "manga":
        return <PreviewManga file={data} />;
      case "unknown":
      default:
        return <PreviewUnknown />;
    }
  }, [fileType, data, view, token, playlist]);

  return (
    <div
      slot='preview-container'
      className='flex flex-col gap-2 tablet:gap-4'
    >
      <Card>
        <CardHeader>
          <div
            className={cn(
              "flex flex-col gap-4 overflow-hidden",
              "mobile:flex-row mobile:items-center mobile:justify-between",
            )}
          >
            <CardTitle className='line-clamp-1 flex-grow whitespace-pre-wrap break-all'>
              Preview of {data.name}
            </CardTitle>
            {["text", "markdown"].includes(fileType) && (
              <div className='flex w-full items-center mobile:w-fit'>
                <Button
                  size={"sm"}
                  variant={view === "markdown" ? "default" : "outline"}
                  onClick={() => setView("markdown")}
                  className='w-full rounded-r-none mobile:w-fit'
                >
                  Markdown
                </Button>
                <Button
                  size={"sm"}
                  variant={view === "raw" ? "default" : "outline"}
                  onClick={() => setView("raw")}
                  className='w-full rounded-l-none mobile:w-fit'
                >
                  Raw
                </Button>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {config.apiConfig.streamMaxSize && Number(data.size ?? 0) > config.apiConfig.streamMaxSize ? (
            <Status
              icon='Frown'
              message='File is too large to preview'
            />
          ) : (
            <>{PreviewComponent}</>
          )}
        </CardContent>

        {/* <CardFooter>
          <MediaPlaylistLayout
            type={"inside"}
            paths={paths}
            currentItem={data}
            playlist={playlist}
          />
        </CardFooter> */}
      </Card>

      <PreviewInformation
        file={data}
        token={token}
      />
    </div>
  );
}
