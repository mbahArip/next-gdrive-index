"use client";

import { PopoverTrigger } from "@radix-ui/react-popover";
import { HslColor, HslColorPicker } from "react-colorful";
import { toast } from "sonner";
import { z } from "zod";

import { Icon } from "~/components/global";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Popover, PopoverContent } from "~/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/ui/tooltip";

import { Schema_Theme } from "~/types/schema";

export type ThemeInputProps = {
  inputKey: keyof z.infer<typeof Schema_Theme>;
  title: string;
  description?: string;
  value: HslColor;
  onChange: (color: HslColor) => void;
  children?: React.ReactNode;
};
export default function ThemeInput(props: ThemeInputProps) {
  return (
    <div
      id={props.inputKey}
      slot={`input-${props.inputKey}`}
      className='grid w-full grid-cols-3 gap-6'
    >
      <div
        slot='label'
        className='flex items-center gap-4'
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
              <p className='max-w-screen-sm !whitespace-pre-wrap'>{props.description}</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>

      <div
        slot='input'
        className='col-span-2 flex flex-grow items-center justify-end gap-4'
      >
        {props.children ? (
          props.children
        ) : (
          <>
            <span className='select-none text-sm text-muted-foreground'>
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
              <PopoverContent className='flex flex-col gap-4'>
                <div className='flex gap-6'>
                  <HslColorPicker
                    color={props.value}
                    onChange={props.onChange}
                  />
                  <div className='flex flex-grow flex-col items-center justify-between'>
                    <div className='flex flex-col gap-2'>
                      <Label htmlFor={`${props.inputKey}-h`}>Hue</Label>
                      <Input
                        id={`${props.inputKey}-h`}
                        name={`${props.inputKey}-h`}
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
                    <div className='flex flex-col gap-2'>
                      <Label htmlFor={`${props.inputKey}-s`}>Saturation</Label>
                      <Input
                        id={`${props.inputKey}-s`}
                        name={`${props.inputKey}-s`}
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
                    <div className='flex flex-col gap-2'>
                      <Label htmlFor={`${props.inputKey}-l`}>Lightness</Label>
                      <Input
                        id={`${props.inputKey}-l`}
                        name={`${props.inputKey}-l`}
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
                </div>
                <div className='flex w-full items-center gap-4'>
                  <Button
                    className='w-full'
                    size={"sm"}
                    variant={"outline"}
                    onClick={async (e) => {
                      e.preventDefault();
                      try {
                        const text = `hsl(${props.value.h}, ${props.value.s}%, ${props.value.l}%)`;
                        await navigator.clipboard.writeText(text);
                        toast.success(`${props.title} color copied!`);
                      } catch (error) {
                        const e = error as Error;
                        console.error(e);
                        toast.error(e.message);
                      }
                    }}
                  >
                    Copy
                  </Button>
                  <Button
                    className='w-full'
                    size={"sm"}
                    variant={"outline"}
                    onClick={async (e) => {
                      e.preventDefault();
                      try {
                        const text = await navigator.clipboard.readText();
                        const color = text.match(
                          /\bhsl\(\s*(\d+)\s*,\s*(\d+(?:\.\d+)?)\s*%\s*,\s*(\d+(?:\.\d+)?)\s*%\s*\)/,
                        );
                        if (!color) {
                          throw new Error("Color does not match the format!");
                        }
                        const h = Number(color[1]);
                        const s = Number(color[2]);
                        const l = Number(color[3]);
                        if (isNaN(h) || isNaN(s) || isNaN(l)) {
                          throw new Error("HSL values are not numbers!");
                        }
                        props.onChange({ h, s, l });
                        toast.success(`Color pasted!`);
                      } catch (error) {
                        const e = error as Error;
                        console.error(e);
                        toast.error(e.message);
                      }
                    }}
                  >
                    Paste
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </>
        )}
      </div>
    </div>
  );
}
