"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { z } from "zod";
import Icon from "~/components/Icon";
import { Separator } from "~/components/ui/separator";
import { Schema_File } from "~/schema";
import { cn } from "~/utils";
import bytesToReadable from "~/utils/bytesFormat";
import { durationToReadable } from "~/utils/durationFormat";
import { getPreviewIcon } from "~/utils/previewHelper";

type Props = {
  data: z.infer<typeof Schema_File>;
};
export default function FileGrid({ data }: Props) {
  const pathname = usePathname();
  const filePath = useMemo<string>(() => {
    const path = [pathname, encodeURIComponent(data.name)].join("/");

    // If start with /, remove it
    if (path.startsWith("/")) {
      return path.slice(1);
    } else {
      return path;
    }
  }, [data, pathname]);

  return (
    <>
      <Link
        href={filePath}
        className={cn(
          "h-full w-full",
          "rounded-[var(--radius)]",
          "flex flex-col content-stretch justify-stretch gap-3",
          "hover:bg-muted/50",
          "transition",
          "border border-border",
        )}
      >
        <div
          className={cn(
            "flex-shrink flex-grow",
            "flex flex-col items-center gap-3",
            "relative",
          )}
        >
          {/* If it's media, show thumbnail */}
          <div className='relative grid h-32 w-full flex-shrink-0 place-items-center bg-muted/25'>
            {data.thumbnailLink &&
            (data.mimeType.startsWith("video") ||
              data.mimeType.startsWith("image")) ? (
              <>
                <img
                  src={`/api/thumb/${data.encryptedId}`}
                  alt={data.name}
                  className='relative z-0 h-32 w-full flex-shrink-0 flex-grow-0 object-contain'
                />

                {data.mimeType.startsWith("video") && (
                  <>
                    <Icon
                      name='Play'
                      className='absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-muted-foreground fill-muted p-1.5 text-muted opacity-50'
                      size={32}
                    />
                    <div className='absolute bottom-0 right-0 z-10 bg-background px-1 py-0.5 text-xs text-foreground'>
                      {durationToReadable(
                        data.videoMediaMetadata?.durationMillis || 0,
                      )}
                    </div>
                  </>
                )}
              </>
            ) : (
              <Icon
                name={
                  data.mimeType.includes("folder")
                    ? "Folder"
                    : getPreviewIcon(data.fileExtension || "", data.mimeType)
                }
                className='size-16 flex-shrink-0 flex-grow-0 p-3'
              />
            )}
          </div>

          {/* File data */}
          <div className='flex h-full w-full flex-col justify-between gap-1.5 px-3 py-1.5'>
            <span className='line-clamp-2 h-full whitespace-pre-wrap text-balance break-all'>
              {data.fileExtension
                ? data.name.replace(new RegExp(`.${data.fileExtension}$`), "")
                : data.name}
            </span>
            <Separator />
            <div className='muted flex items-center justify-between gap-1'>
              <span className='whitespace-nowrap text-sm'>
                {new Date(data.modifiedTime).toLocaleDateString()}
              </span>
              {!data.mimeType.includes("folder") && (
                <>
                  <span className='whitespace-nowrap text-sm'>
                    {bytesToReadable(data.size || 0)}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </Link>
    </>
  );
}
