import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { cn } from "~/utils";

import FileBrowser from "./@explorer";
import Header from "./@header";
import Markdown from "./@markdown";
import { GetFiles, GetReadme } from "./actions";

export const revalidate = 3600;

export default async function RootPage() {
  const [data, readme] = await Promise.all([
    GetFiles({}),
    GetReadme(undefined),
  ]);

  return (
    <div className={cn("h-fit w-full", "flex flex-col gap-3")}>
      <Header name='Root' />
      <div
        slot='content'
        className='w-full'
      >
        <Card>
          <CardHeader className='pb-0'>
            <CardTitle>Browse files</CardTitle>
            <Separator />
          </CardHeader>
          <CardContent className='p-1.5 pt-0 tablet:p-3 tablet:pt-0'>
            <FileBrowser
              files={data.files}
              nextPageToken={data.nextPageToken}
            />
          </CardContent>
        </Card>
      </div>
      {readme && (
        <div
          slot='readme'
          className='w-full'
        >
          <Card>
            <CardHeader className='pb-0'>
              <CardTitle>README.md</CardTitle>
              <Separator />
            </CardHeader>
            <CardContent className='p-1.5 pt-0 tablet:p-3 tablet:pt-0'>
              <Markdown content={readme} />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
