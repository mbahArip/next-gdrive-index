import { Metadata, ResolvedMetadata } from "next";
import { notFound } from "next/navigation";
import { z } from "zod";
import { Schema_File } from "~/schema";
import { cn } from "~/utils";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";

import { decryptData } from "~/utils/encryptionHelper/hash";
import gdrive from "~/utils/gdriveInstance";
import { getFileType } from "~/utils/previewHelper";

import config from "~/config/gIndex.config";

import FileBrowser from "../@explorer";
import Header from "../@header";
import HeaderButton from "../@header.button";
import Markdown from "../@markdown";
import Password from "../@password";
import PreviewAction from "../@preview.action";
import PreviewAudio from "../@preview.audio";
import PreviewDoc from "../@preview.doc";
import PreviewImage from "../@preview.image";
import PreviewManga from "../@preview.manga";
import PreviewRich from "../@preview.rich";
import PreviewUnknown from "../@preview.unknown";
import PreviewVideo from "../@preview.video";
import {
  CheckPassword,
  CheckPaths,
  GetBanner,
  GetFile,
  GetFiles,
  GetReadme,
} from "../actions";

export const revalidate = 300;
export const dynamic = "force-dynamic";

type Props = {
  params: {
    rest: string[];
  };
};

export async function generateMetadata(
  { params: { rest } }: Props,
  parent: ResolvedMetadata,
): Promise<Metadata> {
  const paths = await CheckPaths(rest);
  if (!paths.success) return { title: "Not Found" };

  const encryptedId = paths.data.pop()?.id;
  if (!encryptedId) return { title: "Not Found" };
  const data = await GetFile(encryptedId);

  const banner = await GetBanner(encryptedId);

  return {
    title: data.name,
    description: data.mimeType?.includes("folder")
      ? `Browse ${data.name} files`
      : `View ${data.name}`,
    openGraph: {
      images: banner
        ? [
            {
              url: `/api/og/${banner}`,
              // url: `/api/og/${
              //   data.mimeType.startsWith("image") ? data.encryptedId : banner
              // }`,
              width: 1200,
              height: 630,
            },
          ]
        : parent.openGraph?.images,
    },
  };
}

export default async function RestPage({ params: { rest } }: Props) {
  const paths = await CheckPaths(rest);
  if (!paths.success) notFound();
  const unlocked = await CheckPassword(paths.data);

  if (!unlocked.success) {
    if (!unlocked.path)
      throw new Error(
        `No path returned from password checking, ${unlocked.message}`,
      );
    return (
      <Password
        path={unlocked.path}
        checkPaths={paths.data}
        errorMessage={unlocked.message}
      />
    );
  }

  const encryptedId = paths.data.pop()?.id;
  if (!encryptedId)
    throw new Error("Failed to get encrypted ID, try to refresh the page.");

  const promise = [];
  const { data: file } = await gdrive.files.get({
    fileId: await decryptData(encryptedId),
    fields: "mimeType, fileExtension",
    supportsAllDrives: config.apiConfig.isTeamDrive,
  });
  if (!file.mimeType?.includes("folder")) {
    promise.push(GetFile(encryptedId));
  } else {
    promise.push(GetFiles({ id: encryptedId }));
  }
  promise.push(GetReadme(encryptedId));

  const [data, readme] = await Promise.all(promise).then((values) => {
    const file = Schema_File.safeParse(values[0]);

    if (file.success) {
      return values as [z.infer<typeof Schema_File>, string];
    } else {
      return values as [
        { files: z.infer<typeof Schema_File>[]; nextPageToken?: string },
        string,
      ];
    }
  });
  let fileType;
  if (file.fileExtension && file.mimeType) {
    fileType = getFileType(file.fileExtension, file.mimeType);
  }
  const isFile = !("files" in data);

  return (
    <div className={cn("h-fit w-full", "flex flex-col gap-3")}>
      <Header
        name='Root'
        breadcrumb={rest.map((item, index, array) => ({
          label: decodeURIComponent(item),
          href: index === array.length - 1 ? undefined : `${item}`,
        }))}
      />
      <div
        slot='content'
        className='w-full'
      >
        <Card>
          <CardHeader className='pb-0'>
            {isFile ? (
              <div className='flex w-full gap-3'>
                <CardTitle className='line-clamp-2 flex-grow whitespace-pre-wrap break-all'>
                  {data.name}
                </CardTitle>
              </div>
            ) : (
              <div className='flex w-full items-center justify-between gap-3'>
                <CardTitle className='flex-grow'>Browse files</CardTitle>
                <HeaderButton />
              </div>
            )}
            <Separator />
          </CardHeader>
          <CardContent className='p-1.5 pt-0 tablet:p-3 tablet:pt-0'>
            {isFile ? (
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
                  />
                ) : fileType === "text" ? (
                  <PreviewRich file={data} />
                ) : fileType === "markdown" ? (
                  <PreviewRich file={data} />
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
            ) : (
              <FileBrowser
                files={data.files}
                nextPageToken={data.nextPageToken}
              />
            )}
          </CardContent>
        </Card>
      </div>
      {readme && (
        <div
          slot='readme'
          className='w-full'
        >
          <Card>
            <CardHeader className='pb-0'>
              <CardTitle>README.md</CardTitle>
              <Separator />
            </CardHeader>
            <CardContent className='p-1.5 pt-0 tablet:p-3 tablet:pt-0'>
              <Markdown content={readme} />
            </CardContent>
          </Card>
        </div>
      )}
      {isFile && <PreviewAction file={data} />}
    </div>
  );
}
