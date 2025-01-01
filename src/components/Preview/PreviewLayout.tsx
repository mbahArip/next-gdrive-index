"use client";

import { useState } from "react";
import { type z } from "zod";

import { Status } from "~/components/global";
import { PreviewInformation } from "~/components/preview";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

import { type getFileType } from "~/lib/previewHelper";
import { cn } from "~/lib/utils";

import { type Schema_File } from "~/types/schema";

import config from "config";

type Props = {
  data: z.infer<typeof Schema_File>;
  fileType: "unknown" | ReturnType<typeof getFileType>;
};
export default function PreviewLayout({ data, fileType }: Props) {
  const [view, setView] = useState<"markdown" | "raw">("markdown");

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
            <CardTitle className='line-clamp-1 flex-grow whitespace-pre-wrap break-all'>{data.name}</CardTitle>
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
          {/* <Separator /> */}
        </CardHeader>

        <CardContent>
          {config.apiConfig.streamMaxSize && Number(data.size ?? 0) > config.apiConfig.streamMaxSize ? (
            <Status
              icon='Frown'
              message='File is too large to preview'
            />
          ) : (
            <div>
              Preview goes here
              {/* {fileType === "image" ? (
                <PreviewImage file={data} />
              ) : fileType === "audio" ? (
                <PreviewAudio file={data} />
              ) : fileType === "video" ? (
                <PreviewVideo file={data} />
              ) : fileType === "code" ? (
                <PreviewRich
                  file={data}
                  code
                  view={"raw"}
                />
              ) : fileType === "text" ? (
                <PreviewRich
                  file={data}
                  view={view}
                />
              ) : fileType === "markdown" ? (
                <PreviewRich
                  file={data}
                  view={view}
                />
              ) : fileType === "document" ? (
                <PreviewDocument file={data} />
              ) : fileType === "pdf" ? (
                <PreviewDocument file={data} />
              ) : fileType === "manga" ? (
                <PreviewManga file={data} />
              ) : (
                <PreviewUnknown />
              )} */}
            </div>
          )}
        </CardContent>
      </Card>

      <PreviewInformation file={data} />
    </div>
  );
}
