"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { type z } from "zod";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

import { getFileType } from "~/lib/previewHelper";
import { bytesToReadable, durationToReadable, formatDate } from "~/lib/utils";

import { type Schema_File } from "~/types/schema";

import { CreateDownloadToken } from "actions";
import config from "config";

import { Button, LoadingButton } from "../ui/button";
import {
  ResponsiveDialog,
  ResponsiveDialogBody,
  ResponsiveDialogClose,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from "../ui/dialog.responsive";
import {
  ResponsiveDropdownMenu,
  ResponsiveDropdownMenuContent,
  ResponsiveDropdownMenuItem,
  ResponsiveDropdownMenuSeparator,
  ResponsiveDropdownMenuTrigger,
} from "../ui/dropdown-menu.responsive";
import Icon from "../ui/icon";
import { Separator } from "../ui/separator";

type Props = {
  file: z.infer<typeof Schema_File>;
};
export default function PreviewInformation({ file }: Props) {
  const pathname = usePathname();
  const fileType = useMemo<ReturnType<typeof getFileType>>(() => {
    return getFileType(file.fileExtension ?? "", file.mimeType) ?? "unknown";
  }, [file]);

  const showVirusTotal = useMemo<boolean>(
    () => fileType === "executable" || fileType === "manga" || fileType === "unknown",
    [fileType],
  );
  const showRawUrl = useMemo<boolean>(
    () => fileType === "video" || fileType === "audio" || fileType === "image",
    [fileType],
  );
  const showViewDoc = useMemo<boolean>(() => fileType === "document", [fileType]);

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
        value: `${bytesToReadable(file.size ?? 0)} (${file.size ?? 0} bytes)`,
      },
      {
        label: "Last Modified",
        value: formatDate(file.modifiedTime),
      },
    ];
    if (file.imageMediaMetadata) {
      value.push({
        label: "Dimension",
        value: `${file.imageMediaMetadata.width}px x ${file.imageMediaMetadata.height}px (${
          Math.round((file.imageMediaMetadata.width / file.imageMediaMetadata.height) * 100) / 100
        })`,
      });
    }
    if (file.videoMediaMetadata) {
      value.push({
        label: "Dimension",
        value: `${file.videoMediaMetadata.width}px x ${file.videoMediaMetadata.height}px (${
          Math.round((file.videoMediaMetadata.width / file.videoMediaMetadata.height) * 100) / 100
        })`,
      });
      value.push({
        label: "Duration",
        value: durationToReadable(file.videoMediaMetadata.durationMillis),
      });
    }

    return value;
  }, [file]);

  const [viewerBtnLoading, setViewerBtnLoading] = useState<boolean>(false);
  const [copyBtnLoading, setCopyBtnLoading] = useState<boolean>(false);
  const [copyDownloadBtnLoading, setCopyDownloadBtnLoading] = useState<boolean>(false);
  const [downloadBtnLoading, setDownloadBtnLoading] = useState<boolean>(false);
  const [isRawExplanationOpen, setIsRawExplanationOpen] = useState<boolean>(false);

  const onCopyRawLink = useCallback(async () => {
    try {
      const rawUrl = new URL(`/api/raw?url=${encodeURIComponent(pathname)}`, config.basePath);
    } catch (error) {}
  }, []);

  const onCopyRaw = async () => {
    setCopyBtnLoading(true);
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
      setCopyBtnLoading(false);
    }
  };
  const onCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setCopyDownloadBtnLoading(true);
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
      setCopyDownloadBtnLoading(false);
    }
  };
  const onDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setDownloadBtnLoading(true);
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
      setDownloadBtnLoading(false);
    }
  };
  const onOpenViewer = async (e: React.MouseEvent) => {
    e.stopPropagation();
    toast.loading("Creating view token...", {
      id: `view-${file.encryptedId}`,
    });
    setViewerBtnLoading(true);
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
      setViewerBtnLoading(false);
    }
  };

  return (
    <>
      <ResponsiveDialog
        open={isRawExplanationOpen}
        onOpenChange={setIsRawExplanationOpen}
      >
        <ResponsiveDialogContent>
          <ResponsiveDialogHeader>
            <ResponsiveDialogTitle>Difference between download link and raw link?</ResponsiveDialogTitle>
            <ResponsiveDialogDescription>Learn the reason why it's 2 different links.</ResponsiveDialogDescription>
          </ResponsiveDialogHeader>
          <ResponsiveDialogBody>
            <p>
              Some services need the file extension to be present in the URL to properly embed the file.
              <br />
              The <b>download link</b> only have encrypted file id in the URL, meanwhile <b>raw link</b> will have the
              whole path included in the URL.
            </p>
            <p>So it&apos;s recommended to use the raw link for embedding media file like video, audio, and image.</p>
            <span className='text-sm text-muted-foreground'>
              Note: This is only applicable for video, audio, and image files.
            </span>

            <Separator className='my-2' />

            <p className={`text-sm`}>
              This information is based on the{" "}
              <code className='bg-muted px-1 text-xs text-muted-foreground'>onedrive-vercel-index</code> documentation.
            </p>
            <Link
              href={"https://ovi.swo.moe/docs/features/customise-direct-link"}
              className='text-balance text-sm text-blue-600 opacity-80 transition-all duration-300 hover:opacity-100 dark:text-blue-400'
              target='_blank'
              rel='noreferrer noopener'
            >
              Customise Direct Link - onedrive-vercel-index
            </Link>
          </ResponsiveDialogBody>
          <ResponsiveDialogFooter>
            <ResponsiveDialogClose asChild>
              <Button variant={"secondary"}>Close</Button>
            </ResponsiveDialogClose>
          </ResponsiveDialogFooter>
        </ResponsiveDialogContent>
      </ResponsiveDialog>

      <Card>
        <CardContent className='p-6'>
          <div className='flex flex-col-reverse items-center gap-4 md:gap-2 tablet:flex-row tablet:justify-end'>
            <ResponsiveDropdownMenu>
              <ResponsiveDropdownMenuTrigger asChild>
                <Button
                  variant={"outline"}
                  className='w-full tablet:w-fit'
                >
                  Copy Link
                  <Icon name='ChevronDown' />
                </Button>
              </ResponsiveDropdownMenuTrigger>

              <ResponsiveDropdownMenuContent
                header={{
                  title: "Copy Link",
                }}
              >
                <ResponsiveDropdownMenuItem closeOnSelect>Raw Link</ResponsiveDropdownMenuItem>
                <ResponsiveDropdownMenuItem closeOnSelect>Direct Download Link</ResponsiveDropdownMenuItem>

                <ResponsiveDropdownMenuSeparator />

                <ResponsiveDropdownMenuItem
                  closeOnSelect
                  onSelect={() => {
                    setIsRawExplanationOpen(true);
                  }}
                >
                  Learn the difference
                </ResponsiveDropdownMenuItem>
              </ResponsiveDropdownMenuContent>
            </ResponsiveDropdownMenu>

            {showViewDoc && (
              <LoadingButton
                className='w-full tablet:w-fit'
                loading={viewerBtnLoading}
              >
                <Icon name='ExternalLink' />
                Open in Viewer
              </LoadingButton>
            )}
            {showVirusTotal && (
              <Button
                variant={"outline"}
                className='w-full tablet:w-fit'
              >
                <Icon name='FileScan' />
                Virus Total
              </Button>
            )}
            <Button className='w-full tablet:w-fit'>
              <Icon name='Download' />
              Download File
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>File information</CardTitle>
        </CardHeader>
        <CardContent>
          {fileInfo.map((info) => (
            <div
              key={info.label}
              className='grid items-center gap-2 border border-b-0 last-of-type:border-b tablet:grid-cols-2'
            >
              <span className='grow px-4 py-2 font-semibold tablet:border-r'>{info.label}</span>
              <span className='break-word grow whitespace-pre-wrap text-pretty px-4 py-2 text-sm'>{info.value}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </>
  );

  // return (
  //   <div className='grid grid-cols-1 gap-4'>
  //     <Card slot='file-actions'>
  //       <div className='flex flex-col-reverse gap-4 p-6 tablet:flex-row tablet:items-center tablet:justify-between'>
  //         <div
  //           slot='raw-explanation'
  //           className={cn("flex gap-4", !showRawUrl && "invisible")}
  //         >
  //           {isDesktop ? (
  //             <Dialog
  //               open={isRawExplanationOpen}
  //               onOpenChange={setIsRawExplanationOpen}
  //             >
  //               <DialogTrigger asChild>
  //                 <span className='cursor-pointer text-center text-sm text-blue-600 opacity-80 transition-all duration-300 hover:opacity-100 dark:text-blue-400 tablet:text-start'>
  //                   Difference between download link and raw link?
  //                 </span>
  //               </DialogTrigger>
  //               <DialogContent>
  //                 <div className='flex h-fit flex-col gap-4'>
  //                   <h4>Why?</h4>
  //                   <p>
  //                     Some services need the file extension to be present in the URL to properly embed the file.
  //                     <br />
  //                     - The download link only have encrypted file id.
  //                     <br />
  //                     - The raw link will have the whole path includes the file name and extension.
  //                     <br />
  //                     <br />
  //                     So if you want to embed the file, it&apos;s recommended to use the raw link instead of the
  //                     download link.
  //                   </p>
  //                   <p className='muted'>Note: This is only applicable for video, audio, and image files.</p>
  //                   <h4>Ref</h4>
  //                   <p>
  //                     This information is based on the onedrive-vercel-index project documentation.
  //                     <br />
  //                     <Link
  //                       href='https://ovi.swo.moe/docs/features/customise-direct-link'
  //                       target='_blank'
  //                       rel='noreferrer noopener'
  //                       className='text-blue-600 opacity-80 transition-all duration-300 hover:opacity-100 dark:text-blue-400'
  //                     >
  //                       Customise Direct Link - onedrive-vercel-index
  //                     </Link>
  //                   </p>
  //                 </div>
  //               </DialogContent>
  //             </Dialog>
  //           ) : (
  //             <Drawer
  //               open={isRawExplanationOpen}
  //               onOpenChange={setIsRawExplanationOpen}
  //               shouldScaleBackground
  //             >
  //               <DrawerTrigger asChild>
  //                 <span className='cursor-pointer text-center text-sm text-blue-600 opacity-80 transition-all duration-300 hover:opacity-100 dark:text-blue-400 tablet:text-start'>
  //                   Difference between download link and raw link?
  //                 </span>
  //               </DrawerTrigger>
  //               <DrawerContent>
  //                 <DrawerHeader></DrawerHeader>
  //                 <div className='flex h-fit flex-col gap-4 px-4'>
  //                   <h4>Why?</h4>
  //                   <p>
  //                     Some services need the file extension to be present in the URL to properly embed the file.
  //                     <br />
  //                     - The download link only have encrypted file id.
  //                     <br />
  //                     - The raw link will have the whole path includes the file name and extension.
  //                     <br />
  //                     <br />
  //                     So if you want to embed the file, it&apos;s recommended to use the raw link instead of the
  //                     download link.
  //                   </p>
  //                   <h4>Ref</h4>
  //                   <p>
  //                     This information is based on the onedrive-vercel-index project documentation.
  //                     <br />
  //                     <Link
  //                       href='https://ovi.swo.moe/docs/features/customise-direct-link'
  //                       target='_blank'
  //                       rel='noreferrer noopener'
  //                       className='text-blue-600 opacity-80 transition-all duration-300 hover:opacity-100 dark:text-blue-400'
  //                     >
  //                       Customise Direct Link - onedrive-vercel-index
  //                     </Link>
  //                   </p>
  //                 </div>
  //                 <DrawerFooter>
  //                   <DrawerClose asChild>
  //                     <Button
  //                       size={"sm"}
  //                       variant={"secondary"}
  //                     >
  //                       Close
  //                     </Button>
  //                   </DrawerClose>
  //                 </DrawerFooter>
  //               </DrawerContent>
  //             </Drawer>
  //           )}
  //         </div>

  //         <div className='flex flex-col-reverse gap-4 tablet:flex-row tablet:items-center'>
  //           {showRawUrl ? (
  //             <LoadingButton
  //               size={"sm"}
  //               variant={"outline"}
  //               onClick={onCopyRaw}
  //               loading={copyBtnLoading === "loading"}
  //             >
  //               <Icon name='Copy' />
  //               Raw Link
  //             </LoadingButton>
  //           ) : null}
  //           {showViewDoc ? (
  //             <LoadingButton
  //               size={"sm"}
  //               variant={"outline"}
  //               onClick={onOpenViewer}
  //               loading={viewerState === "loading"}
  //             >
  //               <Icon name='ExternalLink' />
  //               Open in Viewer
  //             </LoadingButton>
  //           ) : null}

  //           <LoadingButton
  //             size={"sm"}
  //             variant={"outline"}
  //             onClick={onCopy}
  //             loading={copyDownloadBtnLoading === "loading"}
  //           >
  //             <Icon name='Link' />
  //             Download Link
  //           </LoadingButton>

  //           <LoadingButton
  //             size={"sm"}
  //             onClick={onDownload}
  //             loading={downloadBtnLoading === "loading"}
  //           >
  //             <Icon name='Download' />
  //             Download
  //           </LoadingButton>
  //         </div>
  //       </div>
  //     </Card>

  //     <Card slot='file-info'>
  //       <CardHeader>
  //         <CardTitle>File Information</CardTitle>
  //       </CardHeader>
  //       <CardContent>
  //         <div className='flex flex-col gap-2'>
  //           {fileInfo.map((info) => (
  //             <div
  //               key={info.label}
  //               className='group flex flex-col'
  //             >
  //               <span className='text-sm font-semibold'>{info.label}:</span>
  //               <span className='col-span-3 whitespace-pre-wrap break-all'>{info.value}</span>
  //               <Separator className='my-1.5 group-last-of-type:hidden' />
  //             </div>
  //           ))}
  //         </div>
  //       </CardContent>
  //     </Card>
  //   </div>
  // );
}
