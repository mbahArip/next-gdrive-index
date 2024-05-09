"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import nProgress from "nprogress";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { z } from "zod";
import { Schema_File } from "~/schema";
import { cn } from "~/utils";

import Icon from "~/components/Icon";
import { Button } from "~/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "~/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

import useMediaQuery from "~/hooks/useMediaQuery";
import bytesToReadable from "~/utils/bytesFormat";
import { durationToReadable } from "~/utils/durationFormat";
import { getPreviewIcon } from "~/utils/previewHelper";

import config from "~/config/gIndex.config";

import { CreateDownloadToken } from "./actions";

type Props = {
  data: z.infer<typeof Schema_File>;
  disabled?: boolean;
};
export default function FileList({ data, disabled }: Props) {
  const pathname = usePathname();

  const filePath = useMemo<string>(() => {
    const path = [pathname, encodeURIComponent(data.name)]
      .join("/")
      .replace(/\/+/g, "/");

    return new URL(path, config.basePath).pathname;
  }, [data, pathname]);

  const [thumbnailURL, setThumbnailURL] = useState<string>(
    `/api/thumb/${data.encryptedId}?size=2`,
  );
  const [actionOpen, setActionOpen] = useState<boolean>(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const onCopy = async (e: React.MouseEvent) => {
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
  };
  const onDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    toast.loading("Creating download token...", {
      id: `download-${data.encryptedId}`,
    });
    try {
      const token = await CreateDownloadToken();
      if (!token) throw new Error("Failed to create download token");
      toast.success("Opening download link...", {
        id: `download-${data.encryptedId}`,
      });

      const timeout = setTimeout(() => {
        clearTimeout(timeout);
        window.open(`/api/download/${data.encryptedId}?token=${token}`);
      }, 1000);
    } catch (error) {
      const e = error as Error;
      console.error(e.message);
      toast.error(e.message, {
        id: `download-${data.encryptedId}`,
      });
    }
  };

  return (
    <div className='relative flex h-full w-full flex-row-reverse items-center'>
      <div className='absolute bottom-auto right-0 top-auto grid flex-grow place-items-center'>
        {isDesktop ? (
          <DropdownMenu
            open={actionOpen}
            onOpenChange={setActionOpen}
          >
            <DropdownMenuTrigger asChild>
              <Button
                size={"icon"}
                variant={"ghost"}
                // className='size-8'
                className='absolute right-1 z-20 size-8'
              >
                <Icon
                  name='EllipsisVertical'
                  size={16}
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem
                onClick={onCopy}
                disabled={disabled}
              >
                <Icon
                  name='Link'
                  className='mr-3'
                  size={"1rem"}
                />
                Copy link
              </DropdownMenuItem>
              {data.mimeType.includes("folder") ? null : (
                <DropdownMenuItem
                  onClick={onDownload}
                  disabled={disabled}
                >
                  <Icon
                    name='Download'
                    className='mr-3'
                    size={"1rem"}
                  />
                  Download
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Drawer
            open={actionOpen}
            onOpenChange={setActionOpen}
            shouldScaleBackground
          >
            <DrawerTrigger asChild>
              <Button
                size={"icon"}
                variant={"ghost"}
                // className='size-8'
                className='z-20 size-8'
              >
                <Icon
                  name='EllipsisVertical'
                  size={16}
                />
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader className='text-left'>
                <DrawerTitle>Actions</DrawerTitle>
                <DrawerDescription>
                  What would you like to do with this file?
                </DrawerDescription>
              </DrawerHeader>
              <div className='grid gap-1.5 px-4'>
                <DrawerClose asChild>
                  <Button
                    onClick={onCopy}
                    disabled={disabled}
                  >
                    <Icon
                      name='Link'
                      className='mr-3'
                      size={"1rem"}
                    />
                    Copy link
                  </Button>
                </DrawerClose>
                {data.mimeType.includes("folder") ? null : (
                  <DrawerClose asChild>
                    <Button
                      onClick={onDownload}
                      disabled={disabled}
                    >
                      <Icon
                        name='Download'
                        className='mr-3'
                        size={"1rem"}
                      />
                      Download
                    </Button>
                  </DrawerClose>
                )}
              </div>

              <DrawerFooter>
                <DrawerClose asChild>
                  <Button variant={"secondary"}>Close</Button>
                </DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        )}
      </div>
      <Link
        onClick={async (e) => {
          if (disabled) {
            e.preventDefault();
            e.stopPropagation();
            await new Promise((resolve) => setTimeout(resolve, 500));
            nProgress.done(true);
          }
        }}
        href={filePath}
        className={cn(
          "relative",
          // "w-full",
          "px-1.5 py-1 pr-10", // since action button is size-8
          "rounded-[var(--radius)]",
          "flex flex-grow items-center justify-between gap-3",
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
                  src={thumbnailURL}
                  alt={data.name}
                  onLoad={(e) => {
                    if (thumbnailURL.includes("size=2")) {
                      setThumbnailURL(`/api/thumb/${data.encryptedId}`);
                    }
                  }}
                  className='size-16 flex-shrink-0 flex-grow-0 rounded-[var(--radius)] object-cover tablet:size-20'
                />

                {data.mimeType.startsWith("video") && (
                  <>
                    <Icon
                      name='Play'
                      className='absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-muted-foreground fill-muted p-1.5 text-muted opacity-75'
                      size={24}
                    />
                    <div className='absolute bottom-0 right-0 z-10 bg-background px-1 py-0.5 text-[10px] text-foreground tablet:text-xs'>
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
                className='size-16 flex-shrink-0 flex-grow-0 p-3 tablet:size-20'
              />
            )}
          </div>

          {/* File data */}
          <div className='flex flex-grow flex-col'>
            <span className='line-clamp-1 whitespace-pre-wrap break-all'>
              {config.siteConfig.showFileExtension
                ? data.name
                : data.fileExtension
                ? data.name.replace(new RegExp(`.${data.fileExtension}$`), "")
                : data.name}
            </span>
            <div className='muted flex items-center gap-1'>
              <span
                className={cn(
                  "line-clamp-1 whitespace-pre-wrap break-all text-sm",
                  config.siteConfig.showFileExtension &&
                    !data.mimeType.includes("folder")
                    ? "hidden"
                    : "",
                )}
              >
                {data.mimeType.includes("folder")
                  ? "folder"
                  : data.fileExtension || "unknown"}
              </span>
              {!data.mimeType.includes("folder") && (
                <>
                  {config.siteConfig.showFileExtension ? null : (
                    <Icon
                      name='Slash'
                      size={"0.875rem"}
                    />
                  )}
                  <span className='whitespace-nowrap text-sm'>
                    {bytesToReadable(data.size || 0)}
                  </span>
                </>
              )}
            </div>
            <div className='muted flex items-center gap-1'>
              <span className='whitespace-nowrap text-sm'>
                {new Date(data.modifiedTime).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
