"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { cn } from "~/utils";

import Icon from "~/components/Icon";
import { Button } from "~/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div
      className={cn(
        "mx-auto h-full w-full max-w-md",
        "flex flex-grow flex-col items-center justify-center gap-3",
      )}
    >
      <Icon
        name='CircleX'
        size={32}
        className='text-destructive'
      />
      <div className='flex flex-col'>
        <span className='text-center text-destructive'>
          Something went wrong
        </span>
        <span className='text-center text-sm text-destructive'>
          More details can be found in the console
        </span>
      </div>
      <code className='w-full whitespace-pre-wrap rounded-[var(--radius)] bg-muted px-3 py-1.5 text-sm text-muted-foreground'>
        {error.message}
      </code>

      <div className='flex w-full flex-col items-center gap-3 pt-8'>
        <Button
          className='w-full'
          onClick={() => reset()}
        >
          Try again
        </Button>
        <Button
          variant={"outline"}
          className='w-full'
          onClick={() => router.back()}
        >
          Back to previous page
        </Button>
      </div>
    </div>
  );
}
