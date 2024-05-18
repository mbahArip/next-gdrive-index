import { Metadata, ResolvedMetadata } from "next";
import { notFound } from "next/navigation";
import { z } from "zod";

import { Actions, Explorer, FilePath, Readme } from "~/components/Explorer";
import { Password } from "~/components/Layout";
import { PreviewLayout } from "~/components/Preview";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";

import { cn } from "~/utils/cn";
import { decryptData } from "~/utils/encryptionHelper";
import gdrive from "~/utils/gdriveInstance";
import { getFileType } from "~/utils/previewHelper";

import { Schema_File } from "~/types/schema";

import { CheckPassword, CheckPaths, GetBanner, GetFile, GetFiles, GetReadme } from "actions";
import config from "config";

import DeployGuidePage from "./deploy";

export const revalidate = 60;
export const dynamic = "force-dynamic";

type Props = {
  params: {
    rest: string[];
  };
};

export async function generateMetadata({ params: { rest } }: Props, parent: ResolvedMetadata): Promise<Metadata> {
  if (rest.length === 1 && rest[0] === "deploy" && config.showDeployGuide) return { title: "Deploy Guide" };

  const paths = await CheckPaths(rest);
  if (!paths.success) return { title: "Not Found" };

  const encryptedId = paths.data.pop()?.id;
  if (!encryptedId) return { title: "Not Found" };
  const data = await GetFile(encryptedId);

  const banner = await GetBanner(encryptedId);

  return {
    title: data.name,
    description: data.mimeType?.includes("folder") ? `Browse ${data.name} files` : `View ${data.name}`,
    openGraph: {
      images: banner
        ? [
            {
              url: `/api/og/${banner}`,
              width: 1200,
              height: 630,
            },
          ]
        : parent.openGraph?.images,
    },
  };
}

export default async function RestPage({ params: { rest } }: Props) {
  if (rest.length === 1 && rest[0] === "deploy" && config.showDeployGuide) return <DeployGuidePage />;

  const paths = await CheckPaths(rest);
  if (!paths.success) notFound();
  const unlocked = await CheckPassword(paths.data);

  if (!unlocked.success) {
    if (!unlocked.path)
      throw new Error(`No path returned from password checking${unlocked.message && `, ${unlocked.message}`}`);
    return (
      <Password
        path={unlocked.path}
        checkPaths={paths.data}
        errorMessage={unlocked.message}
      />
    );
  }

  const encryptedId = paths.data.pop()?.id;
  if (!encryptedId) throw new Error("Failed to get encrypted ID, try to refresh the page.");

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
      return values as [{ files: z.infer<typeof Schema_File>[]; nextPageToken?: string }, string];
    }
  });
  console.log(
    rest.map((item, index, array) => ({
      label: decodeURIComponent(item),
      href: index === array.length - 1 ? undefined : `${item}`,
    })),
  );

  return (
    <div className={cn("h-fit w-full", "flex flex-col gap-3")}>
      <FilePath
        data={rest.map((item, index, array) => ({
          label: decodeURIComponent(item),
          href: index === array.length - 1 ? undefined : `${item}`,
        }))}
      />

      <section
        slot='content'
        className='w-full'
      >
        {!("files" in data) ? (
          <PreviewLayout
            data={data}
            fileType={file.fileExtension && file.mimeType ? getFileType(file.fileExtension, file.mimeType) : "unknown"}
          />
        ) : (
          <>
            <Card>
              <CardHeader className='pb-0'>
                <div className='flex w-full items-center justify-between gap-3'>
                  <CardTitle className='flex-grow'>Browse files</CardTitle>
                  <Actions />
                </div>
                <Separator />
              </CardHeader>
              <CardContent className='p-1.5 pt-0 tablet:p-3 tablet:pt-0'>
                <Explorer
                  encryptedId={encryptedId}
                  files={data.files}
                  nextPageToken={data.nextPageToken}
                />
              </CardContent>
            </Card>
          </>
        )}
      </section>

      {readme && (
        <Readme
          content={readme}
          title={"README.md"}
        />
      )}
    </div>
  );
}
