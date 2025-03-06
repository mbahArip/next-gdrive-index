import { type Metadata, type ResolvedMetadata } from "next";
import { notFound } from "next/navigation";
import { type z } from "zod";

import { FileActions, FileBreadcrumb, FileExplorerLayout, FileReadme } from "~/components/explorer";
import { ErrorComponent, Password } from "~/components/layout";
import { PreviewLayout } from "~/components/preview";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

import { getFileType } from "~/lib/previewHelper";
import { formatPathToBreadcrumb } from "~/lib/utils";

import { type Schema_File } from "~/types/schema";

import { GetBanner, GetFile, GetReadme, GetSiblingsMedia, ListFiles } from "~/actions/files";
import { CheckPagePassword } from "~/actions/password";
import { ValidatePaths } from "~/actions/paths";
import { CreateFileToken } from "~/actions/token";

export const revalidate = 60;
export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{
    rest: string[];
  }>;
};

export async function generateMetadata({ params }: Props, parent: ResolvedMetadata): Promise<Metadata> {
  const { rest } = await params;

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
  if (!file.data) return <ErrorComponent error={new Error("Failed to get file data")} />;
  const token = await CreateFileToken(file.data);
  if (!token.success) return <ErrorComponent error={new Error(token.error)} />;

  // Check if file is media (video / audio)
  let playlistFiles: z.infer<typeof Schema_File>[] = [];
  if (file.data.mimeType.includes("video") || file.data.mimeType.includes("audio")) {
    const sib = await GetSiblingsMedia(rest);
    if (!sib.success) return <ErrorComponent error={new Error(sib.error)} />;
    playlistFiles = sib.data;
  }

  return (
    <Layout>
      <PreviewLayout
        data={file.data}
        fileType={
          file.data?.fileExtension && file.data?.mimeType
            ? getFileType(file.data.fileExtension, file.data.mimeType)
            : "unknown"
        }
        token={token.data}
        playlist={playlistFiles}
        paths={rest}
      />
    </Layout>
  );
}
