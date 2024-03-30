"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import toast from "react-hot-toast";
import { z } from "zod";
import Icon from "~/components/Icon";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import config from "~/config/gIndex.config";
import { Schema_File } from "~/schema";
import { cn } from "~/utils";
import bytesToReadable from "~/utils/bytesFormat";
import { getPreviewIcon } from "~/utils/previewHelper";

import { CreateDownloadToken } from "./actions";

type Props = {
  data: z.infer<typeof Schema_File>;
};
export default function FileList({ data }: Props) {
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
          "w-full",
          "px-1.5 py-1",
          "rounded-[var(--radius)]",
          "flex items-center justify-between gap-3",
          "hover:bg-muted/50",
          "transition",
        )}
      >
        <div className={cn("flex-shrink flex-grow", "flex items-center gap-3")}>
          {/* If it's media, show thumbnail */}
          <div className='relative flex-shrink-0 rounded-[var(--radius)] bg-muted/25'>
            {data.thumbnailLink &&
            (data.mimeType.startsWith("video") ||
              data.mimeType.startsWith("image")) ? (
              <>
                <img
                  src={`/api/thumb/${data.encryptedId}`}
                  alt={data.name}
                  className='size-16 flex-shrink-0 flex-grow-0 rounded-[var(--radius)] object-cover tablet:size-12'
                />

                {data.mimeType.startsWith("video") && (
                  <>
                    <Icon
                      name='Play'
                      className='absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-muted-foreground fill-muted p-1.5 text-muted opacity-75'
                      size={24}
                    />
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
                className='size-16 flex-shrink-0 flex-grow-0 p-3 tablet:size-12'
              />
            )}
          </div>

          {/* File data */}
          <div className='flex w-full flex-col'>
            <span className='line-clamp-1 whitespace-pre-wrap break-all'>
              {data.fileExtension
                ? data.name.replace(new RegExp(`.${data.fileExtension}$`), "")
                : data.name}
            </span>
            <div className='muted flex items-center gap-1'>
              <span className='line-clamp-1 whitespace-pre-wrap break-all text-sm'>
                {data.mimeType.includes("folder") ? null : data.mimeType}
              </span>
            </div>
            <div className='muted flex items-center gap-1'>
              <span className='whitespace-nowrap text-sm'>
                {new Date(data.modifiedTime).toLocaleDateString()}
              </span>
              {!data.mimeType.includes("folder") && (
                <>
                  <Icon
                    name='Slash'
                    size={14}
                  />
                  <span className='whitespace-nowrap text-sm'>
                    {bytesToReadable(data.size || 0)}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button
                size={"icon"}
                variant={"ghost"}
              >
                <Icon
                  name='EllipsisVertical'
                  size={16}
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem
                onClick={async (e) => {
                  e.stopPropagation();
                  try {
                    toast.promise(
                      navigator.clipboard.writeText(
                        new URL(filePath, config.basePath).toString(),
                      ),
                      {
                        loading: "Copying link...",
                        success: "Link copied!",
                        error: "Failed to copy link",
                      },
                    );
                  } catch (error) {
                    const e = error as Error;
                    console.error(e.message);
                  }
                }}
              >
                Copy link
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={data.mimeType.includes("folder")}
                onClick={async (e) => {
                  e.stopPropagation();
                  toast.loading("Creating download token...", {
                    id: `download-${data.encryptedId}`,
                  });
                  try {
                    const token = await CreateDownloadToken();
                    if (!token)
                      throw new Error("Failed to create download token");
                    toast.success("Opening download link...", {
                      id: `download-${data.encryptedId}`,
                    });

                    const timeout = setTimeout(() => {
                      clearTimeout(timeout);
                      window.open(
                        `/api/download/${data.encryptedId}?token=${token}`,
                      );
                    }, 1000);
                  } catch (error) {
                    const e = error as Error;
                    console.error(e.message);
                    toast.error(e.message, {
                      id: `download-${data.encryptedId}`,
                    });
                  }
                }}
              >
                Download
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Link>
    </>
  );
}
