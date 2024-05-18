"use client";

import { Icon } from "~/components/Global";

import { cn } from "~/utils/cn";

type Props = {
  message?: string;
  extra?: React.ReactNode;
};

export default function Loader({ message, extra }: Props) {
  return (
    <div
      className={cn(
        "h-auto min-h-[50dvh] w-full",
        "flex flex-grow flex-col items-center justify-center gap-3",
        "text-foreground",
      )}
    >
      <Icon
        name='LoaderCircle'
        size={"2rem"}
        className='animate-spin'
      />
      <p>{message || "Loading..."}</p>
      {extra}
    </div>
  );
}
