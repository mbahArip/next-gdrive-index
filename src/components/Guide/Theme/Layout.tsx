"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { z } from "zod";
import { generateTheme } from "~/data/template";

import { ButtonLoading, Icon, Loader, Markdown } from "~/components/Global";
import { FormInputs, ThemePreview } from "~/components/Guide/Theme";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Textarea } from "~/components/ui/textarea";

import useLoading from "~/hooks/useLoading";
import { downloadBlob } from "~/utils/downloadBlob";
import { fileLoadHelper } from "~/utils/fileLoadHelper";
import { parseThemeValue } from "~/utils/parseConfigFile";

import { ButtonState, Schema_Theme, ThemeKeys } from "~/types/schema";

export default function ThemeForm() {
  const loading = useLoading();

  const initialTheme = useMemo<Record<"light" | "dark", z.input<typeof Schema_Theme>>>(
    () => ({
      light: {
        "background": "0 0% 100%",
        "foreground": "0 0% 3.9%",
        "card": "0 0% 100%",
        "card-foreground": "0 0% 3.9%",
        "popover": "0 0% 100%",
        "popover-foreground": "0 0% 3.9%",
        "primary": "0 0% 9%",
        "primary-foreground": "0 0% 98%",
        "secondary": "0 0% 96.1%",
        "secondary-foreground": "0 0% 9%",
        "muted": "0 0% 96.1%",
        "muted-foreground": "0 0% 45.1%",
        "accent": "0 0% 96.1%",
        "accent-foreground": "0 0% 9%",
        "destructive": "0 84.2% 60.2%",
        "destructive-foreground": "0 0% 98%",
        "border": "0 0% 89.8%",
        "input": "0 0% 89.8%",
        "ring": "0 0% 89.8%",
        "radius": "0.5rem",
      },
      dark: {
        "background": "0 0% 3.9%",
        "foreground": "0 0% 98%",
        "card": "0 0% 3.9%",
        "card-foreground": "0 0% 98%",
        "popover": "0 0% 3.9%",
        "popover-foreground": "0 0% 98%",
        "primary": "0 0% 98%",
        "primary-foreground": "0 0% 9%",
        "secondary": "0 0% 14.9%",
        "secondary-foreground": "0 0% 98%",
        "muted": "0 0% 14.9%",
        "muted-foreground": "0 0% 63.9%",
        "accent": "0 0% 14.9%",
        "accent-foreground": "0 0% 98%",
        "destructive": "0 62.8% 30.6%",
        "destructive-foreground": "0 0% 98%",
        "border": "0 0% 14.9%",
        "input": "0 0% 14.9%",
        "ring": "0 0% 14.9%",
        "radius": "0.5rem",
      },
    }),
    [],
  );
  const [currentTheme, setCurrentTheme] = useState<"light" | "dark">("light");
  const [theme, setTheme] = useState<Record<"light" | "dark", z.input<typeof Schema_Theme>>>(initialTheme);

  const [codeValue, setCodeValue] = useState<string>("");
  const [pasteDialog, setPasteDialog] = useState<boolean>(false);
  const [pasteState, setPasteState] = useState<ButtonState>("idle");

  const [downloadState, setDownloadState] = useState<ButtonState>("idle");
  const [resetState, setResetState] = useState<ButtonState>("idle");

  function assignTheme(theme: "light" | "dark", values: string[]) {
    for (const value of values) {
      const [k, v] = value.split(":").map((v) => v.replace("--", "").trim());
      if (k === "radius") {
        onThemeChange(theme, k as ThemeKeys, v.replace(";", ""));
      } else {
        const color = parseThemeValue(v);
        if (!color) continue;
        onThemeChange(theme, k as ThemeKeys, `${color.h} ${color.s}% ${color.l}%`);
      }
    }
  }
  function onLoadCSS() {
    fileLoadHelper({
      accept: ".css",
      async onLoad(result) {
        const themeRegex = /\/\* Shadcn\/ui theme \*\/.*?\:root \{(.*?)\}.*?.dark \{(.*?) \}/gm;
        const themeMatch = themeRegex.exec(result.replace(/\r?\n?/g, ""));
        if (!themeMatch) return toast.error("Can't find theme, are you sure it's the right file?");

        const light = themeMatch[1]
          .replace(/\s{2,4}/g, "\n")
          .split("\n")
          .map((v) => v.trim())
          .filter((v) => v.length && (v.startsWith("/*") && v.endsWith("*/") ? false : true));
        const dark = themeMatch[2]
          .replace(/\s{2,4}/g, "\n")
          .split("\n")
          .map((v) => v.trim())
          .filter((v) => v.length && (v.startsWith("/*") && v.endsWith("*/") ? false : true));

        if (!light || !dark)
          return toast.error("File loaded doesn't seem like shadcn theme, are you sure it's the right file?");

        assignTheme("light", light);
        assignTheme("dark", dark);

        toast.success("Theme loaded successfully");
      },
    });
  }
  function onLoadCode(value: string) {
    const themeRegex = /\@layer base.*?\:root \{(.*?)\}.*?.dark \{(.*?) \}/gm;
    const themeMatch = themeRegex.exec(value.replace(/\r\n/g, ""));
    if (!themeMatch) throw new Error("Unknown format, make sure it's satisfies the shadcn/ui theme format");

    const light = themeMatch[1]
      .replace(/\s{2,4}/g, "\n")
      .split("\n")
      .map((v) => v.trim())
      .filter((v) => v.length && (v.startsWith("/*") && v.endsWith("*/") ? false : true));
    const dark = themeMatch[2]
      .replace(/\s{2,4}/g, "\n")
      .split("\n")
      .map((v) => v.trim())
      .filter((v) => v.length && (v.startsWith("/*") && v.endsWith("*/") ? false : true));

    if (!light || !dark) throw new Error("It doesn't seem like shadcn theme, are you sure it's the right format?");

    assignTheme("light", light);
    assignTheme("dark", dark);

    toast.success("Theme loaded successfully");
  }
  function onThemeChange(theme: "light" | "dark", key: ThemeKeys, value: string) {
    setTheme((prev) => ({
      ...prev,
      [theme]: {
        ...prev[theme],
        [key]: value,
      },
    }));
  }

  async function onDownload(copy?: boolean) {
    setDownloadState("loading");
    try {
      const generated = generateTheme(theme);
      if (copy) {
        await navigator.clipboard.writeText(generated);
        return toast.success("Theme copied to clipboard");
      }

      const blob = new Blob([generated], { type: "text/css" });
      downloadBlob(blob, "globals.css");
      toast.success("Theme downloaded successfully");
    } catch (error) {
      const e = error as Error;
      console.error(e);
      toast.error(e.message);
    } finally {
      setDownloadState("idle");
    }
  }
  async function onReset() {
    setResetState("loading");
    try {
      setTheme(initialTheme);
      toast.success("Theme reset to default");
    } catch (error) {
      const e = error as Error;
      console.error(e);
      toast.error(e.message);
    } finally {
      setResetState("idle");
    }
  }

  if (loading)
    return (
      <Card>
        <CardContent>
          <Loader message='Loading theme...' />
        </CardContent>
      </Card>
    );

  return (
    <>
      <Card>
        <CardHeader className='pb-0'>
          <div className='flex items-center justify-between gap-3'>
            <CardTitle id='theme'>Theme Customization</CardTitle>
            <div
              slot='actions'
              className='flex w-full items-center gap-3 tablet:w-fit'
            >
              <Dialog
                open={pasteDialog}
                onOpenChange={setPasteDialog}
              >
                <DialogTrigger>
                  <></>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Paste CSS Code</DialogTitle>
                    <DialogDescription>
                      Paste the CSS code from your theme file
                      <br />
                      <Link
                        href={"https://ui.shadcn.com/themes"}
                        target='_blank'
                        className='text-blue-600 opacity-80 transition-all duration-300 hover:opacity-100 dark:text-blue-400'
                      >
                        Get themes from shadcn/ui
                      </Link>
                    </DialogDescription>
                  </DialogHeader>

                  <form
                    className='space-y-3'
                    onSubmit={(e) => {
                      e.preventDefault();
                      setPasteState("loading");

                      try {
                        if (!codeValue) throw new Error("No CSS code provided");

                        const flatten = codeValue.replace(/\r\n/g, "");
                        onLoadCode(flatten);
                        setPasteDialog(false);
                      } catch (error) {
                        const e = error as Error;
                        console.error(e);
                        toast.error(e.message);
                      } finally {
                        setPasteState("idle");
                      }
                    }}
                  >
                    <Textarea
                      id='css-paste'
                      name='css-paste'
                      className='w-full'
                      rows={10}
                      placeholder='Paste your CSS code here'
                      value={codeValue}
                      onChange={(e) => setCodeValue(e.target.value)}
                    />

                    <DialogFooter>
                      <DialogClose asChild>
                        <Button
                          size={"sm"}
                          variant={"destructive"}
                          type='reset'
                        >
                          Cancel
                        </Button>
                      </DialogClose>
                      <ButtonLoading
                        state={pasteState}
                        size={"sm"}
                        type='submit'
                        icon='Save'
                      >
                        Load Theme
                      </ButtonLoading>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant={"outline"}
                    size={"sm"}
                  >
                    <Icon
                      name='Import'
                      size={"1rem"}
                      className='mr-2'
                    />
                    Import Theme
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={onLoadCSS}>
                    <Icon
                      name='Upload'
                      size={"1rem"}
                      className='mr-2'
                    />
                    Load from file
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={async () => {
                      // setPasteDialog(true);
                      const themeRegex = /\@layer base \{\s+\:root \{\s+.*\}  \.dark \{\s+.*\}/gm;
                      const clipboard = await navigator.clipboard.readText();
                      if (clipboard) {
                        const flattenClipboard = clipboard.replace(/\r\n/g, "").trim();
                        const match = themeRegex.exec(flattenClipboard);
                        if (match) {
                          setCodeValue(clipboard.trim());
                          toast.success("Theme found in clipboard! Click 'Load Theme' to apply it");
                        }
                      }

                      setPasteDialog(true);
                    }}
                  >
                    <Icon
                      name='Code'
                      size={"1rem"}
                      className='mr-2'
                    />
                    Paste CSS code
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>

        <CardContent className='space-y-3 py-3'>
          <Markdown
            content={`You can personalize the theme of your index by changing the color of the elements.
You can either use default colors from [shadcn/ui](https://ui.shadcn.com/themes) or create your own theme by changing the color code of each element.`}
          />

          <div className='flex w-full items-center justify-between gap-3'>
            <div className='flex items-center'>
              <Button
                size={"sm"}
                variant={currentTheme === "light" ? "default" : "outline"}
                className='rounded-r-none'
                onClick={() => setCurrentTheme("light")}
              >
                <Icon
                  name='Sun'
                  size='1rem'
                  className='mr-2'
                />
                Light theme
              </Button>
              <Button
                size={"sm"}
                variant={currentTheme === "dark" ? "default" : "outline"}
                className='rounded-l-none'
                onClick={() => setCurrentTheme("dark")}
              >
                <Icon
                  name='Moon'
                  size='1rem'
                  className='mr-2'
                />
                Dark theme
              </Button>
            </div>

            <div className='flex items-center gap-3'>
              <ButtonLoading
                size={"sm"}
                state={downloadState}
                icon={"Save"}
                onClick={() => onDownload()}
              >
                Download theme
              </ButtonLoading>
              <ButtonLoading
                size={"sm"}
                state={resetState}
                variant={"destructive"}
                icon='History'
                onClick={onReset}
              >
                Reset theme
              </ButtonLoading>
            </div>
          </div>
          <div className='grid grid-cols-1 gap-3 rounded-[var(--radius)] border border-border p-4 tablet:grid-cols-2'>
            <FormInputs
              currentTheme={currentTheme}
              state={{
                get: theme,
                set: onThemeChange,
              }}
            />
            <ThemePreview theme={theme[currentTheme]} />
          </div>
        </CardContent>
      </Card>
    </>
  );
}
