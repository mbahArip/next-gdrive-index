"use client";

import { PropsWithChildren, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { z } from "zod";
import { Schema_File } from "~/schema";
import { cn } from "~/utils";

import Icon from "~/components/Icon";
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
import { Input } from "~/components/ui/input";
import { Separator } from "~/components/ui/separator";
import { Skeleton } from "~/components/ui/skeleton";

import { LayoutContext } from "~/context/layoutContext";
import useMediaQuery from "~/hooks/useMediaQuery";
import useRouter from "~/hooks/usePRouter";
import bytesToReadable from "~/utils/bytesFormat";
import { getPreviewIcon } from "~/utils/previewHelper";

import { RedirectSearchFile, SearchFile } from "./actions";

export default function HeaderButton({ children }: PropsWithChildren) {
  const { layout, setLayout } = useContext(LayoutContext);

  const [layoutOpen, setLayoutOpen] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(true);
  const [snap, setSnap] = useState<number | string | null>(0.3);
  const [searchOpen, setSearchOpen] = useState<boolean>(false);
  const [searchInput, setSearchInput] = useState<string>("");
  const [debouncedSearchInput, setDebouncedSearchInput] = useState<string>("");
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string>("");
  const [searchResults, setSearchResults] = useState<
    z.infer<typeof Schema_File>[]
  >([]);
  const [nextPageToken, setNextPageToken] = useState<string>();

  const isDesktop = useMediaQuery("(min-width: 768px)");

  useEffect(() => {
    setLoading(false);
  }, []);

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

  if (loading) {
    return (
      <div className={cn("w-fit", "flex items-center justify-end gap-1.5")}>
        <Skeleton className='my-0.5 h-8 w-16 mobile:w-24' />{" "}
        <Skeleton className='my-0.5 h-8 w-8' />
      </div>
    );
  }

  return (
    <div
      className={cn(
        // "mx-auto max-w-screen-desktop flex-grow",
        "w-fit",
        "flex items-center justify-end gap-1.5",
      )}
    >
      {isDesktop ? (
        <DropdownMenu
          open={layoutOpen}
          onOpenChange={setLayoutOpen}
        >
          <DropdownMenuTrigger asChild>
            <Button
              variant={"outline"}
              className='flex w-24 items-center justify-between gap-1.5'
            >
              <div className='flex items-center gap-1.5'>
                <Icon
                  name={layout === "grid" ? "LayoutGrid" : "LayoutList"}
                  size={16}
                />
                <span>{layout === "grid" ? "Grid" : "List"}</span>
              </div>
              <Icon
                name='ChevronDown'
                className={cn("transition", layoutOpen && "rotate-180")}
                size={14}
              />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuItem
              className={cn(
                "gap-1.5",
                layout === "grid" && "bg-primary text-primary-foreground",
              )}
              onClick={() => setLayout("grid")}
            >
              <Icon
                name={layout === "grid" ? "Check" : "LayoutGrid"}
                size={16}
              />
              <span>Grid</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className={cn(
                "gap-1.5",
                layout === "list" && "bg-primary text-primary-foreground",
              )}
              onClick={() => setLayout("list")}
            >
              <Icon
                name={layout === "list" ? "Check" : "LayoutList"}
                size={16}
              />
              <span>List</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Drawer
          open={layoutOpen}
          onOpenChange={setLayoutOpen}
          shouldScaleBackground
        >
          <DrawerTrigger asChild>
            <Button
              size={"icon"}
              variant={"outline"}
            >
              <Icon
                name={layout === "grid" ? "LayoutGrid" : "LayoutList"}
                size={16}
              />
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader className='text-start'>
              <DrawerTitle>Layout</DrawerTitle>
              <DrawerDescription>
                Choose a layout for the files explorer
              </DrawerDescription>
            </DrawerHeader>
            <div className='flex h-full flex-col gap-3 px-4'>
              <DrawerClose asChild>
                <Button
                  variant={"ghost"}
                  className={cn(
                    "justify-start gap-3",
                    layout === "grid" && "bg-primary text-primary-foreground",
                  )}
                  onClick={() => {
                    setLayout("grid");
                    setLayoutOpen(false);
                  }}
                >
                  <Icon
                    name={layout === "grid" ? "Check" : "LayoutGrid"}
                    size={16}
                  />
                  <span>Grid</span>
                </Button>
              </DrawerClose>
              <DrawerClose asChild>
                <Button
                  variant={"ghost"}
                  className={cn(
                    "justify-start gap-3",
                    layout === "list" && "bg-primary text-primary-foreground",
                  )}
                  onClick={() => {
                    setLayout("list");
                    setLayoutOpen(false);
                  }}
                >
                  <Icon
                    name={layout === "list" ? "Check" : "LayoutList"}
                    size={16}
                  />
                  <span>List</span>
                </Button>
              </DrawerClose>
            </div>
            <DrawerFooter>
              <DrawerClose asChild>
                <Button variant={"secondary"}>Close</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      )}
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
                size={16}
              />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Search</DialogTitle>
              <DialogDescription>
                Search for files in your drive
              </DialogDescription>
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
                className='flex h-full max-h-96 flex-grow flex-col gap-1.5 overflow-y-auto'
              >
                {!debouncedSearchInput ? (
                  <div className='flex h-full flex-col items-center justify-center gap-3'>
                    <Icon
                      name='Search'
                      size={24}
                      className='text-muted-foreground'
                    />
                    <span className='text-center text-muted-foreground'>
                      Start typing to search
                    </span>
                  </div>
                ) : searchLoading ? (
                  <div className='flex h-full flex-col items-center justify-center gap-3'>
                    <Icon
                      name='LoaderCircle'
                      size={24}
                      className='animate-spin text-muted-foreground'
                    />
                    <span className='text-center text-muted-foreground'>
                      Searching...
                    </span>
                  </div>
                ) : searchError ? (
                  <div className='flex h-full flex-col items-center justify-center gap-3'>
                    <Icon
                      name='CircleX'
                      size={24}
                      className='text-destructive'
                    />
                    <span className='text-center text-destructive'>
                      {searchError}
                    </span>
                  </div>
                ) : !searchResults.length ? (
                  <div className='flex h-full flex-col items-center justify-center gap-3'>
                    <Icon
                      name='Frown'
                      size={24}
                      className='text-muted-foreground'
                    />
                    <span className='text-center text-muted-foreground'>
                      We couldn&apos;t find any results
                    </span>
                  </div>
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
                size={16}
              />
            </Button>
          </DrawerTrigger>
          <DrawerContent className='h-full max-h-[95%]'>
            <DrawerHeader className='text-start'>
              <DrawerTitle>Search</DrawerTitle>
              <DrawerDescription>
                Search for files in your drive
              </DrawerDescription>
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
                  <div className='flex h-full flex-col items-center justify-center gap-3'>
                    <Icon
                      name='Search'
                      size={32}
                      className='text-muted-foreground'
                    />
                    <span className='text-center text-muted-foreground'>
                      Start typing to search
                    </span>
                  </div>
                ) : searchLoading ? (
                  <div className='flex h-full flex-col items-center justify-center gap-3'>
                    <Icon
                      name='LoaderCircle'
                      size={32}
                      className='animate-spin text-muted-foreground'
                    />
                    <span className='text-center text-muted-foreground'>
                      Searching...
                    </span>
                  </div>
                ) : searchError ? (
                  <div className='flex h-full flex-col items-center justify-center gap-3'>
                    <Icon
                      name='CircleX'
                      size={32}
                      className='text-destructive'
                    />
                    <span className='text-center text-destructive'>
                      {searchError}
                    </span>
                  </div>
                ) : !searchResults.length ? (
                  <div className='flex h-full flex-col items-center justify-center gap-3'>
                    <Icon
                      name='Frown'
                      size={32}
                      className='text-muted-foreground'
                    />
                    <span className='text-center text-muted-foreground'>
                      We couldn&apos;t find any results
                    </span>
                  </div>
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
  const [thumbnailURL, setThumbnailURL] = useState<string>(
    `/api/thumb/${data.encryptedId}?size=2`,
  );
  const router = useRouter();
  return (
    <div
      className={cn(
        "relative",
        // "w-full",
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
          {data.thumbnailLink &&
          (data.mimeType.startsWith("video") ||
            data.mimeType.startsWith("image")) ? (
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
                    size={24}
                  />
                </>
              )}
            </>
          ) : (
            <Icon
              name={
                data.mimeType.includes("folder")
                  ? "Folder"
                  : getPreviewIcon(data.fileExtension || "", data.mimeType)
              }
              className='size-16 flex-shrink-0 flex-grow-0 p-3 tablet:size-20'
            />
          )}
        </div>

        {/* File data */}
        <div className='flex w-full flex-col'>
          <span className='line-clamp-1 whitespace-pre-wrap break-all'>
            {data.fileExtension
              ? data.name.replace(new RegExp(`.${data.fileExtension}$`), "")
              : data.name}
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
                <span className='whitespace-nowrap text-sm'>
                  {bytesToReadable(data.size || 0)}
                </span>
              </>
            )}
          </div>
          <div className='muted flex items-center gap-1'>
            <span className='whitespace-nowrap text-sm'>
              {new Date(data.modifiedTime).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
