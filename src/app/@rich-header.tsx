"use client";

import { Button } from "~/components/ui/button";
import { CardHeader, CardTitle } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";

type Props = {
  title: string;
  view: "markdown" | "raw";
  onViewChange: (value: "markdown" | "raw") => void;
};
export default function RichHeader({ title, view, onViewChange }: Props) {
  return (
    <CardHeader className='pb-0'>
      <div className='flex flex-col gap-3 mobile:flex-row mobile:items-center mobile:justify-between'>
        <CardTitle>{title}</CardTitle>
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
      </div>
      <Separator />
    </CardHeader>
  );
}
