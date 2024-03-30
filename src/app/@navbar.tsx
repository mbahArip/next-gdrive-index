"use client";

import { TooltipTrigger } from "@radix-ui/react-tooltip";
import { useTheme } from "next-themes";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Icon from "~/components/Icon";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Separator } from "~/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetTrigger,
} from "~/components/ui/sheet";
import { Tooltip, TooltipContent } from "~/components/ui/tooltip";
import config from "~/config/gIndex.config";
import useMediaQuery from "~/hooks/useMediaQuery";
import { cn } from "~/utils";

import { ClearPassword } from "./actions";

export default function Navbar() {
  const pathname = usePathname();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const { theme, themes, setTheme } = useTheme();

  const [open, setOpen] = useState<boolean>(false);

  useEffect(() => {
    if (isDesktop) setOpen(false);
  }, [isDesktop]);

  async function onClearPassword() {
    const promise = new Promise(async (resolve, reject) => {
      const clear = await ClearPassword();
      if (!clear.success) reject(new Error(clear.message));
      resolve(clear.message);
    });
    toast.promise(promise, {
      loading: "Clearing all saved password...",
      success: () => {
        setOpen(false);
        return "All saved password cleared successfully!";
      },
      error: (error) => error.message,
    });
  }

  return (
    <div
      className={cn(
        "relative left-0 top-0 z-50",
        "h-12 w-full",
        // "tablet:h-screen tablet:w-20",
        "flex-shrink-0",
      )}
    >
      <nav
        slot='nav'
        className={cn(
          "bg-background",
          "fixed left-0 top-0",
          "h-12 w-full",
          // "tablet:h-screen tablet:w-20",
          "px-6 py-3",
          // "tablet:px-3 tablet:py-6",
          "flex flex-row items-center justify-between",
          // "tablet:flex-col",
          "border-b border-border",
          // "tablet:border-b-0 tablet:border-r",
        )}
      >
        <div
          className={cn(
            "flex flex-row items-center justify-between",
            "mx-auto w-full max-w-screen-desktop",
          )}
        >
          <Tooltip>
            <TooltipTrigger>
              <Link
                href={"/"}
                onClick={() => setOpen(false)}
                className='flex items-center gap-3'
              >
                <img
                  src={config.siteConfig.siteIcon}
                  alt={config.siteConfig.siteName}
                  className={cn("h-6 w-6 invert dark:invert-0")}
                  loading='eager'
                />
                <span className={cn("large", "hidden", "tablet:block")}>
                  {config.siteConfig.siteName}
                </span>
              </Link>
            </TooltipTrigger>
            <TooltipContent>
              <p>Back to Root folder</p>
            </TooltipContent>
          </Tooltip>

          <div className={cn("hidden", "tablet:flex")}>
            {config.siteConfig.navbarItems.map((item) => (
              <Tooltip key={item.name}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    target={item.external ? "_blank" : undefined}
                    rel={item.external ? "noopener noreferrer" : undefined}
                    className={cn(
                      "flex flex-col items-center justify-center",
                      "opacity-80",
                      "hover:opacity-100",
                      pathname === item.href
                        ? "cursor-default opacity-100"
                        : "cursor-pointer",
                      "p-1.5",
                    )}
                  >
                    <Icon
                      name={item.icon}
                      className='text-foreground'
                      size={20}
                    />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side='bottom'>
                  <p>{item.name}</p>
                </TooltipContent>
              </Tooltip>
            ))}

            <Separator
              orientation='vertical'
              className='mx-3'
            />

            <DropdownMenu modal={false}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <div
                      className={cn(
                        "flex flex-col items-center justify-center",
                        "opacity-80",
                        "hover:opacity-100",
                        "cursor-pointer",
                        "p-1.5",
                      )}
                    >
                      <Icon
                        name={
                          theme === "system"
                            ? "LaptopMinimal"
                            : theme === "light"
                            ? "Sun"
                            : "Moon"
                        }
                        size={20}
                      />
                    </div>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent side='bottom'>
                  <p>Site theme</p>
                </TooltipContent>
              </Tooltip>
              <DropdownMenuContent align='end'>
                {themes.map((item) => (
                  <DropdownMenuItem
                    key={item}
                    disabled={item === theme}
                    className='w-full'
                    onClick={() => setTheme(item)}
                  >
                    <div className='flex w-full items-center justify-between'>
                      <span
                        className={cn(
                          "capitalize",
                          // item === theme && "text-muted-foreground",
                        )}
                      >
                        {item}
                      </span>
                      <Icon
                        name={
                          item === theme
                            ? "Check"
                            : item === "system"
                            ? "LaptopMinimal"
                            : item === "light"
                            ? "Sun"
                            : "Moon"
                        }
                        className={
                          cn()
                          // item === theme && "text-muted-foreground",
                        }
                        size={16}
                      />
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {config.siteConfig.supports.length && (
              <DropdownMenu modal={false}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <div
                        className={cn(
                          "flex flex-col items-center justify-center",
                          "opacity-80",
                          "hover:opacity-100",
                          "cursor-pointer",
                          "p-1.5",
                        )}
                      >
                        <Icon
                          name='Heart'
                          size={20}
                        />
                      </div>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent side='bottom'>
                    <p>Support</p>
                  </TooltipContent>
                </Tooltip>
                <DropdownMenuContent align='end'>
                  {config.siteConfig.supports.map((item) => (
                    <DropdownMenuItem key={item.name}>
                      <Link
                        href={item.href}
                        target={"_blank"}
                        rel={"noopener noreferrer"}
                        className='flex w-full items-center justify-between gap-3'
                      >
                        <span>{item.name}</span>
                        <span className='muted'>{item.currency}</span>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <Dialog>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DialogTrigger asChild>
                    <div
                      className={cn(
                        "flex flex-col items-center justify-center",
                        "opacity-80",
                        "hover:opacity-100",
                        "cursor-pointer",
                        "p-1.5",
                      )}
                    >
                      <Icon
                        name='LogOut'
                        className='text-red-500'
                        size={20}
                      />
                    </div>
                  </DialogTrigger>
                </TooltipTrigger>
                <TooltipContent side='bottom'>
                  <p>Clear all saved password</p>
                </TooltipContent>
              </Tooltip>

              <DialogContent>
                <DialogTitle>Clear all saved password?</DialogTitle>
                <DialogDescription>
                  This action will clear all saved password from your browser.
                  <br />
                  You will need to re-enter the password for each
                  password-protected folder.
                  <br />
                  <br />
                  <b>Are you sure you want to continue?</b>
                </DialogDescription>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant={"secondary"}>Cancel</Button>
                  </DialogClose>
                  <DialogClose asChild>
                    <Button
                      variant={"destructive"}
                      onClick={onClearPassword}
                    >
                      Clear all saved password
                    </Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className={cn("flex", "tablet:hidden")}>
            <Sheet
              open={open}
              onOpenChange={setOpen}
            >
              <SheetTrigger asChild>
                <Button
                  variant={"ghost"}
                  size={"icon"}
                >
                  <Icon
                    name='Menu'
                    className='text-foreground'
                  />
                </Button>
              </SheetTrigger>
              <SheetContent className='flex flex-col items-center gap-3 pt-12'>
                <div className='flex w-full flex-grow flex-col gap-6 overflow-y-scroll'>
                  <div className='flex flex-col'>
                    {config.siteConfig.navbarItems.map((item) => (
                      <Button
                        key={item.name}
                        variant={"ghost"}
                        size={"sm"}
                        asChild
                      >
                        <Link
                          href={item.href}
                          target={item.external ? "_blank" : undefined}
                          rel={
                            item.external ? "noopener noreferrer" : undefined
                          }
                          className='flex w-full items-center justify-between gap-3'
                          onClick={() => setOpen(false)}
                        >
                          <div className='flex items-center gap-3'>
                            <Icon
                              name={item.icon}
                              className='text-foreground'
                              size={18}
                            />
                            {item.name}
                          </div>
                          {item.external && (
                            <Icon
                              name='ExternalLink'
                              size={12}
                              className='text-muted-foreground'
                            />
                          )}
                        </Link>
                      </Button>
                    ))}
                  </div>

                  <div className='flex flex-col'>
                    <p className='large'>Theme</p>
                    <Separator className='my-1.5' />
                    {themes.map((item) => (
                      <Button
                        key={item}
                        variant={"ghost"}
                        size={"sm"}
                        className='w-full'
                        disabled={item === theme}
                        onClick={() => {
                          setTheme(item);
                        }}
                      >
                        <div className='flex w-full items-center justify-between gap-3'>
                          <span
                            className={cn(
                              "capitalize",
                              // item === theme && "text-muted-foreground",
                            )}
                          >
                            {item}
                          </span>
                          <Icon
                            name={
                              item === theme
                                ? "Check"
                                : item === "system"
                                ? "LaptopMinimal"
                                : item === "light"
                                ? "Sun"
                                : "Moon"
                            }
                            className={
                              cn()
                              // item === theme && "text-muted-foreground",
                            }
                            size={18}
                          />
                        </div>
                      </Button>
                    ))}
                  </div>

                  {config.siteConfig.supports.length && (
                    <div className='flex flex-col'>
                      <p className='large'>Support & Donation</p>
                      <Separator className='my-1.5' />
                      {config.siteConfig.supports.map((item) => (
                        <Button
                          key={item.name}
                          variant={"ghost"}
                          size={"sm"}
                          asChild
                        >
                          <Link
                            key={item.name}
                            href={item.href}
                            target={"_blank"}
                            rel={"noopener noreferrer"}
                            className='flex w-full items-center justify-between gap-3'
                          >
                            <small>{item.name}</small>
                            <small className='muted'>{item.currency}</small>
                          </Link>
                        </Button>
                      ))}
                    </div>
                  )}
                </div>

                <SheetFooter className='w-full'>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant={"destructive"}
                        className='gap-3'
                        size={"sm"}
                      >
                        Clear all saved password
                      </Button>
                    </DialogTrigger>

                    <DialogContent>
                      <DialogTitle>Clear all saved password?</DialogTitle>
                      <DialogDescription>
                        This action will clear all saved password from your
                        browser.
                        <br />
                        You will need to re-enter the password for each
                        password-protected folder.
                        <br />
                        <br />
                        <b>Are you sure you want to continue?</b>
                      </DialogDescription>
                      <DialogFooter className='gap-1.5'>
                        <DialogClose asChild>
                          <Button variant={"secondary"}>Cancel</Button>
                        </DialogClose>
                        <DialogClose asChild>
                          <Button
                            variant={"destructive"}
                            onClick={onClearPassword}
                          >
                            Clear all saved password
                          </Button>
                        </DialogClose>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
    </div>
  );
}
