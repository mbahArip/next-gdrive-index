"use client";

import { icons } from "lucide-react";

import { Icon } from "~/components/global";
import { Button, ButtonProps } from "~/components/ui/button";

import { cn } from "~/lib/utils";

import { ButtonState } from "~/types/schema";

type Props = {
  state?: ButtonState;
  icon?: keyof typeof icons;
} & ButtonProps;

export default function ButtonLoading({ state = "idle", icon, ...props }: Props) {
  return (
    <Button
      {...props}
      disabled={state === "loading"}
    >
      <div className='relative flex w-full items-center justify-center'>
        {icon && (
          <Icon
            name={icon}
            size={"1rem"}
            className={cn(
              "mr-1.5 transition-all duration-300 ease-in-out",
              state === "loading" ? "size-0 opacity-0" : "size-4 opacity-100",
            )}
          />
        )}
        <Icon
          name='LoaderCircle'
          size={"1rem"}
          className={cn(
            "animate-spin transition-all",
            state === "loading" ? "mr-1.5 size-4 opacity-100" : "mr-0 size-0 opacity-0",
          )}
        />
        <span className='relative transition-all duration-300 ease-in-out'>{props.children}</span>
      </div>
    </Button>
  );
}
