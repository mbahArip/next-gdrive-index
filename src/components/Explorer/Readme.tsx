"use client";

import { useState } from "react";

import { Markdown } from "~/components/Global";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";

import { cn } from "~/utils/cn";

type Props = {
  content: string;
  title: string;
};
export default function Readme({ content, title }: Props) {
  const [view, setView] = useState<"markdown" | "raw">("markdown");

  return (
    <div
      slot='readme'
      className='w-full'
    >
      <Card>
        <CardHeader className='pb-0'>
          <div
            className={cn(
              "flex flex-col gap-3 overflow-hidden",
              "mobile:flex-row mobile:items-center mobile:justify-between",
            )}
          >
            <h3 className='line-clamp-1 flex-grow whitespace-pre-wrap break-all'>{title}</h3>
            <div className='flex w-full items-center mobile:w-fit'>
              <Button
                size={"sm"}
                variant={view === "markdown" ? "default" : "outline"}
                onClick={() => setView("markdown")}
                className='w-full rounded-r-none mobile:w-fit'
              >
                Markdown
              </Button>
              <Button
                size={"sm"}
                variant={view === "raw" ? "default" : "outline"}
                onClick={() => setView("raw")}
                className='w-full rounded-l-none mobile:w-fit'
              >
                Raw
              </Button>
            </div>
          </div>
          <Separator />
        </CardHeader>
        <CardContent className='p-1.5 pt-0 tablet:p-3 tablet:pt-0'>
          <Markdown
            content={content}
            view={view}
          />
        </CardContent>
      </Card>
    </div>
  );
}
