"use client";

import Icon from "~/components/ui/icon";

import { cn } from "~/lib/utils";

type Props = {
  message?: string;
  extra?: React.ReactNode;
};

export default function PageLoader({ message, extra }: Props) {
  return (
    <div
      className={cn(
        "h-auto min-h-[50dvh] w-full",
        "flex flex-grow flex-col items-center justify-center gap-2",
        "text-foreground",
      )}
    >
      <Icon
        name='LoaderCircle'
        className='size-10 animate-spin stroke-primary'
      />
      <div className='flex flex-col items-center justify-center'>
        <p>{message ?? "Loading..."}</p>
        {extra}
      </div>
    </div>
  );
}
