"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import nProgress from "nprogress";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { z } from "zod";

import { Icon } from "~/components/Global";
import { ResponsiveDropdown } from "~/components/Layout";
import { Button } from "~/components/ui/button";
import { DrawerClose } from "~/components/ui/drawer";

import { bytesToReadable } from "~/utils/bytesFormat";
import { cn } from "~/utils/cn";
import { durationToReadable } from "~/utils/durationFormat";
import { getPreviewIcon } from "~/utils/previewHelper";

import { Schema_File } from "~/types/schema";

import { CreateDownloadToken } from "actions";
import config from "config";

type Props = {
  data: z.infer<typeof Schema_File>;
  disabled?: boolean;
};
export default function FileGrid({ data, disabled }: Props) {
  const pathname = usePathname();
  const filePath = useMemo<string>(() => {
    const path = [pathname, encodeURIComponent(data.name)].join("/").replace(/\/+/g, "/");

    return new URL(path, config.basePath).pathname;
  }, [data, pathname]);

  const [thumbnailURL, setThumbnailURL] = useState<string>(`/api/thumb/${data.encryptedId}?size=2`);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  const onCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    toast.loading("Copying link...", {
      id: `copy-${data.encryptedId}`,
    });

    try {
      await navigator.clipboard.writeText(new URL(filePath, config.basePath).toString());

      toast.success("Link copied!", {
        id: `copy-${data.encryptedId}`,
      });
    } catch (error) {
      const e = error as Error;
      console.error(e.message);
      toast.error(e.message, {
        id: `copy-${data.encryptedId}`,
      });
    }
  };
  const onDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    toast.loading("Preparing download link...", {
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
      }, 500);
    } catch (error) {
      const e = error as Error;
      console.error(e.message);
      toast.error(e.message, {
        id: `download-${data.encryptedId}`,
      });
    }
  };

  return (
    <div className='relative h-full w-full'>
      <ResponsiveDropdown
        slot='actions'
        open={isMenuOpen}
        onOpenChange={setIsMenuOpen}
        trigger={
          <Button
            size={"icon"}
            variant={"secondary"}
            className='absolute right-1 top-1 z-20 size-8'
          >
            <Icon
              name='EllipsisVertical'
              size={"1rem"}
            />
          </Button>
        }
        desktop={{
          align: "end",
          items: [
            {
              type: "item",
              key: "copy",
              title: "Copy link",
              icon: "Link",
              onClick: onCopy,
              disabled: disabled,
            },
            {
              type: "item",
              key: "download",
              title: "Download",
              icon: "Download",
              onClick: onDownload,
              disabled: data.mimeType.includes("folder") || disabled,
            },
          ],
        }}
        mobile={{
          title: "Actions",
          description: "What would you like to do with this file?",
          content: (
            <>
              <DrawerClose asChild>
                <Button
                  variant={"outline"}
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
              <DrawerClose asChild>
                <Button
                  variant={"outline"}
                  onClick={onDownload}
                  disabled={disabled || data.mimeType.includes("folder")}
                >
                  <Icon
                    name='Download'
                    className='mr-3'
                    size={"1rem"}
                  />
                  Download
                </Button>
              </DrawerClose>
            </>
          ),
          closeOnFooter: true,
        }}
      />

      <Link
        slot='data'
        href={filePath}
        className={cn(
          "h-full w-full rounded-[var(--radius)]",
          "border border-border transition",
          "flex flex-col content-stretch justify-stretch gap-3",
          "hover:bg-muted/50",
        )}
        onClick={async (e) => {
          if (disabled) {
            e.preventDefault();
            e.stopPropagation();
            await new Promise((resolve) => setTimeout(resolve, 500));
            nProgress.done(true);
          }
        }}
      >
        <div className={cn("flex flex-shrink flex-grow flex-col items-center gap-3", "relative")}>
          {/* If it's media, show thumbnail */}
          <div className='relative grid h-32 w-full flex-shrink-0 place-items-center overflow-hidden bg-muted/25'>
            {data.thumbnailLink && (data.mimeType.startsWith("video") || data.mimeType.startsWith("image")) ? (
              <>
                <img
                  src={thumbnailURL}
                  alt={data.name}
                  onLoad={(e) => {
                    if (thumbnailURL.includes("size=2")) {
                      setThumbnailURL(`/api/thumb/${data.encryptedId}`);
                    }
                  }}
                  className='rounded-top-[var(--radius)] absolute -z-0 h-32 w-full flex-shrink-0 flex-grow-0 object-cover opacity-50'
                />
                <img
                  src={thumbnailURL}
                  alt={data.name}
                  onLoad={(e) => {
                    if (thumbnailURL.includes("size=2")) {
                      setThumbnailURL(`/api/thumb/${data.encryptedId}`);
                    }
                  }}
                  className='relative z-0 h-32 w-full flex-shrink-0 flex-grow-0 object-contain backdrop-blur'
                />

                {data.mimeType.startsWith("video") && (
                  <>
                    <Icon
                      name='Play'
                      className='absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-muted-foreground fill-muted p-1.5 text-muted opacity-75'
                      size={"2rem"}
                    />
                    <div className='absolute bottom-0 right-0 z-10 bg-background px-1 py-0.5 text-xs text-foreground'>
                      {durationToReadable(data.videoMediaMetadata?.durationMillis || 0)}
                    </div>
                  </>
                )}
              </>
            ) : (
              <Icon
                name={
                  data.mimeType.includes("folder") ? "Folder" : getPreviewIcon(data.fileExtension || "", data.mimeType)
                }
                className='size-16 flex-shrink-0 flex-grow-0 p-3'
              />
            )}
          </div>

          {/* File data */}
          <div className='flex h-full w-full flex-col justify-between gap-1.5 px-3 py-1.5'>
            <span className='line-clamp-2 h-full whitespace-pre-wrap text-pretty break-all'>
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
                  config.siteConfig.showFileExtension && !data.mimeType.includes("folder") ? "hidden" : "",
                )}
              >
                {data.mimeType.includes("folder") ? "folder" : data.fileExtension || "unknown"}
              </span>
              {!data.mimeType.includes("folder") && (
                <>
                  {config.siteConfig.showFileExtension ? null : (
                    <Icon
                      name='Slash'
                      size={"0.875rem"}
                    />
                  )}
                  <span className='whitespace-nowrap text-sm'>{bytesToReadable(data.size || 0)}</span>
                </>
              )}
            </div>
            <div className='muted flex items-center gap-1'>
              <span className='whitespace-nowrap text-sm'>{new Date(data.modifiedTime).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
