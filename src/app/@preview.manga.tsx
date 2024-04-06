"use client";

import JSZip from "jszip";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Schema_File } from "~/schema";
import { cn } from "~/utils";

import Icon from "~/components/Icon";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "~/components/ui/carousel";

import useMediaQuery from "~/hooks/useMediaQuery";

import { CreateDownloadToken } from "./actions";

type Props = {
  file: z.infer<typeof Schema_File>;
};

export default function PreviewManga({ file }: Props) {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [images, setImages] = useState<{ name: string; blob: string }[]>([]);
  const [currentImage, setCurrentImage] = useState<number>(1);
  const [viewSize, setViewSize] = useState<"fit" | "full">("fit");
  const [api, setApi] = useState<CarouselApi>();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  useEffect(() => {
    (async () => {
      try {
        if (!file.encryptedWebContentLink) {
          setError("No video to preview");
          return;
        }
        const token = await CreateDownloadToken();
        const manga = await fetch(
          `/api/download/${file.encryptedId}?token=${token}`,
        );
        const archiveBlob = await manga.blob();
        const zipData = await JSZip.loadAsync(archiveBlob);

        const tempArray: { name: string; blob: string }[] = [];
        const files = Object.values(zipData.files);
        for (const file of files) {
          const f = zipData.file(file.name);
          if (!f) continue;
          const blob = await f.async("blob");
          const reader = new FileReader();
          reader.onload = () => {
            setImages((prev) => {
              const exist = prev.find((p) => p.name === file.name);
              if (exist) return prev;
              return [
                ...prev,
                { name: file.name, blob: reader.result as string },
              ];
            });
          };
          reader.readAsDataURL(blob);
        }
      } catch (error) {
        const e = error as Error;
        console.error(e);
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [file]);

  useEffect(() => {
    if (!api) return;

    api.on("select", (embla, e) => {
      const index = embla.selectedScrollSnap();
      setCurrentImage(index + 1);
    });
  }, [api]);

  return (
    <div className='flex h-full min-h-[33dvh] w-full items-center justify-center py-3'>
      {loading ? (
        <div
          className={cn(
            "h-auto min-h-[50dvh] w-full",
            "flex flex-grow flex-col items-center justify-center gap-3",
          )}
        >
          <Icon
            name='LoaderCircle'
            size={32}
            className='animate-spin text-foreground'
          />
          <p>Loading manga content...</p>
        </div>
      ) : error ? (
        <div className='flex h-full flex-col items-center justify-center gap-3'>
          <Icon
            name='CircleX'
            size={24}
            className='text-destructive'
          />
          <span className='text-center text-destructive'>{error}</span>
        </div>
      ) : (
        <div className='flex flex-col gap-3'>
          <div className='h-full w-full tablet:px-8'>
            <Carousel
              className={cn(
                "w-full",
                viewSize === "fit" ? "h-full max-h-[70dvh]" : "h-full",
              )}
              opts={{
                loop: false,
              }}
              setApi={setApi}
            >
              <CarouselContent className='h-full w-full'>
                {images.map((image, index) => (
                  <CarouselItem
                    key={index}
                    className='flex h-full flex-col items-center justify-center'
                  >
                    <img
                      src={image.blob}
                      alt={`${image.name} - Page ${index + 1}`}
                      className={cn(
                        "w-full object-contain",
                        viewSize === "fit" ? "h-full max-h-[70dvh]" : "h-full",
                      )}
                    />
                    <span className='muted text-center text-xs'>
                      {image.name}
                    </span>
                  </CarouselItem>
                ))}
              </CarouselContent>
              {isDesktop ? (
                <>
                  <CarouselPrevious />
                  <CarouselNext />
                </>
              ) : null}
            </Carousel>
          </div>
          <div className='flex w-full items-center justify-end gap-1.5'>
            <span className='muted text-sm'>
              {currentImage}/{images.length}
            </span>
            <div
              className='relative z-10 cursor-pointer p-0.5 text-foreground/80 transition hover:text-foreground'
              onClick={() => setViewSize(viewSize === "fit" ? "full" : "fit")}
            >
              <Icon
                name={viewSize === "fit" ? "Maximize" : "Minimize"}
                size={14}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
