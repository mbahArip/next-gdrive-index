"use client";

import { useTheme } from "next-themes";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import pkg from "~/../package.json";
import { NO_LAYOUT_PATHS } from "~/constant";

import { Button } from "~/components/ui/button";
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
import Icon from "~/components/ui/icon";
import { Separator } from "~/components/ui/separator";
import { Skeleton } from "~/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/ui/tooltip";

import { useConfirmDialog } from "~/context/confirmProvider";
import { useResponsive } from "~/context/responsiveContext";
import useLoading from "~/hooks/useLoading";
import { cn } from "~/lib/utils";

import { ClearSavedPasswords } from "~/actions/password";

import config from "config";

export default function Navbar() {
  const pathname = usePathname();
  const { theme, themes, setTheme } = useTheme();
  const { isDesktop } = useResponsive();
  const isLoading = useLoading();
  const confirm = useConfirmDialog();

  const [open, setOpen] = useState<boolean>(false);
  const [themeOpen, setThemeOpen] = useState<boolean>(false);

  useEffect(() => {
    if (isDesktop) setOpen(false);
  }, [isDesktop]);

  async function onClearPassword() {
    toast.loading("Clearing all saved password...", {
      id: "clear-password",
    });

    const clear = await ClearSavedPasswords();
    if (!clear.success) return toast.error(clear.error, { id: "clear-password" });
    toast.success(clear.message, { id: "clear-password" });
  }

  if (NO_LAYOUT_PATHS.some((path) => new RegExp(path).test(pathname))) return null;

  return (
    <div className={cn("sticky left-0 top-0 z-[48]", "h-12 w-full")}>
      <nav
        slot='nav'
        className={cn(
          "bg-card shadow-md",
          "h-12 w-full",
          "px-2 py-2 md:px-4",
          "flex flex-grow flex-row items-center justify-between",
          "border-b border-border",
        )}
      >
        <div className={cn("flex flex-row items-center justify-between", "mx-auto w-full max-w-screen-desktop")}>
          <Link
            prefetch={false}
            href={"/"}
            onClick={() => setOpen(false)}
            className='flex items-center gap-2'
          >
            <img
              src={config.siteConfig.siteIcon}
              alt={config.siteConfig.siteName}
              className={cn("h-10 w-10")}
              loading='eager'
            />
            <div className='inline-flex items-center gap-1'>
              <span className={cn("large", "hidden", "tablet:block")}>{config.siteConfig.siteName}</span>
              <span className='text-xs text-muted-foreground'>({pkg.version})</span>
            </div>
          </Link>

          {isLoading ? (
            <Skeleton className='h-8 w-1/3' />
          ) : (
            <>
              {isDesktop ? (
                <div className='flex items-center gap-1'>
                  {config.siteConfig.navbarItems.map((item) => (
                    <Tooltip key={item.name}>
                      <TooltipTrigger asChild>
                        <Button
                          asChild
                          variant={"ghost"}
                          size={"icon"}
                        >
                          <Link
                            prefetch={false}
                            href={item.href}
                            target={item.external ? "_blank" : undefined}
                            rel={item.external ? "noopener noreferrer" : undefined}
                            className={cn(
                              "flex flex-col items-center justify-center",
                              "opacity-80",
                              "hover:opacity-100",
                              pathname === item.href ? "cursor-default opacity-100" : "cursor-pointer",
                              "p-1.5",
                            )}
                          >
                            <Icon
                              name={item.icon}
                              size={"1.25rem"}
                            />
                          </Link>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side='bottom'>
                        <p>{item.name}</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}

                  <Separator
                    orientation='vertical'
                    className='mx-2 my-auto h-6'
                  />

                  <DropdownMenu
                    modal={false}
                    open={themeOpen}
                    onOpenChange={setThemeOpen}
                  >
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant={"ghost"}
                            size={"icon"}
                          >
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
                                name={"SunMoon"}
                                size={"1.25rem"}
                              />
                            </div>
                          </Button>
                        </DropdownMenuTrigger>
                      </TooltipTrigger>
                      <TooltipContent side='bottom'>
                        <p>Site theme</p>
                      </TooltipContent>
                    </Tooltip>
                    <DropdownMenuContent>
                      {themes.map((item) => (
                        <DropdownMenuItem
                          key={item}
                          disabled={item === theme}
                          className='w-full'
                          onClick={() => setTheme(item)}
                        >
                          <div className='flex w-full items-center justify-between'>
                            <span className={cn("capitalize")}>{item}</span>
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
                              className='stroke-foreground'
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
                            <Button
                              variant={"ghost"}
                              size={"icon"}
                            >
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
                                  size={"1.25rem"}
                                />
                              </div>
                            </Button>
                          </DropdownMenuTrigger>
                        </TooltipTrigger>
                        <TooltipContent side='bottom'>
                          <p>Support</p>
                        </TooltipContent>
                      </Tooltip>
                      <DropdownMenuContent>
                        {config.siteConfig.supports.map((item) => (
                          <DropdownMenuItem key={item.name}>
                            <Link
                              prefetch={false}
                              href={item.href}
                              target={"_blank"}
                              rel={"noopener noreferrer"}
                              className='flex w-full items-center justify-between gap-4'
                            >
                              <span>{item.name}</span>
                              <span className='muted'>{item.currency}</span>
                            </Link>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}

                  <Separator
                    orientation='vertical'
                    className='mx-2 my-auto h-6'
                  />

                  {!!config.showGuideButton ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant={"ghost"}
                          size={"sm"}
                          className={`text-sm`}
                        >
                          Internal Links
                          <Icon name={"ChevronDown"} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem asChild>
                          <Link
                            prefetch={false}
                            href={"/ngdi-internal/deploy"}
                            className='flex w-full items-center justify-start gap-2'
                          >
                            <Icon name={"Book"} />
                            Deploy Guide
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link
                            prefetch={false}
                            href={"/ngdi-internal/configurator"}
                            className='flex w-full items-center justify-start gap-2'
                          >
                            <Icon name={"Wrench"} />
                            Configurator
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <></>
                  )}

                  <Button
                    variant={"ghost-destructive"}
                    size={"icon"}
                    onClick={async () => {
                      await confirm({
                        title: "Clear all saved password?",
                        description: "You will need to re-enter the password to access the protected content.",
                        confirmText: "Clear all",
                        confirmProps: {
                          variant: "destructive",
                        },
                        cancelText: "Cancel",
                        async onConfirm() {
                          await onClearPassword();
                        },
                      });
                    }}
                  >
                    <Icon name='LogOut' />
                  </Button>
                </div>
              ) : (
                <div className='flex items-center gap-2'>
                  <Drawer
                    open={themeOpen}
                    onOpenChange={setThemeOpen}
                    shouldScaleBackground
                  >
                    <DrawerTrigger asChild>
                      <Button
                        variant={"ghost"}
                        size={"icon"}
                      >
                        <Icon
                          name={"SunMoon"}
                          className='text-foreground'
                        />
                      </Button>
                    </DrawerTrigger>
                    <DrawerContent>
                      <DrawerHeader className='text-start'>
                        <DrawerTitle>Theme</DrawerTitle>
                        <DrawerDescription>Choose your preferred theme</DrawerDescription>
                      </DrawerHeader>

                      <div className='grid gap-2 px-4'>
                        {themes.map((item) => (
                          <Button
                            key={item}
                            variant={theme === item ? "secondary" : "outline"}
                            size={"default"}
                            className='w-full'
                            disabled={item === theme}
                            onClick={() => {
                              setTheme(item);
                            }}
                          >
                            <div className='flex w-full items-center justify-between'>
                              <span className={cn("capitalize")}>{item}</span>
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
                                size={"1rem"}
                              />
                            </div>
                          </Button>
                        ))}
                      </div>

                      <DrawerFooter>
                        <DrawerClose asChild>
                          <Button
                            className='w-full'
                            variant={"secondary"}
                          >
                            Close
                          </Button>
                        </DrawerClose>
                      </DrawerFooter>
                    </DrawerContent>
                  </Drawer>

                  <Drawer
                    open={open}
                    onOpenChange={setOpen}
                    shouldScaleBackground
                  >
                    <DrawerTrigger asChild>
                      <Button
                        variant={"ghost"}
                        size={"icon"}
                      >
                        <Icon
                          name='Menu'
                          className='text-foreground'
                        />
                      </Button>
                    </DrawerTrigger>
                    <DrawerContent>
                      <DrawerHeader className='text-start'>
                        <DrawerTitle>Menu</DrawerTitle>
                        <DrawerDescription>Explore the site</DrawerDescription>
                      </DrawerHeader>

                      <div className='grid gap-2 px-4'>
                        {config.siteConfig.navbarItems.map((item) => (
                          <Button
                            key={item.name}
                            variant={"outline"}
                            asChild
                          >
                            <Link
                              prefetch={false}
                              href={item.href}
                              target={item.external ? "_blank" : undefined}
                              rel={item.external ? "noopener noreferrer" : undefined}
                              className='flex w-full items-center justify-between gap-4'
                              onClick={() => setOpen(false)}
                            >
                              <div className='flex items-center gap-4'>
                                <Icon
                                  name={item.icon}
                                  className='text-foreground'
                                />
                                {item.name}
                              </div>
                              {item.external && (
                                <Icon
                                  name='ExternalLink'
                                  size={"0.75rem"}
                                  className='text-muted-foreground'
                                />
                              )}
                            </Link>
                          </Button>
                        ))}

                        {!!config.showGuideButton && (
                          <>
                            <Button
                              variant={"outline"}
                              asChild
                            >
                              <Link
                                prefetch={false}
                                href={"/ngdi-internal/deploy"}
                                className='flex w-full items-center justify-between gap-4'
                                onClick={() => setOpen(false)}
                              >
                                <div className='flex items-center gap-4'>
                                  <Icon
                                    name={"Book"}
                                    className='text-foreground'
                                  />
                                  Deploy Guide
                                </div>
                              </Link>
                            </Button>
                            <Button
                              variant={"outline"}
                              asChild
                            >
                              <Link
                                prefetch={false}
                                href={"/ngdi-internal/configurator"}
                                className='flex w-full items-center justify-between gap-4'
                                onClick={() => setOpen(false)}
                              >
                                <div className='flex items-center gap-4'>
                                  <Icon
                                    name={"Wrench"}
                                    className='text-foreground'
                                  />
                                  Configurator
                                </div>
                              </Link>
                            </Button>
                          </>
                        )}
                      </div>

                      {config.siteConfig.supports.length && (
                        <>
                          <DrawerHeader className='text-start'>
                            <DrawerTitle>Support</DrawerTitle>
                            <DrawerDescription>Support the site</DrawerDescription>
                          </DrawerHeader>

                          <div className='grid gap-2 px-4'>
                            {config.siteConfig.supports.map((item) => (
                              <Button
                                key={item.name}
                                variant={"outline"}
                                asChild
                              >
                                <Link
                                  prefetch={false}
                                  key={item.name}
                                  href={item.href}
                                  target={"_blank"}
                                  rel={"noopener noreferrer"}
                                  className='flex w-full items-center justify-between gap-4'
                                >
                                  <small>{item.name}</small>
                                  <small className='muted'>{item.currency}</small>
                                </Link>
                              </Button>
                            ))}
                          </div>
                        </>
                      )}

                      <DrawerFooter className='w-full'>
                        <Separator className='my-3' />

                        <Button
                          variant={"destructive"}
                          className='w-full gap-4'
                          onClick={async () => {
                            await confirm({
                              title: "Clear all saved password?",
                              description: "You will need to re-enter the password to access the protected content.",
                              confirmText: "Clear all",
                              confirmProps: {
                                variant: "destructive",
                              },
                              cancelText: "Cancel",
                              async onConfirm() {
                                await onClearPassword();
                              },
                            });
                          }}
                        >
                          Clear all saved password
                        </Button>
                      </DrawerFooter>
                    </DrawerContent>
                  </Drawer>
                </div>
              )}
            </>
          )}
        </div>
      </nav>
    </div>
  );
}
