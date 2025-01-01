"use client";

import { useState } from "react";
import { z } from "zod";

import { Icon, Loader, Markdown, Status } from "~/components/global";
import { Button } from "~/components/ui/button";

import useLoading from "~/hooks/useLoading";
import { cn } from "~/lib/utils";

import { Schema_File } from "~/types/schema";

import { GetContent } from "actions";

type Props = {
  file: z.infer<typeof Schema_File>;
  view: "markdown" | "raw";
  code?: boolean;
};
export default function PreviewRich({ file, code, view }: Props) {
  const [content, setContent] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [expand, setExpand] = useState<boolean>(false);

  const loading = useLoading(async () => {
    try {
      const text = await GetContent(file.encryptedId);
      if (!text) {
        setError("Looks like there is no content to preview");
        return;
      }
      setContent(text.trim());
    } catch (error) {
      const e = error as Error;
      console.error(e);
      setError(e.message);
    }
  }, [file]);

  return (
    <div className='flex h-fit min-h-[33dvh] w-full items-center justify-center py-3'>
      {loading ? (
        <Loader message='Loading content...' />
      ) : error ? (
        <Status
          icon='TriangleAlert'
          message={error}
          destructive
        />
      ) : (
        <div className={cn("relative w-full overflow-hidden", expand ? "h-full" : "max-h-[50dvh]")}>
          <div
            className={cn(
              "w-full overflow-hidden",
              expand
                ? "[mask-image:linear-gradient(180deg,white_65%,white] h-full"
                : "h-[50dvh] max-h-[50dvh] [mask-image:linear-gradient(180deg,white_65%,rgba(255,255,255,0))]",
            )}
          >
            <Markdown
              content={code && view === "markdown" ? `\`\`\`${file.fileExtension}\n${content}` : content}
              view={view}
            />
          </div>
          <div
            className={cn(
              "bottom-0 z-10 flex w-full items-center justify-center py-3 transition",
              expand ? "relative" : "absolute",
            )}
          >
            <Button
              size={"sm"}
              variant={"secondary"}
              className='gap-2'
              onClick={() => {
                setExpand((prev) => !prev);
              }}
            >
              <Icon
                name={expand ? "ChevronUp" : "ChevronDown"}
                size={16}
              />
              {expand ? "Collapse" : "Expand"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
