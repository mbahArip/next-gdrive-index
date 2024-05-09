"use client";

import { z } from "zod";
import { Schema_Theme, ThemeKeys } from "~/schema";

import { Input } from "~/components/ui/input";
import { Separator } from "~/components/ui/separator";
import { Slider } from "~/components/ui/slider";

import { parseThemeValue } from "~/utils/parseConfigFile";

import ThemeInput from "./@form.input-theme";

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
export default function ThemeForm({
  currentTheme,
  state: { get, set },
}: Props) {
  return (
    <div className='flex flex-col gap-1.5'>
      <ThemeInput
        key='background'
        title='Background'
        value={parseThemeValue(get[currentTheme].background)}
        onChange={(val) => {
          set(currentTheme, "background", `${val.h} ${val.s} ${val.l}`);
        }}
      />
      <ThemeInput
        key='foreground'
        title='Text'
        value={parseThemeValue(get[currentTheme].foreground)}
        onChange={(val) => {
          set(currentTheme, "foreground", `${val.h} ${val.s} ${val.l}`);
        }}
      />

      <Separator className='my-1.5' />

      <ThemeInput
        key='card'
        title='Card'
        value={parseThemeValue(get[currentTheme].card)}
        onChange={(val) => {
          set(currentTheme, "card", `${val.h} ${val.s} ${val.l}`);
        }}
      />
      <ThemeInput
        key='card-foreground'
        title='Card Text'
        value={parseThemeValue(get[currentTheme]["card-foreground"])}
        onChange={(val) => {
          set(currentTheme, "card-foreground", `${val.h} ${val.s} ${val.l}`);
        }}
      />

      <ThemeInput
        key='popover'
        title='Popover'
        value={parseThemeValue(get[currentTheme].popover)}
        onChange={(val) => {
          set(currentTheme, "popover", `${val.h} ${val.s} ${val.l}`);
        }}
      />
      <ThemeInput
        key='popover-foreground'
        title='Popover Text'
        value={parseThemeValue(get[currentTheme]["popover-foreground"])}
        onChange={(val) => {
          set(currentTheme, "popover-foreground", `${val.h} ${val.s} ${val.l}`);
        }}
      />

      <Separator className='my-1.5' />

      <ThemeInput
        key='primary'
        title='Primary'
        value={parseThemeValue(get[currentTheme].primary)}
        onChange={(val) => {
          set(currentTheme, "primary", `${val.h} ${val.s} ${val.l}`);
        }}
      />
      <ThemeInput
        key='primary-foreground'
        title='Primary Text'
        value={parseThemeValue(get[currentTheme]["primary-foreground"])}
        onChange={(val) => {
          set(currentTheme, "primary-foreground", `${val.h} ${val.s} ${val.l}`);
        }}
      />
      <ThemeInput
        key='secondary'
        title='Secondary'
        value={parseThemeValue(get[currentTheme].secondary)}
        onChange={(val) => {
          set(currentTheme, "secondary", `${val.h} ${val.s} ${val.l}`);
        }}
      />
      <ThemeInput
        key='secondary-foreground'
        title='Secondary Text'
        value={parseThemeValue(get[currentTheme]["secondary-foreground"])}
        onChange={(val) => {
          set(
            currentTheme,
            "secondary-foreground",
            `${val.h} ${val.s} ${val.l}`,
          );
        }}
      />
      <ThemeInput
        key='accent'
        title='Accent'
        value={parseThemeValue(get[currentTheme].accent)}
        onChange={(val) => {
          set(currentTheme, "accent", `${val.h} ${val.s} ${val.l}`);
        }}
      />
      <ThemeInput
        key='accent-foreground'
        title='Accent Text'
        value={parseThemeValue(get[currentTheme]["accent-foreground"])}
        onChange={(val) => {
          set(currentTheme, "accent-foreground", `${val.h} ${val.s} ${val.l}`);
        }}
      />
      <ThemeInput
        key='muted'
        title='Muted'
        value={parseThemeValue(get[currentTheme].muted)}
        onChange={(val) => {
          set(currentTheme, "muted", `${val.h} ${val.s} ${val.l}`);
        }}
      />
      <ThemeInput
        key='muted-foreground'
        title='Muted Text'
        value={parseThemeValue(get[currentTheme]["muted-foreground"])}
        onChange={(val) => {
          set(currentTheme, "muted-foreground", `${val.h} ${val.s} ${val.l}`);
        }}
      />
      <ThemeInput
        key='destructive'
        title='Destructive'
        value={parseThemeValue(get[currentTheme].destructive)}
        onChange={(val) => {
          set(currentTheme, "destructive", `${val.h} ${val.s} ${val.l}`);
        }}
      />
      <ThemeInput
        key='destructive-foreground'
        title='Destructive Text'
        value={parseThemeValue(get[currentTheme]["destructive-foreground"])}
        onChange={(val) => {
          set(
            currentTheme,
            "destructive-foreground",
            `${val.h} ${val.s} ${val.l}`,
          );
        }}
      />

      <Separator className='my-1.5' />

      <ThemeInput
        key='border'
        title='Element Border'
        value={parseThemeValue(get[currentTheme].border)}
        onChange={(val) => {
          set(currentTheme, "border", `${val.h} ${val.s} ${val.l}`);
        }}
      />
      <ThemeInput
        key='input'
        title='Input Border'
        value={parseThemeValue(get[currentTheme].input)}
        onChange={(val) => {
          set(currentTheme, "input", `${val.h} ${val.s} ${val.l}`);
        }}
      />
      <ThemeInput
        key='ring'
        title='Focus Ring'
        value={parseThemeValue(get[currentTheme].ring)}
        onChange={(val) => {
          set(currentTheme, "ring", `${val.h} ${val.s} ${val.l}`);
        }}
      />
      <ThemeInput
        key='radius'
        title='Roundness'
        value={{ h: 0, s: 0, l: 0 }}
        onChange={(val) => {}}
      >
        <div className='flex w-full items-center gap-3'>
          <Slider
            className='w-full'
            defaultValue={[parseFloat(get[currentTheme].radius) * 16 || 0]}
            min={0}
            max={24}
            value={[parseFloat(get[currentTheme].radius) * 16 || 0]}
            onValueChange={(val) => {
              const value = val[0] / 16;
              set("light", "radius", `${value}rem`);
              set("dark", "radius", `${value}rem`);
            }}
          />
          <Input
            value={parseFloat(get[currentTheme].radius) * 16 || 0}
            onChange={(e) => {
              const value = parseFloat(e.currentTarget.value) / 16;
              set("light", "radius", `${value}rem`);
              set("dark", "radius", `${value}rem`);
            }}
            type='number'
            className='w-16 min-w-0 '
            min={0}
            max={24}
          />
        </div>
      </ThemeInput>
    </div>
  );
}
