import { type Metadata, type ResolvedMetadata } from "next";
import { notFound } from "next/navigation";

import { EmbedPage } from "~/components/internal";
import { ErrorComponent } from "~/components/layout";

import { GetFile } from "~/actions/files";
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

  if (!currentPath.mimeType.includes("video") && !currentPath.mimeType.includes("audio")) return { title: "Not Found" };

  return {
    title: `${decodeURIComponent(currentPath.path)} (embed)`,
    description: `Embed view of ${currentPath.path}`,
    openGraph: {
      images: parent.openGraph?.images,
    },
  };
}

export default async function InternalEmbedPage({ params }: Props) {
  const { rest } = await params;

  const paths = await ValidatePaths(rest);
  if (!paths.success) notFound();

  const unlocked = await CheckPagePassword(paths.data);
  if (!unlocked.success) return <ErrorComponent error={new Error("Protected file cannot be embedded")} />;

  const currentPath = paths.data.pop();
  if (!currentPath) return <ErrorComponent error={new Error("Failed to get current path")} />;

  if (!currentPath.mimeType.includes("video") && !currentPath.mimeType.includes("audio"))
    return (
      <div className='max-w-screen fixed left-0 top-0 grid h-full max-h-screen w-full place-items-center bg-transparent p-2'>
        <ErrorComponent error={new Error("Only video and audio files can be embedded")} />
      </div>
    );

  const file = await GetFile(currentPath.id);
  if (!file.success) {
    if (file.error === "NotFound") notFound();
    return <ErrorComponent error={new Error(file.error)} />;
  }
  if (!file.data) return <ErrorComponent error={new Error("Failed to get file data")} />;
  const token = await CreateFileToken(file.data);
  if (!token.success) return <ErrorComponent error={new Error(token.error)} />;

  return (
    <div className='max-w-screen fixed left-0 top-0 grid h-full max-h-screen w-full place-items-center bg-transparent p-2'>
      <EmbedPage
        file={file.data}
        type={currentPath.mimeType.includes("video") ? "video" : "audio"}
      />
    </div>
  );
}
