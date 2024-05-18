import { Actions, Explorer, FilePath, Readme } from "~/components/Explorer";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";

import { cn } from "~/utils/cn";

import { GetFiles, GetReadme } from "actions";
import config from "config";

export const revalidate = 60;
// export const dynamic = "force-dynamic";

export default async function RootPage() {
  const [data, readme] = await Promise.all([GetFiles({}), GetReadme(undefined)]);

  return (
    <div className={cn("h-fit w-full", "flex flex-col gap-3")}>
      <FilePath data={[]} />

      <section
        slot='content'
        className='w-full'
      >
        <Card>
          <CardHeader className='pb-0'>
            <div className='flex w-full items-center justify-between gap-3'>
              <CardTitle className='flex-grow'>Browse files</CardTitle>
              <Actions />
            </div>
            <Separator />
          </CardHeader>
          <CardContent className='p-1.5 pt-0 tablet:p-3 tablet:pt-0'>
            <Explorer
              encryptedId={config.apiConfig.rootFolder}
              files={data.files}
              nextPageToken={data.nextPageToken}
              root
            />
          </CardContent>
        </Card>
      </section>

      {readme && (
        <Readme
          content={readme}
          title={"README.md"}
        />
      )}
    </div>
  );
}
