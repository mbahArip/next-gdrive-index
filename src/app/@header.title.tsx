"use client";

import { PropsWithChildren } from "react";
import { Skeleton } from "~/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";

export default function HeaderTitle({
  children,
  loading,
}: PropsWithChildren<{ loading?: boolean }>) {
  if (loading) return <Skeleton className='my-0.5 h-8 w-full' />;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <h2 className='line-clamp-1'>{children}</h2>
      </TooltipTrigger>
      <TooltipContent>{children}</TooltipContent>
    </Tooltip>
  );
}
