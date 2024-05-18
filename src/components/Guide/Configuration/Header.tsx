"use client";

import { useState } from "react";
import toast from "react-hot-toast";

import { ButtonLoading } from "~/components/Global";
import { Button } from "~/components/ui/button";

import { ButtonState } from "~/types/schema";

type Props = {
  title: string;
  onLoad?: () => void;
};
export default function ConfigurationHeader({ title, onLoad }: Props) {
  const [loadState, setLoadState] = useState<ButtonState>("idle");

  return (
    <div
      slot='header'
      className='flex flex-col gap-3 tablet:flex-row tablet:items-center tablet:justify-between'
    >
      <h4>{title}</h4>

      <div
        slot='actions'
        className='flex w-full items-center gap-3 tablet:w-fit'
      >
        {onLoad && (
          <ButtonLoading
            variant={"outline"}
            size={"sm"}
            state={loadState}
            onClick={(e) => {
              e.preventDefault();
              setLoadState("loading");

              try {
                onLoad();
              } catch (error) {
                const e = error as Error;
                console.error(e.message);
                toast.error(e.message);
              } finally {
                setLoadState("idle");
              }
            }}
          >
            Load File
          </ButtonLoading>
        )}
        <Button
          variant={"destructive"}
          type='reset'
          size={"sm"}
        >
          Reset Section
        </Button>
      </div>
    </div>
  );
}
