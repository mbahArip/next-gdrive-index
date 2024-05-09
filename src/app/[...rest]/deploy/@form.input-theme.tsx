"use client";

import { PopoverTrigger } from "@radix-ui/react-popover";
import React, { PropsWithChildren } from "react";
import { HslColor, HslColorPicker } from "react-colorful";
import { z } from "zod";
import { Schema_Theme } from "~/schema";

import Icon from "~/components/Icon";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Popover, PopoverContent } from "~/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";

type Props = {
  key: keyof z.infer<typeof Schema_Theme>;
  title: string;
  description?: string;
  value: HslColor;
  onChange: (color: HslColor) => void;
  children?: React.ReactNode;
};
export default function ThemeInput(props: PropsWithChildren<Props>) {
  // const [value, setValue] = useState<HslColor>(props.value);
  // const [debouncedValue, setDebouncedValue] = useState<HslColor>(props.value);

  // useEffect(() => {
  //   setValue(props.value);

  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [props.value]);

  // useEffect(() => {
  //   const timeout = setTimeout(() => {
  //     setDebouncedValue(value);
  //   }, 250);
  //   return () => clearTimeout(timeout);

  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [value]);

  // useEffect(() => {
  //   props.onChange(debouncedValue);

  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [debouncedValue]);

  return (
    <div
      id={props.key}
      slot={`input-${props.key}`}
      // className='flex w-full items-center justify-between gap-6'
      className='grid w-full grid-cols-3 gap-6'
    >
      <div
        slot='label'
        className='flex items-center gap-3'
      >
        <span className='text-base'>{props.title}</span>
        {props.description && (
          <Tooltip>
            <TooltipTrigger
              onClick={(e) => e.preventDefault()}
              className='cursor-default'
            >
              <Icon
                name='Info'
                size='1rem'
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
        className='col-span-2 flex flex-grow items-center justify-end gap-3'
      >
        {props.children ? (
          props.children
        ) : (
          <>
            <span className='flex-grow text-sm text-muted-foreground'>
              hsl({props.value.h}, {props.value.s}%, {props.value.l}%)
            </span>
            <Popover>
              <PopoverTrigger>
                <div className='size-8 rounded-[var(--radius)] border border-border p-0.5'>
                  <div
                    className='size-full rounded-[calc(var(--radius)-0.125rem)]'
                    style={{
                      background: `hsl(${props.value.h}, ${props.value.s}%, ${props.value.l}%)`,
                    }}
                  />
                </div>
              </PopoverTrigger>
              <PopoverContent className='flex gap-6'>
                <HslColorPicker
                  color={props.value}
                  onChange={props.onChange}
                />
                <div className='flex flex-grow flex-col items-center justify-between'>
                  <div className='flex flex-col gap-1.5'>
                    <Label htmlFor={`${props.key}-h`}>Hue</Label>
                    <Input
                      id={`${props.key}-h`}
                      name={`${props.key}-h`}
                      type='number'
                      value={props.value.h}
                      min={0}
                      max={360}
                      onChange={(e) => {
                        const value = props.value;
                        props.onChange({
                          h: Number(e.target.value),
                          s: value.s,
                          l: value.l,
                        });
                      }}
                    />
                  </div>
                  <div className='flex flex-col gap-1.5'>
                    <Label htmlFor={`${props.key}-s`}>Saturation</Label>
                    <Input
                      id={`${props.key}-s`}
                      name={`${props.key}-s`}
                      type='number'
                      value={props.value.s}
                      min={0}
                      max={100}
                      onChange={(e) => {
                        const value = props.value;
                        props.onChange({
                          h: value.h,
                          s: Number(e.target.value),
                          l: value.l,
                        });
                      }}
                    />
                  </div>
                  <div className='flex flex-col gap-1.5'>
                    <Label htmlFor={`${props.key}-l`}>Lightness</Label>
                    <Input
                      id={`${props.key}-l`}
                      name={`${props.key}-l`}
                      type='number'
                      value={props.value.l}
                      min={0}
                      max={100}
                      onChange={(e) => {
                        const value = props.value;
                        props.onChange({
                          h: value.h,
                          s: value.s,
                          l: Number(e.target.value),
                        });
                      }}
                    />
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </>
        )}
      </div>
    </div>
  );
}
