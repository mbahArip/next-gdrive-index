"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useContext, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { z } from "zod";

import { Grid, List } from "~/components/Explorer";
import { ButtonLoading, Icon, Loader, Status } from "~/components/Global";
import { Button } from "~/components/ui/button";

import { cn } from "~/utils/cn";
import { decryptData } from "~/utils/encryptionHelper";

import { LayoutContext } from "~/context/layoutContext";
import useLoading from "~/hooks/useLoading";

import { ButtonState, Schema_File } from "~/types/schema";

import { GetFiles } from "actions";
import config from "config";

type Props = {
  encryptedId: string;
  files: z.infer<typeof Schema_File>[];
  nextPageToken?: string;
  root?: boolean;
};
export default function Explorer({ encryptedId, files, nextPageToken, root }: Props) {
  const { layout } = useContext(LayoutContext);
  const loading = useLoading();
  const pathname = usePathname();
  const prevPath = useMemo<string>(() => {
    const path = pathname.split("/").slice(0, -1).join("/").replace(/\/+/g, "/");

    return new URL(path, config.basePath).pathname;
  }, [pathname]);

  const [fileList, setFileList] = useState<z.infer<typeof Schema_File>[]>(files);
  const [nextToken, setNextToken] = useState<string | undefined>(nextPageToken);
  const [loadMoreState, setLoadMoreState] = useState<ButtonState>("idle");

  const onLoadMore = async () => {
    setLoadMoreState("loading");
    try {
      if (!nextToken) throw new Error("No more files to load");
      const id = await decryptData(encryptedId);
      const data = await GetFiles({ id, pageToken: nextToken });
      const uniqueData = [...fileList, ...data.files].filter(
        (item, index, array) => index === array.findIndex((i) => i.encryptedId === item.encryptedId),
      );

      setFileList(uniqueData);
      setNextToken(data.nextPageToken);
    } catch (error) {
      const e = error as Error;
      console.error(e.message);
      toast.error(e.message);
    } finally {
      setLoadMoreState("idle");
    }
  };

  if (loading) return <Loader message='Loading files...' />;

  return (
    <section
      slot='explorer'
      className={cn("mx-auto w-full max-w-screen-desktop", "flex flex-grow-0 flex-col gap-3 p-3")}
    >
      {!root && (
        <Button
          size={"sm"}
          variant={"ghost"}
          className='justify-start'
          asChild
        >
          <Link href={prevPath}>
            <Icon
              name='CornerLeftUp'
              size={"1rem"}
              className='mr-3'
            />
            Back
          </Link>
        </Button>
      )}

      {!fileList.length ? (
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
              ? "flex flex-col gap-1.5"
              : "grid grid-cols-1 gap-3 mobile:grid-cols-2 tablet:grid-cols-3 desktop:grid-cols-4",
          )}
        >
          {fileList.map((file) => (
            <div
              slot='item'
              key={file.encryptedId}
              className='group'
            >
              {layout === "list" ? <List data={file} /> : <Grid data={file} />}
            </div>
          ))}
        </div>
      )}

      {nextToken && (
        <ButtonLoading
          className='w-full'
          size={"sm"}
          variant={"secondary"}
          state={loadMoreState}
          onClick={onLoadMore}
        >
          Load more files
        </ButtonLoading>
      )}
    </section>
  );
}
