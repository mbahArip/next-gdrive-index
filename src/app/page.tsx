import { GetReadme, ListFiles } from "~/actions/files";
import { cn } from "~/lib/utils";

import { FileActions, FileBreadcrumb, FileExplorerLayout, FileReadme } from "~/components/explorer";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

import config from "config";

import ErrorComponent from "./error";

export const revalidate = 60;

export default async function RootPage() {
  const [data, readme] = await Promise.all([ListFiles(), GetReadme()]);
  if (!data.success) return <ErrorComponent error={new Error(data.error)} />;
  if (!readme.success) return <ErrorComponent error={new Error(readme.error)} />;

  return (
    <div className={cn("h-fit w-full", "flex flex-col gap-4")}>
      <FileBreadcrumb />

      <section
        slot='content'
        className='w-full'
      >
        <Card>
          <CardHeader className='pb-0'>
            <div className='flex w-full items-center justify-between gap-4'>
              <CardTitle className='flex-grow'>Browse files</CardTitle>
              <FileActions />
            </div>
          </CardHeader>

          <CardContent className='p-2 pt-0 tablet:p-4 tablet:pt-0'>
            <FileExplorerLayout
              encryptedId={config.apiConfig.rootFolder}
              files={data.data.files}
              nextPageToken={data.data.nextPageToken ?? undefined}
            />
          </CardContent>
        </Card>
      </section>

      {readme.data && (
        <FileReadme
          content={readme.data.content}
          title={`README.${readme.data.type === "markdown" ? "md" : "txt"}`}
        />
      )}
    </div>
  );
}
