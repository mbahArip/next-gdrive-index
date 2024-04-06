"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
import { getPreviewIcon } from "~/utils/previewHelper";

import config from "~/config/gIndex.config";

import { CreateDownloadToken } from "./actions";

type Props = {
  data: z.infer<typeof Schema_File>;
};
export default function FileList({ data }: Props) {
  const pathname = usePathname();

  const filePath = useMemo<string>(() => {
    const path = [pathname, encodeURIComponent(data.name)]
      .join("/")
      .replace(/\/+/g, "/");

    return new URL(path, config.basePath).pathname;
  }, [data, pathname]);
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
              <DropdownMenuItem onClick={onCopy}>
                <Icon
                  name='Link'
                  className='mr-3'
                  size={"1rem"}
                />
                Copy link
              </DropdownMenuItem>
              {data.mimeType.includes("folder") ? null : (
                <DropdownMenuItem onClick={onDownload}>
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
                  <Button onClick={onCopy}>
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
                    <Button onClick={onDownload}>
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
                {data.mimeType.includes("folder")
                  ? "folder"
                  : data.fileExtension}
              </span>
              {!data.mimeType.includes("folder") && (
                <>
                  <Icon
                    name='Slash'
                    size={"0.875rem"}
                  />
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
