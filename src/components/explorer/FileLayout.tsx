"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { type z } from "zod";

import { FileItem } from "~/components/explorer";
import { Status } from "~/components/global";
import { PageLoader } from "~/components/layout";
import { Button, LoadingButton } from "~/components/ui/button";
import Icon from "~/components/ui/icon";

import { useLayout } from "~/context/layoutContext";
import useLoading from "~/hooks/useLoading";
import { cn } from "~/lib/utils";

import { type Schema_File } from "~/types/schema";

import { ListFiles } from "~/actions/files";

import config from "config";

type Props = {
  encryptedId: string;
  files: z.infer<typeof Schema_File>[];
  nextPageToken?: string;
  showBackButton?: boolean;
};
export default function FileExplorerLayout({ encryptedId, files, nextPageToken, showBackButton }: Props) {
  const { layout, isPending } = useLayout();
  const loading = useLoading();
  const pathname = usePathname();
  const prevPath = useMemo<string>(() => {
    const path = pathname.split("/").slice(0, -1).join("/").replace(/\/+/g, "/");

    return new URL(path, config.basePath).pathname;
  }, [pathname]);

  const [filesList, setFilesList] = useState<z.infer<typeof Schema_File>[]>(files);
  const [nextToken, setNextToken] = useState<string | undefined>(nextPageToken);
  const [isLoadingMore, setLoadingMore] = useState<boolean>(false);

  const onLoadMore = async () => {
    setLoadingMore(true);
    try {
      if (!nextToken) throw new Error("No more files to load");
      const data = await ListFiles({ id: encryptedId, pageToken: nextToken });
      if (!data.success) throw new Error(data.error);

      const uniqueData = [...filesList, ...data.data.files].filter(
        (item, index, self) => index === self.findIndex((i) => i.encryptedId === item.encryptedId),
      );

      setFilesList(uniqueData);
      setNextToken(data.data.nextPageToken ?? undefined);
    } catch (error) {
      const e = error as Error;
      console.error(`[OnLoadMore] ${e.message}`);
      toast.error(e.message);
    } finally {
      setLoadingMore(false);
    }
  };

  if (loading || isPending) return <PageLoader message='Loading files...' />;

  return (
    <section
      slot='explorer'
      className={cn("mx-auto w-full max-w-screen-desktop", "flex flex-grow-0 flex-col gap-4 px-2 py-4")}
    >
      {showBackButton && (
        <Button
          variant={"secondary"}
          asChild
        >
          <Link href={prevPath}>
            <Icon
              name='CornerLeftUp'
              size={"1rem"}
              className='mr-2'
            />
            Back
          </Link>
        </Button>
      )}

      {!filesList.length ? (
        <Status
          icon='Frown'
          message='There are no files here'
        />
      ) : (
        <div
          slot='file-container'
          className={cn(
            "w-full",
            layout === "list"
              ? "flex flex-col gap-2"
              : "grid grid-cols-1 gap-2 mobile:grid-cols-2 tablet:grid-cols-3 desktop:grid-cols-4",
          )}
        >
          {filesList.map((file) => (
            <div
              slot='item'
              key={file.encryptedId}
              className='group'
            >
              <FileItem
                data={file}
                layout={layout}
              />
            </div>
          ))}
        </div>
      )}
      {nextToken && (
        <LoadingButton
          className='w-full'
          loading={isLoadingMore}
          onClick={onLoadMore}
        >
          Load more files
        </LoadingButton>
      )}
    </section>
  );
}
