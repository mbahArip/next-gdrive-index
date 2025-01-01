"use client";

import DocViewer, { DocRenderer } from "@cyntler/react-doc-viewer";
import { useState } from "react";
import { z } from "zod";

import { Icon, Loader, Status } from "~/components/global";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";

import useLoading from "~/hooks/useLoading";
import { cn } from "~/lib/utils";

import { Schema_File } from "~/types/schema";

import { CreateDownloadToken } from "actions";
import config from "config";

const GoogleDocsViewerRenderer: DocRenderer = ({ mainState: { currentDocument, documentLoading } }) => {
  if (!currentDocument || !currentDocument.uri) return null;

  const viewerUrl = new URL(`/gview`, "https://docs.google.com");
  viewerUrl.searchParams.set("url", currentDocument.uri);
  viewerUrl.searchParams.set("embedded", "true");

  if (documentLoading) {
    return <Loader message='Loading document...' />;
  }

  return (
    <iframe
      src={viewerUrl.toString()}
      className='m-0 h-full max-h-[70dvh] min-h-[70dvh] w-full overflow-hidden rounded-[var(--radius)] border border-border p-0 !text-black'
      frameBorder={0}
    />
  );
};
GoogleDocsViewerRenderer.fileTypes = [
  "application/vnd.google-apps.document",
  "application/vnd.google-apps.presentation",
  "application/vnd.google-apps.spreadsheet",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/csv",
  "application/pdf",
  "application/vnd.oasis.opendocument.text",
];
GoogleDocsViewerRenderer.weight = 100;

type Props = {
  file: z.infer<typeof Schema_File>;
};

export default function PreviewDoc({ file }: Props) {
  const [docSrc, setDocSrc] = useState<string>("");
  const [error, setError] = useState<string>("");

  const loading = useLoading(async () => {
    try {
      if (!file.encryptedWebContentLink) {
        setError("Nothing to preview");
        return;
      }
      const token = await CreateDownloadToken();
      const streamURL = new URL(`/api/stream/${file.encryptedId}`, config.basePath);
      streamURL.searchParams.set("token", token);
      setDocSrc(streamURL.toString());
    } catch (error) {
      const e = error as Error;
      console.error(e);
      setError(e.message);
    }
  }, [file]);

  return (
    <div className='flex h-full min-h-[33dvh] w-full items-center justify-center py-3'>
      {loading ? (
        <Loader message='Loading document...' />
      ) : error ? (
        <Status
          icon='TriangleAlert'
          message={error}
          destructive
        />
      ) : (
        <div className='h-fit w-full space-y-3 overflow-hidden rounded-[var(--radius)]'>
          <Alert className='bg-yellow-50 text-yellow-600 dark:bg-yellow-950 dark:text-yellow-500'>
            <div className='flex items-start gap-4'>
              <Icon
                name='TriangleAlert'
                className='size-5'
              />
              <div className='flex flex-col'>
                <AlertTitle>Preview Only</AlertTitle>
                <AlertDescription>
                  It might failed to load the document, you can try to refresh the page or download the document to view
                  it.
                </AlertDescription>
              </div>
            </div>
          </Alert>

          <DocViewer
            key={file.encryptedId}
            documents={[
              {
                uri: docSrc,
                fileName: file.name,
                fileType: file.mimeType,
              },
            ]}
            pluginRenderers={[GoogleDocsViewerRenderer]}
            config={{
              header: {
                disableHeader: true,
              },
              loadingRenderer: {
                overrideComponent: () => <Loader message='Loading document...' />,
                showLoadingTimeout: 10000,
              },
              noRenderer: {
                overrideComponent: () => (
                  <Status
                    icon='CircleX'
                    message='Failed to load document'
                    destructive
                  />
                ),
              },
            }}
            className={cn(
              "h-full max-h-[70dvh] min-h-[70dvh] w-full overflow-hidden rounded-[var(--radius)] !text-black",
              "rounded-[var(--radius)] [&>div#proxy-renderer]:overflow-hidden ",
            )}
            theme={{
              disableThemeScrollbar: true,
            }}
          />
        </div>
      )}
    </div>
  );
}
