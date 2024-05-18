"use client";

import { Status } from "~/components/Global";
import { Button } from "~/components/ui/button";

import { cn } from "~/utils/cn";

import useRouter from "~/hooks/usePRouter";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className={cn("mx-auto h-full w-full max-w-md", "flex flex-grow flex-col items-center justify-center gap-12")}>
      <Status
        icon='Frown'
        message='The file you are looking for does not exist'
      />

      <div className={cn("w-full", "flex flex-col items-center gap-3")}>
        <Button
          className='w-full'
          onClick={() => router.push("/")}
        >
          Back to Home
        </Button>
        <Button
          variant={"outline"}
          className='w-full'
          onClick={() => router.back()}
        >
          Back to Previous Page
        </Button>
      </div>
    </div>
  );
}
