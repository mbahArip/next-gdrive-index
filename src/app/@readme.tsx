"use client";

import { useState } from "react";

import { Card, CardContent } from "~/components/ui/card";

import Markdown from "./@markdown";
import RichHeader from "./@rich-header";

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
        <RichHeader
          title={title}
          view={view}
          onViewChange={setView}
        />
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
