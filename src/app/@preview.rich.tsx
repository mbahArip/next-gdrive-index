"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import { Schema_File } from "~/schema";
import { cn } from "~/utils";

import Icon from "~/components/Icon";
import { Button } from "~/components/ui/button";

import Markdown from "./@markdown";
import { GetContent } from "./actions";

type Props = {
  file: z.infer<typeof Schema_File>;
  view: "markdown" | "raw";
  code?: boolean;
};
export default function PreviewRich({ file, code, view }: Props) {
  const [fetchedContent, setFetchedContent] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const [expand, setExpand] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      try {
        const text = await GetContent(file.encryptedId);
        if (!text) {
          setError("Looks like there is no content to preview");
          return;
        }
        // setFetchedContent(text);
        // if (code) {
        //   setContent(`\`\`\`${file.fileExtension}\n${text}\`\`\``);
        // } else {
        setContent(text);
        // }
      } catch (error) {
        const e = error as Error;
        console.error(e);
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [file, code]);

  return (
    <div className='flex h-fit min-h-[33dvh] w-full items-center justify-center py-3'>
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
          <p>Loading content...</p>
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
        <div
          className={cn(
            "relative w-full overflow-hidden",
            expand ? "h-full" : "max-h-[50dvh]",
          )}
        >
          <div
            className={cn(
              "w-full overflow-hidden",
              expand
                ? "[mask-image:linear-gradient(180deg,white_65%,white] h-full"
                : "h-[50dvh] max-h-[50dvh] [mask-image:linear-gradient(180deg,white_65%,rgba(255,255,255,0))]",
            )}
          >
            <Markdown
              content={
                code && view === "markdown"
                  ? `\`\`\`${file.fileExtension}\n${content}\`\`\``
                  : content
              }
              view={view}
            />
          </div>
          <div
            className={cn(
              "absolute bottom-0 z-10 flex w-full items-center justify-center py-3 transition",
              expand
                ? "pointer-events-none opacity-0"
                : "pointer-events-auto opacity-100",
            )}
          >
            <Button
              size={"sm"}
              onClick={() => {
                setExpand(true);
              }}
            >
              <Icon
                name='ChevronDown'
                size={16}
              />
              Expand
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
