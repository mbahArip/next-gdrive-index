"use client";

import { useEffect, useState } from "react";
import { cn } from "~/utils";

import Icon from "~/components/Icon";

export default function PreviewUnknown() {
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  return (
    <div className='flex min-h-[33dvh] w-full items-center justify-center py-3'>
      {loading ? (
        <div
          className={cn(
            "h-auto min-h-[33dvh] w-full",
            "flex flex-grow flex-col items-center justify-center gap-3",
          )}
        >
          <Icon
            name='LoaderCircle'
            size={32}
            className='animate-spin text-foreground'
          />
          <p>Loading content...</p>
        </div>
      ) : (
        <div
          className={cn(
            "h-auto min-h-[33dvh] w-full",
            "flex flex-grow flex-col items-center justify-center gap-3",
          )}
        >
          <Icon
            name='Frown'
            size={32}
            className='text-muted-foreground'
          />
          <h4 className='text-muted-foreground'>Preview not available</h4>
          <p className='text-center text-muted-foreground tablet:text-sm'>
            This file type is not supported for preview, try downloading the
            file instead.
          </p>
        </div>
      )}
    </div>
  );
}
