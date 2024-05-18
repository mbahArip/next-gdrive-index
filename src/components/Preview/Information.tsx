"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { z } from "zod";

import { ButtonLoading } from "~/components/Global";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "~/components/ui/dialog";
import { Drawer, DrawerClose, DrawerContent, DrawerFooter, DrawerHeader, DrawerTrigger } from "~/components/ui/drawer";
import { Separator } from "~/components/ui/separator";

import { bytesToReadable } from "~/utils/bytesFormat";
import { cn } from "~/utils/cn";
import { durationToReadable } from "~/utils/durationFormat";
import { getFileType } from "~/utils/previewHelper";

import useMediaQuery from "~/hooks/useMediaQuery";

import { ButtonState, Schema_File } from "~/types/schema";

import { CreateDownloadToken } from "actions";
import config from "config";

type Props = {
  file: z.infer<typeof Schema_File>;
};
export default function PreviewInformation({ file }: Props) {
  const pathname = usePathname();

  const showRaw = useMemo<boolean>(() => {
    return file.mimeType.startsWith("image") || file.mimeType.startsWith("video") || file.mimeType.startsWith("audio");
  }, [file]);
  const showViewDoc = useMemo<boolean>(() => {
    const fileExtensionFallback = file.name.split(".").pop();
    const fileExt = file.fileExtension ?? fileExtensionFallback;
    if (!fileExt) return false;
    const fileType = getFileType(fileExt, file.mimeType);
    return fileType === "document" || fileType === "pdf";
  }, [file]);

  const fileInfo = useMemo<{ label: string; value: string }[]>(() => {
    const value = [
      {
        label: "File Name",
        value: file.name,
      },
      {
        label: "Mime Type",
        value: file.mimeType,
      },
      {
        label: "Size",
        value: `${bytesToReadable(file.size || 0)} (${file.size || 0} bytes)`,
      },
      {
        label: "Last Modified",
        value: file.modifiedTime,
      },
    ];
    if (file.imageMediaMetadata) {
      value.push({
        label: "Dimension",
        value: `${file.imageMediaMetadata.width} x ${file.imageMediaMetadata.height}`,
      });
    }
    if (file.videoMediaMetadata) {
      value.push({
        label: "Dimension",
        value: `${file.videoMediaMetadata.width} x ${file.videoMediaMetadata.height}`,
      });
      value.push({
        label: "Duration",
        value: durationToReadable(file.videoMediaMetadata.durationMillis),
      });
    }

    return value;
  }, [file]);

  const [viewerState, setViewerState] = useState<ButtonState>("idle");
  const [copyRawState, setCopyRawState] = useState<ButtonState>("idle");
  const [copyDownloadState, setCopyDownloadState] = useState<ButtonState>("idle");
  const [downloadState, setDownloadState] = useState<ButtonState>("idle");
  const [isRawExplanationOpen, setIsRawExplanationOpen] = useState<boolean>(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const onCopyRaw = async () => {
    setCopyRawState("loading");
    try {
      const rawURL = new URL(`/api/raw/${pathname}`.replace(/\/+/g, "/"), config.basePath);
      rawURL.searchParams.append("token", file.encryptedId);
      toast.promise(navigator.clipboard.writeText(rawURL.toString()), {
        loading: "Copying link...",
        success: "Raw link copied!",
        error: "Failed to copy link",
      });
    } catch (error) {
      const e = error as Error;
      console.error(e.message);
    } finally {
      setCopyRawState("idle");
    }
  };
  const onCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setCopyDownloadState("loading");
    toast.loading("Creating download token...", {
      id: `download-${file.encryptedId}`,
    });
    try {
      const token = await CreateDownloadToken();
      if (!token) throw new Error("Failed to create download token");
      await navigator.clipboard.writeText(
        new URL(`/api/download/${file.encryptedId}?token=${token}`, config.basePath).toString(),
      );
      toast.success("Download link copied!", {
        id: `download-${file.encryptedId}`,
      });
    } catch (error) {
      const e = error as Error;
      console.error(e.message);
      toast.error(e.message, {
        id: `download-${file.encryptedId}`,
      });
    } finally {
      setCopyDownloadState("idle");
    }
  };
  const onDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setDownloadState("loading");
    toast.loading("Creating download token...", {
      id: `download-${file.encryptedId}`,
    });
    try {
      const token = await CreateDownloadToken();
      if (!token) throw new Error("Failed to create download token");
      toast.success("Opening download link...", {
        id: `download-${file.encryptedId}`,
      });

      const timeout = setTimeout(() => {
        clearTimeout(timeout);
        window.open(`/api/download/${file.encryptedId}?token=${token}`);
      }, 250);
    } catch (error) {
      const e = error as Error;
      console.error(e.message);
      toast.error(e.message, {
        id: `download-${file.encryptedId}`,
      });
    } finally {
      setDownloadState("idle");
    }
  };
  const onOpenViewer = async (e: React.MouseEvent) => {
    e.stopPropagation();
    toast.loading("Creating view token...", {
      id: `view-${file.encryptedId}`,
    });
    setViewerState("loading");
    try {
      const token = await CreateDownloadToken();
      if (!token) throw new Error("Failed to create view token");
      const streamURL = new URL(`/api/stream/${file.encryptedId}`, config.basePath);
      streamURL.searchParams.set("token", token);
      toast.success("Opening viewer link...", {
        id: `view-${file.encryptedId}`,
      });

      const timeout = setTimeout(() => {
        clearTimeout(timeout);
        const viewerUrl = new URL(`/gview`, "https://docs.google.com");
        viewerUrl.searchParams.set("url", streamURL.toString());
        viewerUrl.searchParams.set("embedded", "true");
        window.open(viewerUrl.toString(), "_blank");
      }, 250);
    } catch (error) {
      const e = error as Error;
      console.error(e.message);
      toast.error(e.message, {
        id: `view-${file.encryptedId}`,
      });
    } finally {
      setViewerState("idle");
    }
  };

  return (
    <div className='grid grid-cols-1 gap-3'>
      <Card slot='file-actions'>
        <div className='flex flex-col-reverse gap-3 p-6 tablet:flex-row tablet:items-center tablet:justify-between'>
          <div
            slot='raw-explanation'
            className={cn("flex gap-3", !showRaw && "invisible")}
          >
            {isDesktop ? (
              <Dialog
                open={isRawExplanationOpen}
                onOpenChange={setIsRawExplanationOpen}
              >
                <DialogTrigger asChild>
                  <span className='cursor-pointer text-center text-sm text-blue-600 opacity-80 transition-all duration-300 hover:opacity-100 dark:text-blue-400 tablet:text-start'>
                    Difference between download link and raw link?
                  </span>
                </DialogTrigger>
                <DialogContent>
                  <div className='flex h-fit flex-col gap-3'>
                    <h4>Why?</h4>
                    <p>
                      Some services need the file extension to be present in the URL to properly embed the file.
                      <br />
                      - The download link only have encrypted file id.
                      <br />
                      - The raw link will have the whole path includes the file name and extension.
                      <br />
                      <br />
                      So if you want to embed the file, it&apos;s recommended to use the raw link instead of the
                      download link.
                    </p>
                    <p className='muted'>Note: This is only applicable for video, audio, and image files.</p>
                    <h4>Ref</h4>
                    <p>
                      This information is based on the onedrive-vercel-index project documentation.
                      <br />
                      <Link
                        href='https://ovi.swo.moe/docs/features/customise-direct-link'
                        target='_blank'
                        rel='noreferrer noopener'
                        className='text-blue-600 opacity-80 transition-all duration-300 hover:opacity-100 dark:text-blue-400'
                      >
                        Customise Direct Link - onedrive-vercel-index
                      </Link>
                    </p>
                  </div>
                </DialogContent>
              </Dialog>
            ) : (
              <Drawer
                open={isRawExplanationOpen}
                onOpenChange={setIsRawExplanationOpen}
                shouldScaleBackground
              >
                <DrawerTrigger asChild>
                  <span className='cursor-pointer text-center text-sm text-blue-600 opacity-80 transition-all duration-300 hover:opacity-100 dark:text-blue-400 tablet:text-start'>
                    Difference between download link and raw link?
                  </span>
                </DrawerTrigger>
                <DrawerContent>
                  <DrawerHeader></DrawerHeader>
                  <div className='flex h-fit flex-col gap-3 px-4'>
                    <h4>Why?</h4>
                    <p>
                      Some services need the file extension to be present in the URL to properly embed the file.
                      <br />
                      - The download link only have encrypted file id.
                      <br />
                      - The raw link will have the whole path includes the file name and extension.
                      <br />
                      <br />
                      So if you want to embed the file, it&apos;s recommended to use the raw link instead of the
                      download link.
                    </p>
                    <h4>Ref</h4>
                    <p>
                      This information is based on the onedrive-vercel-index project documentation.
                      <br />
                      <Link
                        href='https://ovi.swo.moe/docs/features/customise-direct-link'
                        target='_blank'
                        rel='noreferrer noopener'
                        className='text-blue-600 opacity-80 transition-all duration-300 hover:opacity-100 dark:text-blue-400'
                      >
                        Customise Direct Link - onedrive-vercel-index
                      </Link>
                    </p>
                  </div>
                  <DrawerFooter>
                    <DrawerClose asChild>
                      <Button
                        size={"sm"}
                        variant={"secondary"}
                      >
                        Close
                      </Button>
                    </DrawerClose>
                  </DrawerFooter>
                </DrawerContent>
              </Drawer>
            )}
          </div>

          <div className='flex flex-col-reverse gap-3 tablet:flex-row tablet:items-center'>
            {showRaw ? (
              <ButtonLoading
                size={"sm"}
                variant={"outline"}
                icon='Copy'
                onClick={onCopyRaw}
                state={copyRawState}
              >
                Raw Link
              </ButtonLoading>
            ) : null}
            {showViewDoc ? (
              <ButtonLoading
                size={"sm"}
                variant={"outline"}
                icon='ExternalLink'
                onClick={onOpenViewer}
                state={viewerState}
              >
                Open in Viewer
              </ButtonLoading>
            ) : null}

            <ButtonLoading
              size={"sm"}
              variant={"outline"}
              onClick={onCopy}
              state={copyDownloadState}
              icon={"Copy"}
            >
              Download Link
            </ButtonLoading>

            <ButtonLoading
              size={"sm"}
              onClick={onDownload}
              state={downloadState}
              icon='Download'
            >
              Download
            </ButtonLoading>
          </div>
        </div>
      </Card>

      <Card slot='file-info'>
        <CardHeader>
          <CardTitle>File Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex flex-col gap-1.5'>
            {fileInfo.map((info) => (
              <div
                key={info.label}
                className='group flex flex-col'
              >
                <span className='text-sm font-semibold'>{info.label}:</span>
                <span className='col-span-3 whitespace-pre-wrap break-all'>{info.value}</span>
                <Separator className='my-1.5 group-last-of-type:hidden' />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
