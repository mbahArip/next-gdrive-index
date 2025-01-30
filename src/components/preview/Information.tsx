"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { type z } from "zod";

import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  ResponsiveDialog,
  ResponsiveDialogBody,
  ResponsiveDialogClose,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogTrigger,
} from "~/components/ui/dialog.responsive";
import {
  ResponsiveDropdownMenu,
  ResponsiveDropdownMenuContent,
  ResponsiveDropdownMenuItem,
  ResponsiveDropdownMenuSeparator,
  ResponsiveDropdownMenuTrigger,
} from "~/components/ui/dropdown-menu.responsive";
import Icon from "~/components/ui/icon";
import { Separator } from "~/components/ui/separator";

import { useResponsive } from "~/context/responsiveContext";
import { getFileType } from "~/lib/previewHelper";
import { bytesToReadable, durationToReadable, formatDate } from "~/lib/utils";

import { type Schema_File } from "~/types/schema";

import config from "config";

type Props = {
  file: z.infer<typeof Schema_File>;
  token: string;
};
export default function PreviewInformation({ file, token }: Props) {
  const pathname = usePathname();
  const { isDesktop } = useResponsive();
  const fileType = useMemo<ReturnType<typeof getFileType>>(() => {
    return getFileType(file.fileExtension ?? "", file.mimeType) ?? "unknown";
  }, [file]);

  const showVirusTotal = useMemo<boolean>(() => {
    // Disable for now
    return false;
  }, []);
  const isMedia = useMemo<boolean>(
    () => fileType === "video" || fileType === "audio" || fileType === "image",
    [fileType],
  );
  const showViewDoc = useMemo<boolean>(() => fileType === "document" || fileType === "pdf", [fileType]);
  const showEmbed = useMemo<boolean>(() => fileType === "video" || fileType === "audio", [fileType]);

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
        value: `${formatDate(file.modifiedTime)}`,
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
  const downloadUrl = useMemo<string>(() => {
    const downloadUrl = new URL(`/api/download/${pathname}`.replace(/\/+/g, "/"), config.basePath);
    if (!config.apiConfig.allowDownloadProtectedFile) downloadUrl.searchParams.append("token", token);
    return downloadUrl.toString();
  }, [pathname, token]);

  const [isRawExplanationOpen, setIsRawExplanationOpen] = useState<boolean>(false);

  const onCopyEmbed = useCallback(async () => {
    toast.loading("Copying embed code...", {
      id: `embed-${file.encryptedId}`,
    });
    try {
      const embedContent = `<iframe title="${file.name}" src="${new URL(
        `/ngdi-internal/embed/${pathname}`.replace(/\/+/g, "/"),
        config.basePath,
      ).toString()}" frameborder="0" allowfullscreen allowtransparency width="100%" height="100%" style="max-width:${
        fileType === "audio" ? "480px" : "1280px"
      };aspect-ratio:${fileType === "audio" ? "16/9" : "1.5/1"};border-radius:8px;"></iframe>`;
      await navigator.clipboard.writeText(embedContent);
      toast.success("Embed code copied!", {
        id: `embed-${file.encryptedId}`,
      });
    } catch (error) {
      const e = error as Error;
      console.error(`[CopyEmbedCode] ${e.message}`);
      toast.error(e.message, {
        id: `embed-${file.encryptedId}`,
      });
    }
  }, [file.encryptedId, file.name, fileType, pathname]);
  const onCopyRawLink = useCallback(async () => {
    toast.loading("Copying raw link...", {
      id: `raw-${file.encryptedId}`,
    });
    try {
      const rawUrl = new URL(`/api/raw/${pathname}`.replace(/\/+/g, "/"), config.basePath);
      // if (!config.apiConfig.allowDownloadProtectedFile) rawUrl.searchParams.append("token", token);
      await navigator.clipboard.writeText(rawUrl.toString());
      toast.success("Raw link copied!", {
        id: `raw-${file.encryptedId}`,
      });
    } catch (error) {
      const e = error as Error;
      console.error(`[CopyRawLink] ${e.message}`);
      toast.error(e.message, {
        id: `raw-${file.encryptedId}`,
      });
    }
  }, [file.encryptedId, pathname]);
  const onCopyDownloadLink = useCallback(async () => {
    toast.loading("Copying download link...", {
      id: `download-${file.encryptedId}`,
    });
    try {
      // const downloadUrl = new URL(`/api/download/${file.encryptedId}`, config.basePath);
      // const downloadUrl = new URL(`/api/download/${pathname}`.replace(/\/+/g, "/"), config.basePath);
      // if (!config.apiConfig.allowDownloadProtectedFile) downloadUrl.searchParams.append("token", token);
      await navigator.clipboard.writeText(downloadUrl);
      toast.success("Download link copied!", {
        id: `download-${file.encryptedId}`,
      });
    } catch (error) {
      const e = error as Error;
      console.error(`[CopyDownloadLink] ${e.message}`);
      toast.error(e.message, {
        id: `download-${file.encryptedId}`,
      });
    }
  }, [file.encryptedId, downloadUrl]);
  const onViewDocument = useCallback(async () => {
    try {
      const viewerUrl =
        fileType === "document"
          ? `https://docs.google.com/gview?url=${encodeURIComponent(
              new URL(
                `/api/download/${pathname}?token=${token}&redirect=1`.replace(/\/+/g, "/"),
                config.basePath,
              ).toString(),
            )}&embedded=true`
          : new URL(`/api/preview/${file.encryptedId}?inline=1`, config.basePath);
      window.open(viewerUrl.toString(), "_blank");
    } catch (error) {
      const e = error as Error;
      console.error(`[ViewDocument] ${e.message}`);
      toast.error(e.message);
    }
  }, [file.encryptedId, fileType, pathname, token]);

  return (
    <>
      <ResponsiveDialog
        open={isRawExplanationOpen}
        onOpenChange={setIsRawExplanationOpen}
      >
        <ResponsiveDialogContent>
          <ResponsiveDialogHeader>
            <ResponsiveDialogTitle>Difference between download link and raw link?</ResponsiveDialogTitle>
            <ResponsiveDialogDescription>Learn the reason why it&apos;s 2 different links.</ResponsiveDialogDescription>
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
            <ResponsiveDropdownMenu modal={isDesktop ? false : true}>
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
                <ResponsiveDropdownMenuItem
                  closeOnSelect
                  onSelect={onCopyRawLink}
                  disabled={!isMedia}
                >
                  Raw Link
                </ResponsiveDropdownMenuItem>
                <ResponsiveDropdownMenuItem
                  closeOnSelect
                  onSelect={onCopyDownloadLink}
                >
                  Direct Download Link
                </ResponsiveDropdownMenuItem>

                <ResponsiveDropdownMenuSeparator />

                {/* <ResponsiveDialogTrigger asChild> */}
                <ResponsiveDropdownMenuItem
                  closeOnSelect
                  onSelect={() => setIsRawExplanationOpen(true)}
                >
                  Learn the difference
                </ResponsiveDropdownMenuItem>
                {/* </ResponsiveDialogTrigger> */}
              </ResponsiveDropdownMenuContent>
            </ResponsiveDropdownMenu>

            {showViewDoc && (
              <Button
                className='w-full tablet:w-fit'
                onClick={onViewDocument}
              >
                <Icon name='ExternalLink' />
                Open in Viewer
              </Button>
            )}
            {showEmbed && (
              <ResponsiveDialog>
                <ResponsiveDialogTrigger asChild>
                  <Button className='w-full tablet:w-fit'>
                    <Icon name='CodeXml' />
                    Embed Media
                  </Button>
                </ResponsiveDialogTrigger>
                <ResponsiveDialogContent>
                  <ResponsiveDialogHeader>
                    <ResponsiveDialogTitle>Embed Media</ResponsiveDialogTitle>
                    <ResponsiveDialogDescription>
                      Embed the media file to your website or blog
                    </ResponsiveDialogDescription>
                  </ResponsiveDialogHeader>
                  <ResponsiveDialogBody>
                    <pre className='text-pretty break-all bg-muted p-4 text-sm'>
                      <code
                        className='select-all'
                        onClick={onCopyEmbed}
                      >
                        {`<iframe title="${file.name}" src="${new URL(
                          `/ngdi-internal/embed/${pathname}`.replace(/\/+/g, "/"),
                          config.basePath,
                        ).toString()}" frameborder="0" allowfullscreen allowtransparency width="100%" height="100%" style="max-width:${
                          fileType === "audio" ? "480px" : "1280px"
                        };aspect-ratio:${fileType === "audio" ? "16/9" : "1.5/1"};border-radius:8px;"></iframe>`}
                      </code>
                    </pre>
                    <span className='w-full text-end text-xs text-muted-foreground'>
                      Click on the code to copy it to your clipboard.
                    </span>
                  </ResponsiveDialogBody>
                  <ResponsiveDialogFooter>
                    <ResponsiveDialogClose asChild>
                      <Button variant={"secondary"}>Close</Button>
                    </ResponsiveDialogClose>
                  </ResponsiveDialogFooter>
                </ResponsiveDialogContent>
              </ResponsiveDialog>
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
            <Button
              asChild
              className='w-full tablet:w-fit'
            >
              <a
                href={downloadUrl}
                target='_blank'
              >
                <Icon name='Download' />
                Download File
              </a>
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
              <span className='grow whitespace-pre-wrap text-pretty break-all px-4 py-2 text-sm'>{info.value}</span>
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
