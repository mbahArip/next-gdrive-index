import { Fragment } from "react";
import { z } from "zod";

import { ThemeInput, type ThemeInputProps } from "~/components/Guide/Theme";
import { Input } from "~/components/ui/input";
import { Separator } from "~/components/ui/separator";
import { Slider } from "~/components/ui/slider";

import { parseThemeValue } from "~/utils/parseConfigFile";

import { Schema_Theme, ThemeKeys } from "~/types/schema";

type Props = {
  currentTheme: "light" | "dark";
  state: {
    get: {
      light: z.input<typeof Schema_Theme>;
      dark: z.input<typeof Schema_Theme>;
    };
    set: (theme: "light" | "dark", key: ThemeKeys, value: string) => void;
  };
};
export default function ThemeFormInputs({ currentTheme, state: { get, set } }: Props) {
  const inputs: ThemeInputProps[][] = [
    [
      {
        inputKey: "background",
        title: "Background",
        value: parseThemeValue(get[currentTheme].background),
        onChange: (val) => set(currentTheme, "background", `${val.h} ${val.s} ${val.l}`),
      },
      {
        inputKey: "foreground",
        title: "Text",
        value: parseThemeValue(get[currentTheme].foreground),
        onChange: (val) => set(currentTheme, "foreground", `${val.h} ${val.s} ${val.l}`),
      },
    ],
    [
      {
        inputKey: "card",
        title: "Card",
        value: parseThemeValue(get[currentTheme].card),
        onChange: (val) => set(currentTheme, "card", `${val.h} ${val.s} ${val.l}`),
      },
      {
        inputKey: "card-foreground",
        title: "Card Text",
        value: parseThemeValue(get[currentTheme]["card-foreground"]),
        onChange: (val) => set(currentTheme, "card-foreground", `${val.h} ${val.s} ${val.l}`),
      },
      {
        inputKey: "popover",
        title: "Popover",
        value: parseThemeValue(get[currentTheme].popover),
        onChange: (val) => set(currentTheme, "popover", `${val.h} ${val.s} ${val.l}`),
      },
      {
        inputKey: "popover-foreground",
        title: "Popover Text",
        value: parseThemeValue(get[currentTheme]["popover-foreground"]),
        onChange: (val) => set(currentTheme, "popover-foreground", `${val.h} ${val.s} ${val.l}`),
      },
      {
        inputKey: "accent",
        title: "Accent",
        value: parseThemeValue(get[currentTheme].accent),
        onChange: (val) => set(currentTheme, "accent", `${val.h} ${val.s} ${val.l}`),
      },
      {
        inputKey: "accent-foreground",
        title: "Accent Text",
        value: parseThemeValue(get[currentTheme]["accent-foreground"]),
        onChange: (val) => set(currentTheme, "accent-foreground", `${val.h} ${val.s} ${val.l}`),
      },
    ],
    [
      {
        inputKey: "primary",
        title: "Primary",
        value: parseThemeValue(get[currentTheme].primary),
        onChange: (val) => set(currentTheme, "primary", `${val.h} ${val.s} ${val.l}`),
      },
      {
        inputKey: "primary-foreground",
        title: "Primary Text",
        value: parseThemeValue(get[currentTheme]["primary-foreground"]),
        onChange: (val) => set(currentTheme, "primary-foreground", `${val.h} ${val.s} ${val.l}`),
      },
      {
        inputKey: "secondary",
        title: "Secondary",
        value: parseThemeValue(get[currentTheme].secondary),
        onChange: (val) => set(currentTheme, "secondary", `${val.h} ${val.s} ${val.l}`),
      },
      {
        inputKey: "secondary-foreground",
        title: "Secondary Text",
        value: parseThemeValue(get[currentTheme]["secondary-foreground"]),
        onChange: (val) => set(currentTheme, "secondary-foreground", `${val.h} ${val.s} ${val.l}`),
      },
      {
        inputKey: "muted",
        title: "Muted",
        value: parseThemeValue(get[currentTheme].muted),
        onChange: (val) => set(currentTheme, "muted", `${val.h} ${val.s} ${val.l}`),
      },
      {
        inputKey: "muted-foreground",
        title: "Muted Text",
        value: parseThemeValue(get[currentTheme]["muted-foreground"]),
        onChange: (val) => set(currentTheme, "muted-foreground", `${val.h} ${val.s} ${val.l}`),
      },
      {
        inputKey: "destructive",
        title: "Destructive",
        value: parseThemeValue(get[currentTheme].destructive),
        onChange: (val) => set(currentTheme, "destructive", `${val.h} ${val.s} ${val.l}`),
      },
      {
        inputKey: "destructive-foreground",
        title: "Destructive Text",
        value: parseThemeValue(get[currentTheme]["destructive-foreground"]),
        onChange: (val) => set(currentTheme, "destructive-foreground", `${val.h} ${val.s} ${val.l}`),
      },
    ],
    [
      {
        inputKey: "border",
        title: "Element Border",
        value: parseThemeValue(get[currentTheme].border),
        onChange: (val) => set(currentTheme, "border", `${val.h} ${val.s} ${val.l}`),
      },
      {
        inputKey: "input",
        title: "Input Border",
        value: parseThemeValue(get[currentTheme].input),
        onChange: (val) => set(currentTheme, "input", `${val.h} ${val.s} ${val.l}`),
      },
      {
        inputKey: "ring",
        title: "Focus Ring",
        value: parseThemeValue(get[currentTheme].ring),
        onChange: (val) => set(currentTheme, "ring", `${val.h} ${val.s} ${val.l}`),
      },
      {
        inputKey: "radius",
        title: "Roundness",
        value: { h: 0, s: 0, l: 0 },
        onChange: (val) => {},
        children: (
          <div className='flex w-full items-center gap-4'>
            <Slider
              className='w-full'
              defaultValue={[parseFloat(get[currentTheme].radius) * 16 || 0]}
              min={0}
              max={24}
              value={[parseFloat(get[currentTheme].radius) * 16 || 0]}
              onValueChange={(val) => {
                const value = val[0] / 16;
                set(currentTheme, "radius", `${value}rem`);
              }}
            />
            <Input
              value={parseFloat(get[currentTheme].radius) * 16 || 0}
              onChange={(e) => {
                const value = parseFloat(e.currentTarget.value) / 16;
                set(currentTheme, "radius", `${value}rem`);
              }}
              type='number'
              className='w-16 min-w-0 '
              min={0}
              max={24}
            />
          </div>
        ),
      },
    ],
  ];

  return (
    <div className='flex h-auto flex-grow flex-col justify-between gap-4'>
      <div
        slot='theme-form'
        className='flex flex-col gap-2'
      >
        {inputs.map((item, i) => (
          <Fragment key={`input-group-${i}`}>
            {item.map((input) => (
              <ThemeInput
                key={input.inputKey}
                {...input}
              />
            ))}
            {i !== inputs.length - 1 && <Separator className='my-1.5' />}
          </Fragment>
        ))}
      </div>
    </div>
  );
}
