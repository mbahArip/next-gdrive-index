"use client";

import { cn } from "~/utils";

import Icon from "~/components/Icon";
import { Button } from "~/components/ui/button";

import useRouter from "~/hooks/usePRouter";

export default function NotFoundComponent() {
  const router = useRouter();
  return (
    <div
      className={cn(
        "mx-auto h-full w-full max-w-md",
        "flex flex-grow flex-col items-center justify-center gap-3",
      )}
    >
      <Icon
        name='Frown'
        size={32}
        className='text-muted-foreground'
      />
      <span className='text-center text-muted-foreground'>
        The file you are looking for does not exist
      </span>

      <div className='flex w-full flex-col items-center gap-3 pt-8'>
        <Button
          className='w-full'
          onClick={() => router.push("/")}
        >
          Back to home
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
