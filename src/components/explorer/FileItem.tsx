"use client";

import { usePathname } from "next/navigation";
import { useCallback, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { type z } from "zod";

import { Button } from "~/components/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "~/components/ui/context-menu";
import Icon from "~/components/ui/icon";

import { type TLayout } from "~/context/layoutContext";
import useRouter from "~/hooks/usePRouter";
import { getPreviewIcon } from "~/lib/previewHelper";
import { bytesToReadable, cn, durationToReadable, formatDate } from "~/lib/utils";

import { type Schema_File } from "~/types/schema";

import config from "config";

type Props = {
  data: z.infer<typeof Schema_File>;
  layout: TLayout;
};
export default function FileItem({ data, layout }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const filePath = useMemo<string>(() => {
    const path = [pathname, encodeURIComponent(data.name)].join("/").replace(/\/+/g, "/");
    return new URL(path, config.basePath).pathname;
  }, [data.name, pathname]);

  const contextButtonRef = useRef<HTMLDivElement>(null);
  const copyTimeout = useRef<NodeJS.Timeout | null>(null);

  const useThumbnail = useMemo<boolean>(
    () => !!(data.thumbnailLink && (data.mimeType.includes("image") || data.mimeType.includes("video"))),
    [data],
  );
  // Using proxied URL to avoid CORS issues
  // Also using state to load smaller thumbnail first
  const [thumbnailUrl, setThumbnailUrl] = useState<string>(`/api/thumb/${data.encryptedId}?size=2`);
  const [thumbnailLoading, setThumbnailLoading] = useState<boolean>(true);

  // Unused for now
  // Might be added on next version (?)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isShareDialogOpen, setShareDialogOpen] = useState<boolean>(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [copyStatus, setCopyStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const onOpenNewTab = useCallback(async () => {
    void 0;
  }, []);
  const onCopy = useCallback(async () => {
    if (copyTimeout.current) clearTimeout(copyTimeout.current);

    setCopyStatus("loading");
    toast.loading("Copying link...", {
      id: `copy-${data.encryptedId}`,
    });
    try {
      await navigator.clipboard.writeText(new URL(filePath, config.basePath).toString());
      toast.success(`Link to ${data.mimeType.includes("folder") ? "folder" : "file"} copied!`, {
        description: <span className='line-clamp-2 whitespace-pre-wrap break-all'>{data.name}</span>,
        id: `copy-${data.encryptedId}`,
      });
      setCopyStatus("success");
    } catch (error) {
      const e = error as Error;
      console.error(`[onCopy] ${e.message}`);
      toast.error(e.message, {
        description: <span className='line-clamp-2 whitespace-pre-wrap break-all'>{data.name}</span>,
        id: `copy-${data.encryptedId}`,
      });
      setCopyStatus("error");
    } finally {
      copyTimeout.current = setTimeout(() => {
        setCopyStatus("idle");
      }, 3000);
    }
  }, [data.encryptedId, data.mimeType, data.name, filePath]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const onShare = useCallback(async () => {
    setShareDialogOpen(true);
  }, []);
  const onDownload = useCallback(async () => {
    void 0;
  }, []);

  return (
    <>
      <ContextMenu modal={false}>
        <ContextMenuTrigger asChild>
          <div
            slot='file-item'
            ref={contextButtonRef}
            title={data.name}
            onClick={() => {
              router.push(filePath);
            }}
            className={cn(
              "group grid h-full w-full cursor-pointer overflow-hidden rounded-lg border bg-card text-card-foreground shadow transition hover:border-primary/50",
              layout === "list" && "flex items-center",
            )}
          >
            {/* Thumbnail / Icon */}
            <div
              className={cn(
                "relative grid aspect-video h-24 w-full shrink-0 place-items-center overflow-hidden bg-background mobile:h-28 tablet:h-32",
                layout === "list" && "aspect-square h-20 w-20 mobile:h-24 mobile:w-24 tablet:h-28 tablet:w-28",
              )}
            >
              {useThumbnail ? (
                <>
                  <img
                    src={thumbnailUrl}
                    alt={data.name}
                    className={cn(
                      "absolute -z-0 h-24 w-full shrink-0 grow-0 object-cover object-center opacity-50 blur-sm mobile:h-28 tablet:h-32",
                      layout === "list" && "h-20 mobile:h-24 tablet:h-28",
                    )}
                  />
                  <img
                    src={thumbnailUrl}
                    alt={data.name}
                    onLoad={() => {
                      if (thumbnailUrl.endsWith("?size=2")) {
                        setThumbnailUrl(`/api/thumb/${data.encryptedId}`);
                        setThumbnailLoading(false);
                      }
                    }}
                    className={cn(
                      "relative z-0 h-24 w-full shrink-0 grow-0 object-contain object-center transition duration-500 ease-in-out group-hover:scale-105 mobile:h-28 tablet:h-32",
                      layout === "list" && "h-20 mobile:h-24 tablet:h-28",
                      thumbnailLoading ? "blur-lg" : "blur-0",
                    )}
                  />

                  {/* Play Icon */}
                  {data.mimeType.includes("video") && (
                    <div className='absolute inset-0 z-0 grid h-full w-full place-items-center'>
                      <Button
                        size={"icon"}
                        variant={"outline"}
                        className='rounded-full group-hover:bg-accent group-hover:stroke-accent-foreground group-hover:text-accent-foreground'
                      >
                        <Icon
                          name='Play'
                          className='fill-current'
                        />
                      </Button>
                      <div className='absolute bottom-0.5 right-0.5 z-0 rounded-sm bg-muted px-1 py-0.5 text-[10px] text-muted-foreground shadow-sm mobile:bottom-1 mobile:right-1 mobile:text-xs'>
                        {durationToReadable(data.videoMediaMetadata?.durationMillis ?? 0)}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className='grid h-full w-full place-items-center'>
                  <Icon
                    name={
                      data.mimeType.includes("folder")
                        ? "Folder"
                        : getPreviewIcon(data.fileExtension ?? "", data.mimeType)
                    }
                    className={cn("size-10 stroke-muted-foreground", layout === "list" && "size-8")}
                  />
                </div>
              )}
            </div>

            {/* Info */}
            <div
              className={cn(
                "flex h-full grow items-start justify-between gap-2 p-2",
                layout === "list" && "items-center",
              )}
            >
              <div className='flex h-full grow flex-col justify-between gap-2'>
                <span className='line-clamp-2 h-full whitespace-pre-wrap text-pretty break-all text-base mobile:text-sm'>
                  {config.siteConfig.showFileExtension
                    ? data.name
                    : data.fileExtension
                    ? data.name.replace(new RegExp(`.${data.fileExtension}$`), "")
                    : data.name}
                </span>

                <div className='flex flex-col gap-1'>
                  <span className='inline-flex items-center gap-1 text-xs text-muted-foreground'>
                    {/* Type */}
                    {data.mimeType.includes("folder") ? (
                      "Folder"
                    ) : config.siteConfig.showFileExtension ? (
                      <></>
                    ) : (
                      data.fileExtension ?? "Unknown format"
                    )}
                    {/* Slash */}
                    {!data.mimeType.includes("folder") && !config.siteConfig.showFileExtension && (
                      <Icon
                        name='Slash'
                        className='size-3'
                      />
                    )}
                    {/* Size */}
                    {!data.mimeType.includes("folder") && bytesToReadable(data.size ?? 0)}
                  </span>
                  <span className='text-xs text-muted-foreground'>{formatDate(data.modifiedTime)}</span>
                </div>
              </div>
              <Button
                size={"icon"}
                variant={"ghost"}
                className={cn("h-8 w-8 shrink-0 rounded-full", layout === "list" && "h-10 w-10")}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();

                  const menuEvent = new MouseEvent("contextmenu", {
                    bubbles: true,
                    cancelable: true,
                    view: window,
                    button: 2,
                    buttons: 2,
                    clientX: e.clientX,
                    clientY: e.clientY,
                  });
                  contextButtonRef.current?.dispatchEvent(menuEvent);
                }}
              >
                <Icon name='EllipsisVertical' />
              </Button>
            </div>
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onSelect={onOpenNewTab}>
            <Icon
              name='ExternalLink'
              className='mr-2'
            />
            Open in new tab
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem onSelect={onCopy}>
            <Icon
              name='Copy'
              className='mr-2'
            />
            Copy link
          </ContextMenuItem>
          <ContextMenuItem
            onSelect={onDownload}
            disabled={data.mimeType.includes("folder")}
          >
            <Icon
              name='Download'
              className='mr-2'
            />
            Download
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      {/* <ResponsiveDialog
        open={isShareDialogOpen}
        onOpenChange={setShareDialogOpen}
      >
        <ResponsiveDialogContent>
          <ResponsiveDialogHeader>
            <ResponsiveDialogTitle>Share link</ResponsiveDialogTitle>
            <ResponsiveDialogDescription>
              Share the link with others to give them access to this file.
            </ResponsiveDialogDescription>
          </ResponsiveDialogHeader>

          <ResponsiveDialogBody className='flex flex-col gap-4'>
            <pre className='flex w-full items-center justify-between gap-2 rounded-md bg-muted p-2 text-muted-foreground'>
              <code className='grow select-all text-sm'>{new URL(filePath, config.basePath).toString()}</code>
              <LoadingButton
                loading={copyStatus === "loading"}
                size={"icon"}
                variant={"ghost"}
                onClick={onCopy}
              >
                <Icon
                  name={copyStatus === "idle" ? "Copy" : copyStatus === "success" ? "Check" : "X"}
                  className={cn(
                    "transition",
                    copyStatus === "success" && "stroke-green-600",
                    copyStatus === "error" && "stroke-destructive",
                  )}
                />
              </LoadingButton>
            </pre>

            <Separator className='bg-input' />

            <div className='grid gap-2 tablet:grid-cols-4'>
              {["facebook", "twitter", "whatsapp"].map((platform) => (
                <Link
                  key={platform}
                  href={shareUrl[platform as keyof typeof shareUrl]!}
                  target='_blank'
                  rel='noopener noreferrer'
                  className={cn("flex items-center justify-center gap-2 rounded-md bg-muted p-2", "hover:bg-muted/50")}
                >
                  <span>{platform}</span>
                </Link>
              ))}
            </div>
          </ResponsiveDialogBody>

          <ResponsiveDialogFooter>
            <ResponsiveDialogClose asChild>
              <Button variant={"secondary"}>Close</Button>
            </ResponsiveDialogClose>
          </ResponsiveDialogFooter>
        </ResponsiveDialogContent>
      </ResponsiveDialog> */}
    </>
  );
}
