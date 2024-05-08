"use client";

import { Button } from "~/components/ui/button";
import { CardHeader } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";

import { getFileType } from "~/utils/previewHelper";

type Props = {
  title: string;
  view: "markdown" | "raw";
  onViewChange: (value: "markdown" | "raw") => void;
  fileType: ReturnType<typeof getFileType> | "unknown";
};
export default function RichHeader({
  title,
  view,
  onViewChange,
  fileType,
}: Props) {
  return (
    <CardHeader className='pb-0'>
      <div className='flex flex-col gap-3 overflow-hidden mobile:flex-row mobile:items-center mobile:justify-between'>
        {/* <CardTitle> */}
        <h3 className='line-clamp-1 flex-grow whitespace-pre-wrap break-all'>
          {title}
        </h3>
        {/* </CardTitle> */}
        {["markdown", "code", "text"].includes(fileType) && (
          <div className='flex w-full items-center mobile:w-fit'>
            <Button
              size={"sm"}
              variant={view === "markdown" ? "default" : "secondary"}
              onClick={() => onViewChange("markdown")}
              className='w-full rounded-r-none mobile:w-fit'
            >
              Markdown
            </Button>
            <Button
              size={"sm"}
              variant={view === "raw" ? "default" : "secondary"}
              onClick={() => onViewChange("raw")}
              className='w-full rounded-l-none mobile:w-fit'
            >
              Raw
            </Button>
          </div>
        )}
      </div>
      <Separator />
    </CardHeader>
  );
}
