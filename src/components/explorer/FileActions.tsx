"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { type z } from "zod";

import { Status } from "~/components/global";
import { PageLoader } from "~/components/layout";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "~/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import Icon from "~/components/ui/icon";
import { Input } from "~/components/ui/input";
import { Separator } from "~/components/ui/separator";
import { Skeleton } from "~/components/ui/skeleton";

import { useLayout } from "~/context/layoutContext";
import { useResponsive } from "~/context/responsiveContext";
import useLoading from "~/hooks/useLoading";
import useRouter from "~/hooks/usePRouter";
import { getPreviewIcon } from "~/lib/previewHelper";
import { bytesToReadable, cn, durationToReadable, formatDate } from "~/lib/utils";

import { type Schema_File } from "~/types/schema";

import { GetSearchResultPath, SearchFiles } from "~/actions/search";

import config from "config";

export default function FileActions() {
  const loading = useLoading();
  const { layout, setLayout, isPending } = useLayout();

  const [layoutOpen, setLayoutOpen] = useState<boolean>(false);
  const [snap, setSnap] = useState<number | string | null>(0.3);
  const [searchOpen, setSearchOpen] = useState<boolean>(false);
  const [searchInput, setSearchInput] = useState<string>("");
  const [debouncedSearchInput, setDebouncedSearchInput] = useState<string>("");
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string>("");
  const [searchResults, setSearchResults] = useState<z.infer<typeof Schema_File>[]>([]);

  const { isDesktop } = useResponsive();

  useEffect(() => {
    if (!searchInput) {
      setSearchLoading(true);
      setDebouncedSearchInput("");
      setSearchError("");
      setSearchResults([]);
      return;
    }
    const handler = setTimeout(() => {
      setDebouncedSearchInput(searchInput);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchInput]);
  useEffect(() => {
    if (!debouncedSearchInput) return;
    void onSearch();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchInput]);

  const onSearch = async () => {
    setSearchLoading(true);
    try {
      const results = await SearchFiles(debouncedSearchInput);
      if (!results.success) throw new Error(results.error);
      setSearchResults(results.data);
    } catch (error) {
      const e = error as Error;
      console.error(`[Search Error] ${e.message}`);
      setSearchError(e.message);
    } finally {
      setSearchLoading(false);
    }
  };

  if (loading)
    <div className={cn("w-fit", "flex items-center justify-end gap-2")}>
      <Skeleton className='my-0.5 h-8 w-16 mobile:w-24' /> <Skeleton className='my-0.5 h-8 w-8' />
    </div>;

  return (
    <div
      slot='actions'
      className={cn("w-fit", "flex items-center justify-end gap-2")}
    >
      {isDesktop ? (
        <>
          <DropdownMenu
            open={layoutOpen}
            onOpenChange={setLayoutOpen}
          >
            <DropdownMenuTrigger asChild>
              <Button variant={"outline"}>
                <Icon name={layout === "grid" ? "LayoutGrid" : "LayoutList"} />
                {layout === "grid" ? "Grid" : "List"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                disabled={isPending ?? layout === "grid"}
                onClick={() => {
                  setLayout("grid");
                }}
              >
                <div className='flex w-full items-center justify-between'>
                  Grid
                  <Icon
                    name={layout === "grid" ? "Check" : "LayoutGrid"}
                    className='stroke-foreground'
                  />
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={isPending ?? layout === "list"}
                onClick={() => {
                  setLayout("list");
                }}
              >
                <div className='flex w-full items-center justify-between'>
                  List
                  <Icon
                    name={layout === "list" ? "Check" : "LayoutList"}
                    className='stroke-foreground'
                  />
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Dialog
            open={searchOpen}
            onOpenChange={(open) => {
              if (!open) {
                setSnap(0.275);
                setTimeout(() => {
                  setSearchInput("");
                }, 300);
              }
              setSearchOpen(open);
            }}
          >
            <DialogTrigger asChild>
              <Button
                size={"icon"}
                variant={"outline"}
                className='flex items-center'
              >
                <Icon
                  name='Search'
                  size={"1rem"}
                />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Search</DialogTitle>
                <DialogDescription>Search for files in your drive</DialogDescription>
              </DialogHeader>
              <div className='grid gap-4'>
                <div
                  slot='search-input'
                  className='grid gap-2'
                >
                  <Input
                    placeholder='What are you looking for?'
                    value={searchInput}
                    onChange={(e) => {
                      setSearchError("");
                      if (!e.target.value) {
                        setSearchInput("");
                        setSnap(0.3);
                      } else {
                        setSearchLoading(true);
                        setSearchInput(e.target.value);
                        setSnap(1);
                      }
                    }}
                  />
                </div>
                <Separator />
                <div
                  slot='search-result'
                  className='flex h-full max-h-[66dvh] flex-grow flex-col gap-2 overflow-y-auto'
                >
                  {!debouncedSearchInput ? (
                    <Status
                      icon='Search'
                      message='Start typing to search'
                    />
                  ) : searchLoading ? (
                    <Status
                      icon='LoaderCircle'
                      iconClassName='animate-spin'
                      message='Searching...'
                    />
                  ) : searchError ? (
                    <Status
                      icon='CircleX'
                      message={searchError}
                      destructive
                    />
                  ) : !searchResults.length ? (
                    <Status
                      icon='Frown'
                      message="We couldn't find any results"
                    />
                  ) : (
                    <div className='flex w-full flex-col gap-1'>
                      {searchResults.map((result) => (
                        <SearchResultItem
                          key={result.encryptedId}
                          data={result}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </>
      ) : (
        <>
          <Drawer
            open={layoutOpen}
            onOpenChange={setLayoutOpen}
            shouldScaleBackground
          >
            <DrawerTrigger asChild>
              <Button
                variant={"outline"}
                size={"icon"}
              >
                <Icon name={layout === "grid" ? "LayoutGrid" : "LayoutList"} />
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader className='text-start'>
                <DrawerTitle>File Layout</DrawerTitle>
                <DrawerDescription>Choose a layout for the files explorer</DrawerDescription>
              </DrawerHeader>

              <div className='grid gap-2 px-4 md:px-0'>
                <Button
                  variant={layout === "grid" ? "secondary" : "outline"}
                  size={"default"}
                  className='w-full'
                  disabled={isPending ?? layout === "grid"}
                  onClick={() => {
                    setLayout("grid");
                  }}
                >
                  <div className='flex w-full items-center justify-between'>
                    <span className='capitalize'>Grid</span>
                    <Icon
                      name={layout === "grid" ? "Check" : "LayoutGrid"}
                      size={"1rem"}
                    />
                  </div>
                </Button>
                <Button
                  variant={layout === "list" ? "secondary" : "outline"}
                  size={"default"}
                  className='w-full'
                  disabled={isPending ?? layout === "list"}
                  onClick={() => {
                    setLayout("list");
                  }}
                >
                  <div className='flex w-full items-center justify-between'>
                    <span className='capitalize'>List</span>
                    <Icon
                      name={layout === "list" ? "Check" : "LayoutList"}
                      size={"1rem"}
                    />
                  </div>
                </Button>
              </div>

              <DrawerFooter>
                <DrawerClose asChild>
                  <Button
                    className='w-full'
                    variant={"secondary"}
                  >
                    Close
                  </Button>
                </DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
          <Drawer
            open={searchOpen}
            onOpenChange={(open) => {
              if (!open) {
                setSnap(0.275);
                setTimeout(() => {
                  setSearchInput("");
                }, 300);
              }
              setSearchOpen(open);
            }}
            shouldScaleBackground
            fadeFromIndex={0}
            snapPoints={[0.275, 1]}
            activeSnapPoint={snap}
            setActiveSnapPoint={setSnap}
          >
            <DrawerTrigger asChild>
              <Button
                size={"icon"}
                variant={"outline"}
                className='flex items-center'
              >
                <Icon
                  name='Search'
                  size={"1rem"}
                />
              </Button>
            </DrawerTrigger>

            <DrawerContent className='h-full max-h-[95%]'>
              <DrawerHeader className='text-start'>
                <DrawerTitle>Search</DrawerTitle>
                <DrawerDescription>Search for files in your drive</DrawerDescription>
              </DrawerHeader>

              <div className='grid gap-4 px-4 md:px-0'>
                <div
                  slot='search-input'
                  className='grid gap-2'
                >
                  <Input
                    placeholder='What are you looking for?'
                    value={searchInput}
                    onChange={(e) => {
                      setSearchError("");
                      if (!e.target.value) {
                        setSearchInput("");
                        setSnap(0.3);
                      } else {
                        setSearchLoading(true);
                        setSearchInput(e.target.value);
                        setSnap(1);
                      }
                    }}
                  />
                  <DrawerClose asChild>
                    <Button
                      size={"sm"}
                      variant={"secondary"}
                    >
                      Close
                    </Button>
                  </DrawerClose>
                </div>

                <Separator />

                <div
                  slot='search-result'
                  className='flex h-fit flex-grow flex-col gap-2 overflow-y-auto'
                >
                  {!debouncedSearchInput ? (
                    <Status
                      icon='Search'
                      message='Start typing to search'
                    />
                  ) : searchLoading ? (
                    <PageLoader message='Searching...' />
                  ) : searchError ? (
                    <Status
                      icon='CircleX'
                      message={searchError}
                      destructive
                    />
                  ) : !searchResults.length ? (
                    <Status
                      icon='Frown'
                      message="We couldn't find any results"
                    />
                  ) : (
                    <div className='flex w-full flex-col gap-2'>
                      {searchResults.map((result) => (
                        <SearchResultItem
                          key={result.encryptedId}
                          data={result}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </DrawerContent>
          </Drawer>
        </>
      )}
    </div>
  );
}

function SearchResultItem({ data }: { data: z.infer<typeof Schema_File> }) {
  const router = useRouter();

  const useThumbnail = useMemo<boolean>(
    () => !!(data.thumbnailLink && (data.mimeType.includes("image") || data.mimeType.includes("video"))),
    [data],
  );

  const [thumbnailUrl, setThumbnailUrl] = useState<string>(`/api/thumb/${data.encryptedId}?size=2`);
  const [thumbnailLoading, setThumbnailLoading] = useState<boolean>(true);

  const onOpen = useCallback(async () => {
    toast.loading("Getting file path...", {
      description: "Might take a while for deep nested file",
      id: `open-${data.encryptedId}`,
    });
    try {
      const paths = await GetSearchResultPath(data.encryptedId);
      if (!paths.success) throw new Error(paths.error);
      toast.success("Redirecting...", {
        id: `open-${data.encryptedId}`,
      });
      router.push(`/${paths.data}`);
    } catch (error) {
      const e = error as Error;
      console.error(`[Redirect Error] ${e.message}`);
      toast.error(e.message, {
        id: `open-${data.encryptedId}`,
      });
    }
  }, [data.encryptedId, router]);

  return (
    <div
      slot='file-search-result'
      title={data.name}
      className='group flex cursor-pointer items-center overflow-hidden rounded-lg border bg-card text-card-foreground shadow transition hover:border-accent-foreground'
      onClick={onOpen}
    >
      {/* Thumbnail / Icon */}
      <div className='relative grid aspect-square h-full w-14 shrink-0 place-items-center overflow-hidden mobile:w-16 tablet:w-20'>
        {useThumbnail ? (
          <>
            <img
              src={thumbnailUrl}
              alt={data.name}
              className='absolute -z-0 h-full w-full shrink-0 grow-0 object-cover object-center opacity-50 blur-sm'
            />
            <img
              src={thumbnailUrl}
              alt={data.name}
              onLoad={() => {
                if (thumbnailUrl.endsWith("size=2")) {
                  setThumbnailUrl(`/api/thumb/${data.encryptedId}`);
                  setThumbnailLoading(false);
                }
              }}
              className={cn(
                "relative z-0 w-full shrink-0 grow-0 object-contain object-center transition duration-500 ease-in-out group-hover:scale-105",
                thumbnailLoading ? "blur-lg" : "blur-0",
              )}
            />

            {data.mimeType.includes("video") && (
              <div className='absolute inset-0 z-0 grid h-full w-full place-items-center'>
                <Button
                  size={"icon"}
                  variant={"outline"}
                  className='rounded-full group-hover:bg-accent group-hover:stroke-accent-foreground group-hover:text-accent-foreground'
                >
                  <Icon
                    name='Play'
                    className='fill-current'
                  />
                </Button>
                <div className='absolute bottom-0.5 right-0.5 z-0 rounded-sm bg-muted px-1 py-0.5 text-[10px] text-muted-foreground shadow-sm mobile:bottom-1 mobile:right-1 mobile:text-xs'>
                  {durationToReadable(data.videoMediaMetadata?.durationMillis ?? 0)}
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <div className='grid h-full w-full place-items-center'>
              <Icon
                name={
                  data.mimeType.includes("folder") ? "Folder" : getPreviewIcon(data.fileExtension ?? "", data.mimeType)
                }
                className={"size-6 stroke-muted-foreground"}
              />
            </div>
          </>
        )}
      </div>

      {/* Info */}
      <div className='flex h-full grow flex-col justify-start p-2'>
        <span className='line-clamp-1 whitespace-pre-wrap text-pretty break-all text-base mobile:text-sm'>
          {config.siteConfig.showFileExtension
            ? data.name
            : data.fileExtension
            ? data.name.replace(new RegExp(`\.${data.fileExtension}$`), "")
            : data.name}
        </span>

        <div className='flex flex-col gap-1'>
          <span className='inline-flex items-center gap-1 text-xs text-muted-foreground'>
            {/* Type */}
            {data.mimeType.includes("folder") ? (
              "Folder"
            ) : config.siteConfig.showFileExtension ? (
              <></>
            ) : (
              data.fileExtension ?? "Unknown format"
            )}
            {/* Slash */}
            {!data.mimeType.includes("folder") && !config.siteConfig.showFileExtension && (
              <Icon
                name='Slash'
                className='size-3'
              />
            )}
            {/* Size */}
            {!data.mimeType.includes("folder") && bytesToReadable(data.size ?? 0)}
          </span>
          <span className='text-xs text-muted-foreground'>{formatDate(data.modifiedTime)}</span>
        </div>
      </div>
    </div>
  );
}
