"use client";

import { PopoverTrigger } from "@radix-ui/react-popover";
import NextTopLoader from "nextjs-toploader";
import nProgress from "nprogress";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { z } from "zod";

import { Grid as FileGrid, List as FileList } from "~/components/Explorer";
import { ButtonLoading } from "~/components/Global";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "~/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "~/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Input } from "~/components/ui/input";
import { Popover, PopoverContent } from "~/components/ui/popover";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "~/components/ui/sheet";
import { Textarea } from "~/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/ui/tooltip";

import { cn } from "~/utils/cn";

import { ButtonState, Schema_File, Schema_Theme } from "~/types/schema";

type Props = {
  theme: z.input<typeof Schema_Theme>;
};
export default function ThemePreview({ theme }: Props) {
  const fileMockData = useMemo<z.infer<typeof Schema_File>>(
    () => ({
      encryptedId: "1",
      name: "File Name",
      modifiedTime: "2021-09-01T00:00:00.000Z",
      mimeType: "text/plain",
      trashed: false,
      size: 1024 * 1024 * 100,
    }),
    [],
  );
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);
  const [toastState, setToastState] = useState<ButtonState>("idle");
  const [loadingState, setLoadingState] = useState<ButtonState>("idle");

  return (
    <div
      slot='container'
      className='overflow-hidden rounded-[var(--radius)] border border-border'
    >
      <div
        slot='preview'
        ref={setPortalContainer}
        className='preview flex flex-col gap-3 bg-background p-3 text-foreground'
        style={
          {
            "--background": theme.background,
            "--foreground": theme.foreground,
            "--card": theme.card,
            "--card-foreground": theme["card-foreground"],
            "--popover": theme.popover,
            "--popover-foreground": theme["popover-foreground"],
            "--primary": theme.primary,
            "--primary-foreground": theme["primary-foreground"],
            "--secondary": theme.secondary,
            "--secondary-foreground": theme["secondary-foreground"],
            "--muted": theme.muted,
            "--muted-foreground": theme["muted-foreground"],
            "--accent": theme.accent,
            "--accent-foreground": theme["accent-foreground"],
            "--destructive": theme.destructive,
            "--destructive-foreground": theme["destructive-foreground"],
            "--border": theme.border,
            "--input": theme.input,
            "--ring": theme.ring,
            "--radius": theme.radius,
          } as React.CSSProperties
        }
      >
        <Wrapper
          title='Button'
          extra={`Primary, Secondary, Accent, Destructive, Input Border`}
          className='grid grid-cols-3 gap-1.5'
        >
          {["default", "secondary", "destructive", "outline", "ghost", "link"].map((btn) => (
            <Button
              key={btn}
              size={"sm"}
              variant={btn as any}
              onClick={(e) => e.preventDefault()}
              className='capitalize'
            >
              {btn}
            </Button>
          ))}
        </Wrapper>

        <Wrapper
          title='Input'
          extra={`Muted, Input Border`}
          className='space-y-1.5'
        >
          <Input placeholder='Input' />
          <Textarea placeholder='Textarea' />
        </Wrapper>

        <Wrapper
          title='Popover'
          extra={`Popover, Element Border`}
          className='grid grid-cols-3 gap-1.5'
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size={"sm"}
                variant={"outline"}
                className='w-full'
              >
                Hover me
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Hello</p>
            </TooltipContent>
          </Tooltip>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                size={"sm"}
                variant={"outline"}
                className='w-full'
              >
                Click me
              </Button>
            </PopoverTrigger>
            <PopoverContent portal={portalContainer}>
              <p>Hello</p>
            </PopoverContent>
          </Popover>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size={"sm"}
                variant={"outline"}
                className='w-full'
              >
                Dropdown
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent portal={portalContainer}>
              <DropdownMenuItem>Item 1</DropdownMenuItem>
              <DropdownMenuItem>Item 2</DropdownMenuItem>
              <DropdownMenuItem disabled>Item 3</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </Wrapper>

        <Wrapper
          title='Overlay'
          extra={`Background, Primary, Muted, Element Border`}
          className='grid grid-cols-3 gap-1.5'
        >
          <Dialog>
            <DialogTrigger asChild>
              <Button
                size='sm'
                variant='outline'
                className='w-full'
              >
                Open Dialog
              </Button>
            </DialogTrigger>
            <DialogContent portal={portalContainer}>Dialog Content</DialogContent>
          </Dialog>

          <Drawer>
            <DrawerTrigger asChild>
              <Button
                size='sm'
                variant='outline'
                className='w-full'
              >
                Open Drawer
              </Button>
            </DrawerTrigger>
            <DrawerContent portal={portalContainer}>
              <DrawerHeader>
                <DrawerTitle>Drawer Title</DrawerTitle>
                <DrawerDescription>Description</DrawerDescription>
              </DrawerHeader>
              <div className='p-6'>Drawer only used for mobile devices</div>
            </DrawerContent>
          </Drawer>

          <Sheet>
            <SheetTrigger asChild>
              <Button
                size='sm'
                variant='outline'
                className='w-full'
              >
                Open Sheet
              </Button>
            </SheetTrigger>
            <SheetContent portal={portalContainer}>
              <SheetHeader>
                <SheetTitle>Sheet Title</SheetTitle>
                <SheetDescription>Description</SheetDescription>
              </SheetHeader>
              <div>Sheet only used for mobile devices</div>
            </SheetContent>
          </Sheet>

          <ButtonLoading
            size='sm'
            variant='outline'
            className='w-full'
            state={toastState}
            onClick={async (e) => {
              e.preventDefault();
              setToastState("loading");
              const style = {
                background: `hsl(${theme.background})`,
                color: `hsl(${theme.foreground})`,
                borderRadius: `var(${theme.radius})`,
                border: `1px solid hsl(${theme.border})`,
              };
              toast.loading("Toast!", { duration: 1500, style });
              toast.success("Toast!", { duration: 1500, style });
              toast.error("Toast!", { duration: 1500, style });

              await new Promise((resolve) => setTimeout(resolve, 1500));
              setToastState("idle");
            }}
          >
            Toast!
          </ButtonLoading>
          <NextTopLoader color={`hsl(${theme.primary})`} />
          <ButtonLoading
            size={"sm"}
            variant={"outline"}
            className={"w-full"}
            state={loadingState}
            onClick={async (e) => {
              e.preventDefault();
              setLoadingState("loading");

              nProgress.start();
              await new Promise((resolve) => setTimeout(resolve, 1500));
              nProgress.done();
              setLoadingState("idle");
            }}
          >
            Loading bar
          </ButtonLoading>
        </Wrapper>

        <Wrapper
          title='File'
          className='grid grid-cols-1 gap-1.5'
        >
          <FileList
            data={fileMockData}
            disabled
          />
          <FileGrid
            data={fileMockData}
            disabled
          />
        </Wrapper>
      </div>
    </div>
  );
}

type WrapperProps = {
  title: string;
  extra?: string;
  className?: string;
};
function Wrapper({ title, extra, className, children }: React.PropsWithChildren<WrapperProps>) {
  return (
    <div className='flex w-full flex-col gap-3'>
      <div className='flex flex-col'>
        <h3>{title}</h3>
        {extra && <p className='text-xs opacity-50'>{extra}</p>}
      </div>
      <div className={cn("w-full", className)}>{children}</div>
    </div>
  );
}
