"use client";

import { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { z } from "zod";
import Icon from "~/components/Icon";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { LayoutContext } from "~/context/layoutContext";
import { Schema_File } from "~/schema";
import { cn } from "~/utils";

import FileGrid from "./@file.grid";
import FileList from "./@file.list";
import { GetFiles } from "./actions";

type Props = {
  files: z.infer<typeof Schema_File>[];
  nextPageToken?: string;
};
export default function FileBrowser({ files, nextPageToken }: Props) {
  const { layout } = useContext(LayoutContext);
  const [fileList, setFileList] =
    useState<z.infer<typeof Schema_File>[]>(files);
  const [nextToken, setNextToken] = useState<string | undefined>(nextPageToken);
  const [loadMoreLoading, setLoadMoreLoading] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  const onLoadMore = async () => {
    setLoadMoreLoading(true);
    try {
      if (!nextToken) throw new Error("No more files to load");
      const data = await GetFiles({ pageToken: nextToken });
      const uniqueData = new Set([...fileList, ...data.files]);
      setFileList(Array.from(uniqueData));
      setNextToken(data.nextPageToken);
    } catch (error) {
      const e = error as Error;
      console.error(e.message);
      toast.error(e.message);
    } finally {
      setLoadMoreLoading(false);
    }
  };

  if (loading) {
    return (
      <div
        className={cn(
          "mx-auto h-[50dvh] w-full max-w-screen-desktop",
          "rounded-[var(--radius)] bg-card",
          "gap-3 p-3",
          "flex-grow-0",
          "flex flex-col items-center justify-center",
        )}
      >
        <Icon
          name='LoaderCircle'
          size={32}
          className='animate-spin'
        />
        <p>Wait a moment while we load your files...</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "mx-auto w-full max-w-screen-desktop",
        "gap-3 p-3",
        "flex-grow-0",
        "flex flex-col",
        // layout === "grid"
        //   ? "grid grid-cols-1 mobile:grid-cols-2 tablet:grid-cols-3 desktop:grid-cols-4"
        //   : "flex flex-col",
      )}
    >
      {!fileList.length && (
        <div className='col-span-full flex flex-col items-center justify-center py-6'>
          <p className='large'>
            <Icon
              name='Frown'
              size={32}
            />
          </p>
          <p className='muted'>No files found</p>
        </div>
      )}
      {layout === "list" && (
        <div className='flex w-full flex-col gap-1.5'>
          {fileList.map((file) => (
            <div
              key={file.encryptedId}
              className='group'
            >
              <FileList
                key={file.encryptedId}
                data={file}
              />
              <Separator className='mt-1.5 group-last:hidden' />
            </div>
          ))}
        </div>
      )}
      {layout === "grid" && (
        <div className='grid grid-cols-1 gap-3 mobile:grid-cols-2 tablet:grid-cols-3 desktop:grid-cols-4'>
          {fileList.map((file) => (
            <div
              key={file.encryptedId}
              className='group'
            >
              <FileGrid
                key={file.encryptedId}
                data={file}
              />
            </div>
          ))}
        </div>
      )}

      {nextToken && (
        <Button
          className='col-span-full gap-3'
          size={"sm"}
          variant={"secondary"}
          disabled={loadMoreLoading}
          onClick={onLoadMore}
        >
          {loadMoreLoading ? (
            <>
              <Icon
                name='LoaderCircle'
                size={16}
                className='animate-spin'
              />
              Loading...
            </>
          ) : (
            <>Load More</>
          )}
        </Button>
      )}
    </div>
  );
}
