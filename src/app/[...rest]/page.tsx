import { type Metadata, type ResolvedMetadata } from "next";
import { notFound } from "next/navigation";

import { FileActions, FileBreadcrumb, FileExplorerLayout, FileReadme } from "~/components/explorer";
import { Password } from "~/components/layout";
import { PreviewLayout } from "~/components/preview";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

import { getFileType } from "~/lib/previewHelper";
import { formatPathToBreadcrumb } from "~/lib/utils";

import { GetBanner, GetFile, GetReadme, ListFiles } from "~/actions/files";
import { CheckPagePassword } from "~/actions/password";
import { ValidatePaths } from "~/actions/paths";

import config from "config";

import ErrorComponent from "../error";
import DeployGuidePage from "./deploy";

export const revalidate = 60;
export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{
    rest: string[];
  }>;
};
const isDeployGuide = (paths: string[]) => paths.length === 1 && paths[0] === "deploy" && config.showDeployGuide;

export async function generateMetadata({ params }: Props, parent: ResolvedMetadata): Promise<Metadata> {
  const { rest } = await params;
  if (isDeployGuide(rest)) return { title: "Deploy Guide", description: "Read on how to deploy this project" };

  const paths = await ValidatePaths(rest);
  if (!paths.success) return { title: "Not Found" };

  const currentPath = paths.data.pop();
  if (!currentPath?.id) return { title: "Not Found" };

  const banner = await GetBanner(currentPath.id);

  return {
    title: decodeURIComponent(currentPath.path),
    description: currentPath.mimeType.includes("folder")
      ? `Browse ${currentPath.path} files`
      : `View ${currentPath.path}`,
    openGraph: {
      images: banner.success
        ? [
            {
              url: `/api/og/${banner.data}`,
              width: 1200,
              height: 630,
            },
          ]
        : parent.openGraph?.images,
    },
  };
}

export default async function RestPage({ params }: Props) {
  const { rest } = await params;
  if (isDeployGuide(rest)) return <DeployGuidePage />;

  const paths = await ValidatePaths(rest);
  if (!paths.success) notFound();

  const unlocked = await CheckPagePassword(paths.data);
  if (!unlocked.success) {
    return (
      <Password
        type='path'
        paths={paths.data}
        errorMessage={unlocked.error}
      />
    );
  }

  const currentPath = paths.data[paths.data.length - 1];
  if (!currentPath) return <ErrorComponent error={new Error("Failed to get current path")} />;

  const Layout: React.FC<{
    children: React.ReactNode;
  }> = ({ children }) => (
    <div className='flex h-fit w-full flex-col gap-4'>
      <FileBreadcrumb data={formatPathToBreadcrumb(paths.data)} />

      <section
        slot='content'
        className='w-full'
      >
        {children}
      </section>
    </div>
  );

  if (currentPath.mimeType.includes("folder")) {
    const [data, readme] = await Promise.all([ListFiles({ id: currentPath.id }), GetReadme(currentPath.id)]);
    if (!data.success) return <ErrorComponent error={new Error(data.error)} />;
    if (!readme.success) return <ErrorComponent error={new Error(readme.error)} />;

    return (
      <Layout>
        <Card>
          <CardHeader className='pb-0'>
            <div className='flex w-full items-center justify-between gap-4'>
              <CardTitle className='flex-grow'>Browse files</CardTitle>
              <FileActions />
            </div>
          </CardHeader>

          <CardContent className='p-2 pt-0 tablet:p-4 tablet:pt-0'>
            <FileExplorerLayout
              encryptedId={currentPath.id}
              files={data.data.files}
              nextPageToken={data.data.nextPageToken ?? undefined}
              showBackButton
            />
          </CardContent>
        </Card>

        {readme.data && (
          <FileReadme
            content={readme.data.content}
            title={`README.${readme.data.type === "markdown" ? "md" : "txt"}`}
          />
        )}
      </Layout>
    );
  }

  const file = await GetFile(currentPath.id);
  if (!file.success) {
    if (file.error === "NotFound") notFound();
    return <ErrorComponent error={new Error(file.error)} />;
  }

  return (
    <Layout>
      <PreviewLayout
        data={file.data!}
        fileType={
          file.data?.fileExtension && file.data?.mimeType
            ? getFileType(file.data.fileExtension, file.data.mimeType)
            : "unknown"
        }
      />
    </Layout>
  );

  // const paths = await CheckPaths(rest);
  // if (!paths.success) notFound();
  // const unlocked = await CheckPassword(paths.data);

  // if (!unlocked.success) {
  //   if (!unlocked.path)
  //     throw new Error(`No path returned from password checking${unlocked.message && `, ${unlocked.message}`}`);
  //   return (
  //     <Password
  //       path={unlocked.path}
  //       checkPaths={paths.data}
  //       errorMessage={unlocked.message}
  //     />
  //   );
  // }

  // const encryptedId = paths.data.pop()?.id;
  // if (!encryptedId) throw new Error("Failed to get encrypted ID, try to refresh the page.");

  // const promise = [];

  // const { data: file } = await gdrive.files.get({
  //   fileId: await decryptData(encryptedId),
  //   fields: "mimeType, fileExtension",
  //   supportsAllDrives: config.apiConfig.isTeamDrive,
  // });
  // if (!file.mimeType?.includes("folder")) {
  //   promise.push(GetFile(encryptedId));
  // } else {
  //   promise.push(GetFiles({ id: encryptedId }));
  // }
  // promise.push(GetReadme(encryptedId));

  // const [data, readme] = await Promise.all(promise).then((values) => {
  //   const file = Schema_File.safeParse(values[0]);

  //   if (file.success) {
  //     return values as [z.infer<typeof Schema_File>, string];
  //   } else {
  //     return values as [{ files: z.infer<typeof Schema_File>[]; nextPageToken?: string }, string];
  //   }
  // });

  // return (
  //   <div className={cn("h-fit w-full", "flex flex-col gap-4")}>
  //     <FileBreadcrumb
  //       data={rest.map((item, index, array) => ({
  //         label: decodeURIComponent(item),
  //         href: index === array.length - 1 ? undefined : `${item}`,
  //       }))}
  //     />

  //     <section
  //       slot='content'
  //       className='w-full'
  //     >
  //       {!("files" in data) ? (
  //         <PreviewLayout
  //           data={data}
  //           fileType={file.fileExtension && file.mimeType ? getFileType(file.fileExtension, file.mimeType) : "unknown"}
  //         />
  //       ) : (
  //         <>
  //           <Card>
  //             <CardHeader className='pb-0'>
  //               <div className='flex w-full items-center justify-between gap-4'>
  //                 <CardTitle className='flex-grow'>Browse files</CardTitle>
  //                 <FileActions />
  //               </div>
  //               <Separator />
  //             </CardHeader>
  //             <CardContent className='p-1.5 pt-0 tablet:p-3 tablet:pt-0'>
  //               <FileExplorerLayout
  //                 encryptedId={encryptedId}
  //                 files={data.files}
  //                 nextPageToken={data.nextPageToken}
  //               />
  //             </CardContent>
  //           </Card>
  //         </>
  //       )}
  //     </section>

  //     {readme && (
  //       <FileReadme
  //         content={readme}
  //         title={"README.md"}
  //       />
  //     )}
  //   </div>
  // );
}
