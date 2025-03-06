"use client";

import Link from "next/link";
import { Fragment, useEffect, useMemo, useState } from "react";
import { type z } from "zod";

import { useResponsive } from "~/context/responsiveContext";
import useLoading from "~/hooks/useLoading";
import { getPreviewIcon } from "~/lib/previewHelper";
import { cn } from "~/lib/utils";

import { type Schema_File } from "~/types/schema";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../ui/carousel";
import Icon from "../ui/icon";
import { Skeleton } from "../ui/skeleton";

type MediaPlaylistLayoutProps = {
  type?: "separated" | "inside";
  paths: string[];
  currentItem: z.infer<typeof Schema_File>;
  playlist: z.infer<typeof Schema_File>[];
};

export default function MediaPlaylistLayout({
  type = "separated",
  paths,
  currentItem,
  playlist,
}: MediaPlaylistLayoutProps) {
  const loading = useLoading();
  const { isDesktop } = useResponsive();

  const [api, setApi] = useState<CarouselApi>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [totalIndex, setTotalIndex] = useState(0);

  const uniquePlaylist = useMemo<z.infer<typeof Schema_File>[]>(
    () => playlist.filter((item) => `${item.name}#${item.size}` !== `${currentItem.name}#${currentItem.size}`),
    [currentItem, playlist],
  );

  useEffect(() => {
    if (!api) return;

    setTotalIndex(api.scrollSnapList().length);
    setCurrentIndex(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrentIndex(api.selectedScrollSnap());
    });
  }, [api]);

  if (!uniquePlaylist.length) return null;
  if (type === "separated")
    return (
      <Card>
        <CardHeader>
          <CardTitle>Playlist</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className='grid w-full place-items-center'>
              <div className='mx-auto inline-flex w-full items-center gap-4 tablet:w-[calc(100%-4rem)]'>
                <Skeleton className='aspect-video w-full basis-1/2 tablet:basis-1/3' />
                <Skeleton className='aspect-video w-full basis-1/2 tablet:basis-1/3' />
                {isDesktop && <Skeleton className='aspect-video w-full basis-1/2 tablet:basis-1/3' />}
              </div>
            </div>
          ) : (
            <Carousel
              className='mx-auto h-full w-full'
              opts={{
                loop: true,
                startIndex: (playlist.findIndex((item) => item.encryptedId === currentItem.encryptedId) ?? 0) + 1,
                containScroll: "keepSnaps",
              }}
            >
              <CarouselContent className='h-full pb-2'>
                {playlist.map((item) => {
                  const isCurrent = `${item.name}#${item.size}` === `${currentItem.name}#${currentItem.size}`;
                  const itemUrl = paths.slice(0, paths.length - 1).join("/") + `/${encodeURIComponent(item.name)}`;
                  const Wrapper = ({ children }: { children: React.ReactNode }) =>
                    isCurrent ? <Fragment>{children}</Fragment> : <Link href={itemUrl}>{children}</Link>;

                  return (
                    <CarouselItem
                      key={item.encryptedId}
                      className='basis-1/2 tablet:basis-1/3'
                    >
                      <Wrapper>
                        <div
                          className={cn(
                            "relative flex flex-col rounded-lg border transition",
                            isCurrent ? "border-primary opacity-100" : "opacity-70 hover:opacity-80",
                          )}
                        >
                          {isCurrent && <Badge className='absolute right-2 top-2'>Playing</Badge>}
                          {item.mimeType.includes("video") ? (
                            <img
                              src={`/api/thumb/${item.encryptedId}`}
                              alt={`Preview of ${item.name}`}
                              className='aspect-video w-full rounded-lg bg-black object-contain'
                            />
                          ) : (
                            <div className='grid aspect-video w-full place-items-center rounded-lg bg-black'>
                              <Icon
                                name={getPreviewIcon(item.fileExtension ?? "", item.mimeType)}
                                className='size-6'
                              />
                            </div>
                          )}
                          <div className='w-full p-2'>
                            <p
                              className='line-clamp-1 break-all'
                              title={item.name}
                            >
                              {item.name}
                            </p>
                          </div>
                        </div>
                      </Wrapper>
                    </CarouselItem>
                  );
                })}
              </CarouselContent>
              <CarouselPrevious className='-left-4 hidden tablet:flex' />
              <CarouselNext className='-right-4 hidden tablet:flex' />
            </Carousel>
          )}
        </CardContent>
      </Card>
    );
  if (type === "inside")
    return (
      <Accordion
        type='single'
        collapsible
        className={"w-full"}
        defaultValue={"playlist"}
      >
        <AccordionItem
          value='playlist'
          className={"w-full"}
        >
          <AccordionTrigger>
            <div className={"inline-flex w-full items-center gap-2 "}>
              <Icon name='List' />
              Playlist
            </div>
          </AccordionTrigger>
          <AccordionContent>
            {loading ? (
              <div className={"grid w-full grid-cols-3 gap-4 rounded-lg tablet:grid-cols-4 tablet:items-center"}>
                <Skeleton className='aspect-video w-full basis-1/3 tablet:basis-1/4' />
                <Skeleton className='aspect-video w-full basis-1/3 tablet:basis-1/4' />
                <Skeleton className='aspect-video w-full basis-1/3 tablet:basis-1/4' />
                <Skeleton className='hidden aspect-video w-full basis-1/3 tablet:block tablet:basis-1/4' />
              </div>
            ) : (
              <div className='grid w-full grid-cols-3 gap-4 rounded-lg pb-8 tablet:grid-cols-4 tablet:items-center'>
                {/* Current media */}
                <Item
                  item={currentItem}
                  isCurrent
                  className={"shrink-0 grow-0 basis-1/3 tablet:basis-1/4"}
                />

                {/* Playlist */}
                <Carousel
                  className={"relative col-span-2 tablet:col-span-3"}
                  setApi={setApi}
                  opts={{
                    dragFree: true,
                  }}
                >
                  <CarouselContent className={"py-1"}>
                    {uniquePlaylist.map((item) => {
                      const itemUrl = paths.slice(0, paths.length - 1).join("/") + `/${encodeURIComponent(item.name)}`;

                      return (
                        <CarouselItem
                          key={item.encryptedId}
                          className='basis-1/2 tablet:basis-1/3'
                        >
                          <Link href={`/${itemUrl}`}>
                            <Item
                              item={item}
                              isCurrent={false}
                            />
                          </Link>
                        </CarouselItem>
                      );
                    })}
                  </CarouselContent>
                  <div className={"absolute -bottom-8 right-0 inline-flex w-full items-center justify-between"}>
                    <div className={"inline-flex items-center gap-1"}>
                      {Array.from({
                        length: totalIndex,
                      }).map((_, index) => (
                        <div
                          key={`indicator-${index}`}
                          className={cn(
                            "size-2 rounded-full",
                            index === currentIndex ? "bg-primary" : "bg-muted-foreground",
                          )}
                        />
                      ))}
                    </div>

                    <div className={"relative inline-flex items-center gap-1"}>
                      <Button
                        variant={"outline"}
                        size='icon'
                        className={"size-6 rounded-full p-0"}
                        disabled={!api?.canScrollPrev()}
                        onClick={() => api?.scrollPrev()}
                      >
                        <Icon name='ChevronLeft' />
                      </Button>

                      <Button
                        variant={"outline"}
                        size='icon'
                        className={"size-6 rounded-full p-0"}
                        disabled={!api?.canScrollNext()}
                        onClick={() => api?.scrollNext()}
                      >
                        <Icon name='ChevronRight' />
                      </Button>
                    </div>
                  </div>
                </Carousel>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    );

  return <></>;
}

type ItemProps = {
  item: z.infer<typeof Schema_File>;
  isCurrent: boolean;
  className?: string;
};
function Item({ item, isCurrent, className }: ItemProps) {
  return (
    <div
      className={cn(
        "relative flex flex-col rounded-lg border transition",
        isCurrent ? "border-primary opacity-100" : "opacity-70 hover:opacity-80",
        className,
      )}
    >
      {isCurrent && <Badge className='absolute right-2 top-2'>Playing</Badge>}
      {item.mimeType.includes("video") ? (
        <img
          src={`/api/thumb/${item.encryptedId}`}
          alt={`Preview of ${item.name}`}
          className='aspect-video w-full rounded-lg bg-black object-contain'
        />
      ) : (
        <div className='grid aspect-video w-full place-items-center rounded-lg bg-black'>
          <Icon
            name={getPreviewIcon(item.fileExtension ?? "", item.mimeType)}
            className='size-6'
          />
        </div>
      )}
      <div className='w-full p-2'>
        <p
          className='line-clamp-1 break-all'
          title={item.name}
        >
          {item.name}
        </p>
      </div>
    </div>
  );
}
