"use client";

import { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { z } from "zod";

import { Icon, Loader, Status } from "~/components/Global";
import { ResponsiveDropdown } from "~/components/Layout";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogClose,
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
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "~/components/ui/drawer";
import { Input } from "~/components/ui/input";
import { Separator } from "~/components/ui/separator";
import { Skeleton } from "~/components/ui/skeleton";

import { bytesToReadable } from "~/utils/bytesFormat";
import { cn } from "~/utils/cn";
import { getPreviewIcon } from "~/utils/previewHelper";

import { LayoutContext } from "~/context/layoutContext";
import useLoading from "~/hooks/useLoading";
import useMediaQuery from "~/hooks/useMediaQuery";
import useRouter from "~/hooks/usePRouter";

import { Schema_File } from "~/types/schema";

import { RedirectSearchFile, SearchFile } from "actions";

export default function Actions() {
  const loading = useLoading();
  const { layout, setLayout } = useContext(LayoutContext);

  const [layoutOpen, setLayoutOpen] = useState<boolean>(false);
  const [snap, setSnap] = useState<number | string | null>(0.3);
  const [searchOpen, setSearchOpen] = useState<boolean>(false);
  const [searchInput, setSearchInput] = useState<string>("");
  const [debouncedSearchInput, setDebouncedSearchInput] = useState<string>("");
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string>("");
  const [searchResults, setSearchResults] = useState<z.infer<typeof Schema_File>[]>([]);
  const [nextPageToken, setNextPageToken] = useState<string>();

  const isDesktop = useMediaQuery("(min-width: 768px)");

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
    onSearch();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchInput]);

  const onSearch = async () => {
    setSearchLoading(true);
    try {
      const data = await SearchFile(debouncedSearchInput, nextPageToken);
      setSearchResults(data.files);
      setNextPageToken(data.nextPageToken);
    } catch (error) {
      const e = error as Error;
      console.error(e);
      setSearchError(e.message);
    } finally {
      setSearchLoading(false);
    }
  };

  if (loading)
    <div className={cn("w-fit", "flex items-center justify-end gap-1.5")}>
      <Skeleton className='my-0.5 h-8 w-16 mobile:w-24' /> <Skeleton className='my-0.5 h-8 w-8' />
    </div>;

  return (
    <div
      slot='actions'
      className={cn("w-fit", "flex items-center justify-end gap-1.5")}
    >
      <ResponsiveDropdown
        open={layoutOpen}
        onOpenChange={setLayoutOpen}
        trigger={
          <Button
            variant={"outline"}
            className='flex w-24 items-center justify-between gap-1.5'
          >
            <div className='flex items-center gap-1.5'>
              <Icon
                name={layout === "grid" ? "LayoutGrid" : "LayoutList"}
                size={"1rem"}
              />
              <span>{layout === "grid" ? "Grid" : "List"}</span>
            </div>
            {isDesktop && (
              <Icon
                name='ChevronDown'
                className={cn("transition", layoutOpen && "rotate-180")}
                size={"0.875rem"}
              />
            )}
          </Button>
        }
        mobile={{
          title: "File Layout",
          description: "Choose a layout for the files explorer",
          content: (
            <>
              <DrawerClose asChild>
                <Button
                  variant={layout === "grid" ? "default" : "outline"}
                  onClick={() => {
                    setLayout("grid");
                    setLayoutOpen(false);
                  }}
                  className='justify-start gap-3'
                >
                  <Icon
                    name={layout === "grid" ? "Check" : "LayoutGrid"}
                    size={"1rem"}
                  />
                  <span>Grid</span>
                </Button>
              </DrawerClose>
              <DrawerClose asChild>
                <Button
                  variant={layout === "list" ? "default" : "outline"}
                  onClick={() => {
                    setLayout("list");
                    setLayoutOpen(false);
                  }}
                  className='justify-start gap-3'
                >
                  <Icon
                    name={layout === "list" ? "Check" : "LayoutList"}
                    size={"1rem"}
                  />
                  <span>List</span>
                </Button>
              </DrawerClose>
            </>
          ),
          closeOnFooter: true,
        }}
        desktop={{
          align: "end",
          items: [
            {
              type: "item",
              key: "grid",
              icon: "LayoutGrid",
              title: "Grid",
              onClick: () => {
                setLayout("grid");
                setLayoutOpen(false);
              },
              className: cn(layout === "grid" && "bg-primary text-primary-foreground"),
            },
            {
              type: "item",
              key: "list",
              icon: "LayoutList",
              title: "List",
              onClick: () => {
                setLayout("list");
                setLayoutOpen(false);
              },
              className: cn(layout === "list" && "bg-primary text-primary-foreground"),
            },
          ],
        }}
      />

      {isDesktop ? (
        <Dialog
          open={searchOpen}
          onOpenChange={(open) => {
            if (!open) {
              setSearchInput("");
              setSnap(0.3);
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
            <div className='flex h-full flex-col gap-6'>
              <div
                slot='search-input'
                className='grid gap-1.5'
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
                <DialogClose asChild>
                  <Button
                    size={"sm"}
                    variant={"secondary"}
                  >
                    Close
                  </Button>
                </DialogClose>
              </div>
              <Separator />
              <div
                slot='search-result'
                className='flex h-full max-h-[66dvh] flex-grow flex-col gap-1.5 overflow-y-auto'
              >
                {!debouncedSearchInput ? (
                  <Status
                    icon='Search'
                    message='Start typing to search'
                  />
                ) : searchLoading ? (
                  <Loader message='Searching...' />
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
                  <div className='flex w-full flex-col gap-1.5'>
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
      ) : (
        <Drawer
          open={searchOpen}
          onOpenChange={(open) => {
            if (!open) {
              setSearchInput("");
              setSnap(0.3);
            }
            setSearchOpen(open);
          }}
          shouldScaleBackground
          fadeFromIndex={0}
          snapPoints={[0.3, 1]}
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

            <div className='flex h-full flex-col gap-6'>
              <div
                slot='search-input'
                className='grid gap-1.5 px-4'
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
                className='flex h-fit flex-grow flex-col gap-1.5 overflow-y-auto px-4'
              >
                {!debouncedSearchInput ? (
                  <Status
                    icon='Search'
                    message='Start typing to search'
                  />
                ) : searchLoading ? (
                  <Loader message='Searching...' />
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
                  <div className='flex w-full flex-col gap-1.5'>
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
      )}
    </div>
  );
}

function SearchResultItem({ data }: { data: z.infer<typeof Schema_File> }) {
  const [thumbnailURL, setThumbnailURL] = useState<string>(`/api/thumb/${data.encryptedId}?size=2`);
  const router = useRouter();

  return (
    <div
      className={cn(
        "relative",
        "px-1.5 py-1 pr-10", // since action button is size-8
        "rounded-[var(--radius)]",
        "flex flex-grow items-center justify-between gap-3",
        "hover:bg-muted/50",
        "cursor-pointer transition",
      )}
      onClick={async () => {
        toast.loading("Getting file path...", {
          id: `open-${data.encryptedId}`,
        });
        try {
          const paths = await RedirectSearchFile(data.encryptedId);
          router.push(`/${paths}`);
          toast.success("Redirecting...", {
            id: `open-${data.encryptedId}`,
          });
        } catch (error) {
          const e = error as Error;
          console.error(e);
          toast.error(e.message, {
            id: `open-${data.encryptedId}`,
          });
        }
      }}
    >
      <div className={cn("flex-shrink flex-grow", "flex items-center gap-3")}>
        {/* If it's media, show thumbnail */}
        <div className='relative flex-shrink-0 rounded-[var(--radius)] bg-muted/25'>
          {data.thumbnailLink && (data.mimeType.startsWith("video") || data.mimeType.startsWith("image")) ? (
            <>
              <img
                src={thumbnailURL}
                alt={data.name}
                onLoad={(e) => {
                  if (thumbnailURL.includes("size=2")) {
                    setThumbnailURL(`/api/thumb/${data.encryptedId}`);
                  }
                }}
                className='size-16 flex-shrink-0 flex-grow-0 rounded-[var(--radius)] object-cover tablet:size-20'
              />

              {data.mimeType.startsWith("video") && (
                <>
                  <Icon
                    name='Play'
                    className='absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-muted-foreground fill-muted p-1.5 text-muted opacity-75'
                    size={"1.5rem"}
                  />
                </>
              )}
            </>
          ) : (
            <Icon
              name={
                data.mimeType.includes("folder") ? "Folder" : getPreviewIcon(data.fileExtension || "", data.mimeType)
              }
              className='size-16 flex-shrink-0 flex-grow-0 p-3 tablet:size-20'
            />
          )}
        </div>

        {/* File data */}
        <div className='flex w-full flex-col'>
          <span className='line-clamp-1 whitespace-pre-wrap break-all'>
            {data.fileExtension ? data.name.replace(new RegExp(`.${data.fileExtension}$`), "") : data.name}
          </span>
          <div className='muted flex items-center gap-1'>
            <span className='line-clamp-1 whitespace-pre-wrap break-all text-sm'>
              {data.mimeType.includes("folder") ? "folder" : data.fileExtension}
            </span>
            {!data.mimeType.includes("folder") && (
              <>
                <Icon
                  name='Slash'
                  size={"0.875rem"}
                />
                <span className='whitespace-nowrap text-sm'>{bytesToReadable(data.size || 0)}</span>
              </>
            )}
          </div>
          <div className='muted flex items-center gap-1'>
            <span className='whitespace-nowrap text-sm'>{new Date(data.modifiedTime).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
