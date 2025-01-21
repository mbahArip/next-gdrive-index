import { type Metadata, type ResolvedMetadata } from "next";
import { notFound } from "next/navigation";

import { FileActions, FileBreadcrumb, FileExplorerLayout, FileReadme } from "~/components/explorer";
import { Status } from "~/components/global";
import { Password } from "~/components/layout";
import { PreviewLayout } from "~/components/preview";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

import { getFileType } from "~/lib/previewHelper";
import { formatPathToBreadcrumb } from "~/lib/utils";

import { GetBanner, GetFile, GetReadme, ListFiles } from "~/actions/files";
import { CheckPagePassword } from "~/actions/password";
import { ValidatePaths } from "~/actions/paths";
import { CreateFileToken } from "~/actions/token";

import ErrorComponent from "../error";
import ConfiguratorPage from "./ConfiguratorPage";
import DeployPage from "./DeployPage";
import EmbedPage from "./EmbedPage";

export const revalidate = 60;
export const dynamic = "force-dynamic";
export const dynamicParams = false;

type Props = {
  params: Promise<{
    rest: string[];
  }>;
};
const internal = (paths: string[]) => {
  const joinedPaths = (paths.join("/").startsWith("/") ? paths.join("/") : `/${paths.join("/")}`).replace(/\/+/g, "/");

  return {
    isInternalRoot: joinedPaths === "/_",
    isGuidePage: joinedPaths === "/_/deploy",
    isConfiguratorPage: joinedPaths === "/_/configurator",
    isEmbedRootPage: joinedPaths === "/_/embed",
    isEmbedPage: joinedPaths.startsWith("/_/embed/"),
  };
};

export async function generateMetadata({ params }: Props, parent: ResolvedMetadata): Promise<Metadata> {
  const p = await params;
  let rest = p.rest;
  const { isInternalRoot, isGuidePage, isConfiguratorPage, isEmbedPage, isEmbedRootPage } = internal(p.rest);
  if (isInternalRoot)
    return { title: "Reserved Internal Path", description: "This path is reserved for internal pages" };
  if (isGuidePage) return { title: "Guide", description: "Read on how to deploy your own index" };
  if (isConfiguratorPage) return { title: "Configurator", description: "Configure your index" };
  if (isEmbedRootPage) return { title: "Not Found" };
  if (isEmbedPage) {
    rest = rest.slice(2);
  }

  const paths = await ValidatePaths(rest);
  if (!paths.success) return { title: "Not Found" };

  const currentPath = paths.data.pop();
  if (!currentPath?.id) return { title: "Not Found" };

  const banner = await GetBanner(currentPath.id);
  if (isEmbedPage && !currentPath.mimeType.includes("video") && !currentPath.mimeType.includes("audio"))
    return { title: "Not Found" };

  return {
    title: isEmbedPage ? `${decodeURIComponent(currentPath.path)} (embed)` : decodeURIComponent(currentPath.path),
    description: isEmbedPage
      ? `Embed ${currentPath.path}`
      : currentPath.mimeType.includes("folder")
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
  const p = await params;
  let rest = p.rest;
  const { isInternalRoot, isConfiguratorPage, isEmbedPage, isEmbedRootPage, isGuidePage } = internal(p.rest);
  if (isInternalRoot)
    return (
      <div className='grid grow place-items-center'>
        <Status
          icon='Lock'
          message="This path is preserved for all internal pages, make sure you don't use this path on your google drive"
        />
      </div>
    );
  if (isGuidePage) return <DeployPage />;
  if (isConfiguratorPage) return <ConfiguratorPage />;
  if (isEmbedRootPage) return notFound();
  if (isEmbedPage) rest = rest.slice(2);

  const paths = await ValidatePaths(rest);
  if (!paths.success) notFound();

  const unlocked = await CheckPagePassword(paths.data);
  if (!unlocked.success && isEmbedPage)
    return <ErrorComponent error={new Error("Protected file cannot be embedded")} />;
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
    if (isEmbedPage) return <ErrorComponent error={new Error("Folder cannot be embedded")} />;
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

  if (isEmbedPage) {
    if (!currentPath.mimeType.includes("video") && !currentPath.mimeType.includes("audio"))
      return (
        <div className='max-w-screen fixed left-0 top-0 grid h-full max-h-screen w-full place-items-center bg-transparent p-2'>
          <ErrorComponent error={new Error("Only video and audio file can be embedded")} />
        </div>
      );
    return (
      <div className='max-w-screen fixed left-0 top-0 grid h-full max-h-screen w-full place-items-center bg-transparent p-2'>
        <EmbedPage
          file={file.data}
          type={currentPath.mimeType.includes("video") ? "video" : "audio"}
        />
      </div>
    );
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
      />
    </Layout>
  );
}
