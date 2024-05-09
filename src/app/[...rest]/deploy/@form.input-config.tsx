"use client";

import { PropsWithChildren } from "react";
import { ConfigState } from "~/schema";
import { cn } from "~/utils";

import Icon from "~/components/Icon";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";

type Props<T> = {
  key: T extends string ? T : string;
  title: string;
  description?: string;
  required?: boolean;
  action?: {
    label: string;
    onClick: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
    state: ConfigState;
  };
  error?: string;
};
export default function ConfigInput<T>(props: PropsWithChildren<Props<T>>) {
  return (
    <div
      id={props.key}
      slot={`input-${props.key}`}
      className='flex w-full flex-col gap-1.5'
    >
      <div
        slot='label'
        className='flex items-center gap-1.5'
      >
        <Label
          htmlFor={props.key}
          aria-required={props.required}
        >
          {props.title}
        </Label>
        {!props.required && (
          <span className='text-sm text-muted-foreground'>(optional)</span>
        )}
        {props.description && (
          <Tooltip>
            <TooltipTrigger
              onClick={(e) => e.preventDefault()}
              className='cursor-default'
            >
              <Icon
                name='Info'
                size={"1rem"}
                className='text-muted-foreground'
              />
            </TooltipTrigger>
            <TooltipContent
              side='right'
              className='max-w-screen-sm'
            >
              <p className='max-w-screen-sm !whitespace-pre-wrap'>
                {props.description}
              </p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>

      <div
        slot='input'
        className='grid w-full grid-cols-6 gap-1.5'
      >
        <div
          className={cn(
            "w-full",
            props.action ? "col-span-5" : "col-span-full",
          )}
        >
          {props.children}
        </div>
        {props.action && (
          <Button
            variant={"secondary"}
            onClick={props.action.onClick}
            disabled={props.action.state === "loading"}
          >
            <div className='relative flex w-full items-center justify-center'>
              <span className='relative transition-all duration-300 ease-in-out'>
                {props.action.label}
              </span>
              <Icon
                name='LoaderCircle'
                className={cn(
                  "animate-spin transition-all",
                  props.action.state === "loading"
                    ? "ml-1.5 size-4 opacity-100"
                    : "ml-0 size-0 opacity-0",
                )}
              />
            </div>
          </Button>
        )}
      </div>

      <div slot='message'>
        <span
          className={cn(
            "block text-sm text-destructive",
            props.error ? "opacity-100" : "select-none opacity-0",
          )}
        >
          {props.error}
        </span>
      </div>
    </div>
  );
}
