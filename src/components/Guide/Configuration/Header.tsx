"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button, LoadingButton } from "~/components/ui/button";

type Props = {
  title: string;
  onLoad?: () => void;
};
export default function ConfigurationHeader({ title, onLoad }: Props) {
  const [isLoading, setLoading] = useState<boolean>(false);

  return (
    <div
      slot='header'
      className='flex flex-col gap-4 tablet:flex-row tablet:items-center tablet:justify-between'
    >
      <h4>{title}</h4>

      <div
        slot='actions'
        className='flex w-full items-center gap-4 tablet:w-fit'
      >
        {onLoad && (
          <LoadingButton
            variant={"outline"}
            size={"sm"}
            loading={isLoading}
            onClick={(e) => {
              e.preventDefault();
              setLoading(true);

              try {
                onLoad();
              } catch (error) {
                const e = error as Error;
                console.error(e.message);
                toast.error(e.message);
              } finally {
                setLoading(false);
              }
            }}
          >
            Load File
          </LoadingButton>
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
