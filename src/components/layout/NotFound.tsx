"use client";

import { Status } from "~/components/global";
import { Button } from "~/components/ui/button";

import useRouter from "~/hooks/usePRouter";

export default function NotFoundClient() {
  const router = useRouter();
  return (
    <div className='mx-auto flex h-full w-full max-w-screen-md flex-grow flex-col items-center justify-center gap-12'>
      <Status
        icon='Frown'
        message="Can't find the file or folder you're looking for"
      />

      <div className='flex w-full items-center gap-2'>
        <Button
          className='grow'
          variant={"outline"}
          onClick={() => router.push("/")}
        >
          Home
        </Button>
        <Button
          className='grow'
          onClick={() => router.back()}
        >
          Previous Page
        </Button>
      </div>
    </div>
  );
}
