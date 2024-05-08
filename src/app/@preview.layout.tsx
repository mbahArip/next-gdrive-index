"use client";

import { useState } from "react";
import { z } from "zod";
import { Schema_File } from "~/schema";
import { cn } from "~/utils";

import Icon from "~/components/Icon";
import { Card, CardContent } from "~/components/ui/card";

import { getFileType } from "~/utils/previewHelper";

import config from "~/config/gIndex.config";

import PreviewAction from "./@preview.action";
import PreviewAudio from "./@preview.audio";
import PreviewDoc from "./@preview.doc";
import PreviewImage from "./@preview.image";
import PreviewManga from "./@preview.manga";
import PreviewRich from "./@preview.rich";
import PreviewUnknown from "./@preview.unknown";
import PreviewVideo from "./@preview.video";
import RichHeader from "./@rich-header";

type Props = {
  data: z.infer<typeof Schema_File>;
  fileType: "unknown" | ReturnType<typeof getFileType>;
};
export default function FilePreviewLayout({ data, fileType }: Props) {
  const [view, setView] = useState<"markdown" | "raw">("markdown");

  return (
    <div className='flex flex-col gap-3'>
      <Card>
        <RichHeader
          title={data.name}
          view={view}
          onViewChange={setView}
          fileType={fileType}
        />
        <CardContent className='p-1.5 pt-0 tablet:p-3 tablet:pt-0'>
          {config.apiConfig.streamMaxSize &&
          Number(data.size || 0) > config.apiConfig.streamMaxSize ? (
            <div
              className={cn(
                "h-auto min-h-[33dvh] w-full",
                "flex flex-grow flex-col items-center justify-center gap-3",
              )}
            >
              <Icon
                name='Frown'
                size={32}
                className='text-muted-foreground'
              />
              <h4 className='text-muted-foreground'>Preview not available</h4>
              <p className='text-center text-muted-foreground tablet:text-sm'>
                Looks like this file size exceed the preview size limit
              </p>
            </div>
          ) : (
            /**
             * TODO: Might need a better way to handle large files preview
             * like manga, pdf, etc
             *
             * For now it's downloading the whole file and then previewing it
             * which is not a good implementation
             */
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
                <PreviewDoc file={data} />
              ) : fileType === "pdf" ? (
                <PreviewDoc file={data} />
              ) : fileType === "manga" ? (
                <PreviewManga file={data} />
              ) : (
                <PreviewUnknown />
              )}
            </div>
          )}
        </CardContent>
      </Card>
      <PreviewAction file={data} />
    </div>
  );
}
