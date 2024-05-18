"use client";

import { useState } from "react";
import { z } from "zod";

import { Status } from "~/components/Global";
import {
  PreviewAudio,
  PreviewDocument,
  PreviewImage,
  PreviewInformation,
  PreviewManga,
  PreviewRich,
  PreviewUnknown,
  PreviewVideo,
} from "~/components/Preview";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";

import { cn } from "~/utils/cn";
import { getFileType } from "~/utils/previewHelper";

import { Schema_File } from "~/types/schema";

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
      className='flex flex-col gap-3'
    >
      <Card>
        <CardHeader className='pb-0'>
          <div
            className={cn(
              "flex flex-col gap-3 overflow-hidden",
              "mobile:flex-row mobile:items-center mobile:justify-between",
            )}
          >
            <h3 className='line-clamp-1 flex-grow whitespace-pre-wrap break-all'>{data.name}</h3>
            {["text", "markdown", "code"].includes(fileType) && (
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
          <Separator />
        </CardHeader>

        <CardContent className='p-1.5 pt-0 tablet:p-3 tablet:pt-0'>
          {config.apiConfig.streamMaxSize && Number(data.size || 0) > config.apiConfig.streamMaxSize ? (
            <Status
              icon='Frown'
              message='File is too large to preview'
            />
          ) : (
            <div className='px-3'>
              {fileType === "image" ? (
                <PreviewImage file={data} />
              ) : fileType === "audio" ? (
                <PreviewAudio file={data} />
              ) : fileType === "video" ? (
                <PreviewVideo file={data} />
              ) : fileType === "code" ? (
                <PreviewRich
                  file={data}
                  code
                  view={view}
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
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <PreviewInformation file={data} />
    </div>
  );
}
