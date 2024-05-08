"use client";

import DocViewer, { DocRenderer } from "@cyntler/react-doc-viewer";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Schema_File } from "~/schema";
import { cn } from "~/utils";

import Icon from "~/components/Icon";

import config from "~/config/gIndex.config";

import { CreateDownloadToken } from "./actions";

const GoogleDocsViewerRenderer: DocRenderer = ({
  mainState: { currentDocument },
}) => {
  if (!currentDocument || !currentDocument.uri) return null;

  const viewerUrl = new URL(`/gview`, "https://docs.google.com");
  viewerUrl.searchParams.set("url", currentDocument.uri);
  viewerUrl.searchParams.set("embedded", "true");

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
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    (async () => {
      try {
        if (!file.encryptedWebContentLink) {
          setError("Nothing to preview");
          return;
        }
        const token = await CreateDownloadToken();
        const streamURL = new URL(
          `/api/stream/${file.encryptedId}`,
          config.basePath,
        );
        streamURL.searchParams.set("token", token);
        setDocSrc(streamURL.toString());
      } catch (error) {
        const e = error as Error;
        console.error(e);
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [file]);

  return (
    <div className='flex h-full min-h-[33dvh] w-full items-center justify-center py-3'>
      {loading ? (
        <div
          className={cn(
            "h-auto min-h-[50dvh] w-full",
            "flex flex-grow flex-col items-center justify-center gap-3",
          )}
        >
          <Icon
            name='LoaderCircle'
            size={32}
            className='animate-spin text-foreground'
          />
          <p>Loading document...</p>
        </div>
      ) : error ? (
        <div className='flex h-full flex-col items-center justify-center gap-3'>
          <Icon
            name='CircleX'
            size={24}
            className='text-destructive'
          />
          <span className='text-center text-destructive'>{error}</span>
        </div>
      ) : (
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
              overrideComponent: () => (
                <div
                  className={cn(
                    "h-auto min-h-[50dvh] w-full",
                    "flex flex-grow flex-col items-center justify-center gap-3",
                  )}
                >
                  <Icon
                    name='LoaderCircle'
                    size={32}
                    className='animate-spin text-foreground'
                  />
                  <p>Loading document...</p>
                </div>
              ),
              showLoadingTimeout: 10000,
            },
            noRenderer: {
              overrideComponent: () => (
                <div className='flex h-full flex-col items-center justify-center gap-3'>
                  <Icon
                    name='CircleX'
                    size={24}
                    className='text-destructive'
                  />
                  <span className='text-center text-destructive'>
                    Error loading document
                  </span>
                </div>
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
      )}
    </div>
  );
}
