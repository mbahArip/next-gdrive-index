"use client";

import { useState } from "react";

import { Markdown } from "~/components/global";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

import { cn } from "~/lib/utils";

type Props = {
  content: string;
  title: string;
};
export default function FileReadme({ content, title }: Props) {
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
              "flex flex-col gap-4 overflow-hidden",
              "mobile:flex-row mobile:items-center mobile:justify-between",
            )}
          >
            <CardTitle>{title}</CardTitle>
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
        </CardHeader>
        <CardContent className='p-1.5 px-3 pt-0 tablet:p-3 tablet:px-6 tablet:pt-0'>
          <Markdown
            content={content}
            view={view}
          />
        </CardContent>
      </Card>
    </div>
  );
}
