"use client";

import nProgress from "nprogress";
import { CSSProperties, PropsWithChildren } from "react";
import toast from "react-hot-toast";
import { z } from "zod";
import { Schema_Theme } from "~/schema";

import FileGrid from "~/app/@file.grid";
import FileList from "~/app/@file.list";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
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
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Separator } from "~/components/ui/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";
import { Textarea } from "~/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";

type Props = {
  theme: z.input<typeof Schema_Theme>;
};
export default function ThemePreview({ theme }: Props) {
  return (
    <div
      className='flex flex-col gap-3 rounded-[var(--radius)] border border-border bg-background p-3 text-foreground'
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
        } as CSSProperties
      }
    >
      <Wrapper title='Button'>
        <Button
          size={"sm"}
          variant={"default"}
        >
          Default
        </Button>
        <Button
          size={"sm"}
          variant={"secondary"}
        >
          Secondary
        </Button>
        <Button
          size={"sm"}
          variant={"destructive"}
        >
          Destructive
        </Button>
        <Button
          size={"sm"}
          variant={"outline"}
        >
          Outline
        </Button>
        <Button
          size={"sm"}
          variant={"ghost"}
        >
          Ghost
        </Button>
        <Button
          size={"sm"}
          variant={"link"}
        >
          Link
        </Button>
      </Wrapper>

      <Wrapper title='Card'>
        <Card className='w-full'>
          <CardHeader>
            <CardTitle>Title</CardTitle>
            <CardDescription>Description</CardDescription>
            <Separator />
          </CardHeader>
          <CardContent>Content</CardContent>
          <CardFooter>Footer</CardFooter>
        </Card>
      </Wrapper>

      <Wrapper title='Input'>
        <Input placeholder='Input' />
        <Textarea placeholder='Textarea' />
      </Wrapper>

      <Wrapper title='Popover'>
        <Tooltip>
          <TooltipTrigger>
            <Button
              size={"sm"}
              variant={"outline"}
            >
              Hover me
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Tooltip content</p>
          </TooltipContent>
        </Tooltip>

        <Popover>
          <PopoverTrigger>
            <Button
              size={"sm"}
              variant={"outline"}
            >
              Click me
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <p>Popover content</p>
          </PopoverContent>
        </Popover>

        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button
              size={"sm"}
              variant={"outline"}
            >
              Click me
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Item 1</DropdownMenuItem>
            <DropdownMenuItem>Item 2</DropdownMenuItem>
            <DropdownMenuItem disabled>Item 3</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          size={"sm"}
          variant={"outline"}
          onClick={async () => {
            toast.loading("Loading...", {
              duration: 3000,
            });
            toast.success("Success", {
              duration: 3000,
            });
            toast.error("Error", {
              duration: 3000,
            });
          }}
        >
          Show toast
        </Button>
      </Wrapper>

      <Wrapper title='Overlay'>
        <Dialog>
          <DialogTrigger>
            <Button
              size={"sm"}
              variant={"outline"}
            >
              Open Dialog
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Title</DialogTitle>
              <DialogDescription>Description</DialogDescription>
              <Separator />
            </DialogHeader>
            <div>Content</div>
            <DialogFooter>
              <DialogClose>
                <Button
                  size={"sm"}
                  variant={"secondary"}
                >
                  Close
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Drawer>
          <DrawerTrigger>
            <Button
              size={"sm"}
              variant={"outline"}
            >
              Open Drawer
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Title</DrawerTitle>
              <DrawerDescription>Description</DrawerDescription>
              <Separator />
            </DrawerHeader>
            <div className='p-6'>Content</div>
            <DrawerFooter>
              <DrawerClose>
                <Button
                  size={"sm"}
                  variant={"secondary"}
                  className='w-full'
                >
                  Close
                </Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>

        <Sheet>
          <SheetTrigger>
            <Button
              size={"sm"}
              variant={"outline"}
            >
              Open Sheet
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Title</SheetTitle>
              <SheetDescription>Description</SheetDescription>
              <Separator />
            </SheetHeader>
            <div>Content</div>
            <SheetFooter>
              <SheetClose>
                <Button
                  size={"sm"}
                  variant={"secondary"}
                  className='w-full'
                >
                  Close
                </Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>

        <Button
          size={"sm"}
          variant={"outline"}
          onClick={async () => {
            nProgress.start();
            await new Promise((resolve) => setTimeout(resolve, 1500));
            nProgress.done();
          }}
        >
          Test Loading
        </Button>
      </Wrapper>

      <Wrapper title='File'>
        <div className='flex w-full flex-col gap-3'>
          <FileList
            data={{
              encryptedId: "encryptedId",
              name: "File Name",
              modifiedTime: "2022-01-01T00:00:00Z",
              mimeType: "text/plain",
              trashed: false,
              size: 1024 * 1024 * 100,
            }}
            disabled
          />
          <div className='grid w-full'>
            <FileGrid
              data={{
                encryptedId: "encryptedId",
                name: "File Name",
                modifiedTime: "2022-01-01T00:00:00Z",
                mimeType: "text/plain",
                trashed: false,
                size: 1024 * 1024 * 100,
              }}
              disabled
            />
          </div>
        </div>
      </Wrapper>
    </div>
  );
}

type WrapperProps = {
  title: string;
};
function Wrapper({ title, children }: PropsWithChildren<WrapperProps>) {
  return (
    <div className='flex w-full flex-col gap-1.5'>
      <h2 className='text-lg font-semibold'>{title}</h2>
      <div className={"flex w-full flex-wrap items-center gap-1.5"}>
        {children}
      </div>
    </div>
  );
}
