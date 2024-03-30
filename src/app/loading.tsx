"use client";

import Icon from "~/components/Icon";
import { cn } from "~/utils";

export default function RootLoading() {
  return (
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
      <p>Loading data...</p>
    </div>
  );
}
