"use client";

import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Schema_File } from "~/schema";
import { cn } from "~/utils";

import Icon from "~/components/Icon";

import { CreateDownloadToken } from "./actions";

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
        setDocSrc(`/api/download/${file.encryptedId}?token=${token}`);
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
            },
          ]}
          pluginRenderers={DocViewerRenderers}
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
            "h-full max-h-[70dvh] min-h-[70dvh] w-full rounded-[var(--radius)] border border-border !text-black",
          )}
          theme={{
            disableThemeScrollbar: true,
          }}
        />
      )}
    </div>
  );
}
