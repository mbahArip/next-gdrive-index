"use client";

import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import Link from "next/link";
import { Fragment, useState } from "react";
import { z } from "zod";
import { Schema_Breadcrumb } from "~/schema";

import Icon from "~/components/Icon";
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import { Button } from "~/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "~/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
} from "~/components/ui/dropdown-menu";
import { Separator } from "~/components/ui/separator";
import { Skeleton } from "~/components/ui/skeleton";

import useMediaQuery from "~/hooks/useMediaQuery";

import config from "~/config/gIndex.config";

type Props = {
  data: z.infer<typeof Schema_Breadcrumb>[];
  loading?: boolean;
};
export default function HeaderBreadcrumb({ data, loading }: Props) {
  const [open, setOpen] = useState<boolean>(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (loading) return <Skeleton className='h-5 w-1/2' />;

  return (
    <div className='flex w-full flex-nowrap items-center'>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={"/"}>
                <div className='flex items-center gap-1'>
                  <Icon
                    name='FolderRoot'
                    size={16}
                  />
                  ~
                </div>
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          {!!data.length ? (
            <>
              <BreadcrumbSeparator />

              {data.length > config.siteConfig.breadcrumbMax ? (
                <>
                  {isDesktop ? (
                    <DropdownMenu
                      open={open}
                      onOpenChange={setOpen}
                    >
                      <DropdownMenuTrigger>
                        <BreadcrumbEllipsis className='w-4' />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='start'>
                        {data
                          .slice(0, -config.siteConfig.breadcrumbMax + 1)
                          .map((item, _, array) => (
                            <DropdownMenuItem
                              key={`${item.label}/${item.href}`}
                            >
                              <BreadcrumbLink asChild>
                                <Link
                                  href={`/${array
                                    .slice(0, array.indexOf(item) + 1)
                                    .map((item) => item.href)
                                    .join("/")}`}
                                  className='w-full'
                                >
                                  {item.label}
                                </Link>
                              </BreadcrumbLink>
                            </DropdownMenuItem>
                          ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <Drawer
                      open={open}
                      onOpenChange={setOpen}
                    >
                      <DrawerTrigger>
                        <BreadcrumbEllipsis className='w-4' />
                      </DrawerTrigger>
                      <DrawerContent>
                        <DrawerHeader className='text-left'>
                          <DrawerTitle>
                            Navigate to parent directories
                          </DrawerTitle>
                          <Separator />
                        </DrawerHeader>
                        <div className='grid gap-1.5 px-4'>
                          {data
                            .slice(0, -config.siteConfig.breadcrumbMax + 1)
                            .map((item, _, array) => (
                              <BreadcrumbItem
                                key={`${item.label}/${item.href}`}
                              >
                                <BreadcrumbLink asChild>
                                  <Link
                                    href={`/${array
                                      .slice(0, array.indexOf(item) + 1)
                                      .map((item) => item.href)
                                      .join("/")}`}
                                    className='w-full py-1.5'
                                  >
                                    {item.label}
                                  </Link>
                                </BreadcrumbLink>
                              </BreadcrumbItem>
                            ))}
                        </div>

                        <DrawerFooter>
                          <DrawerClose asChild>
                            <Button variant={"secondary"}>Close</Button>
                          </DrawerClose>
                        </DrawerFooter>
                      </DrawerContent>
                    </Drawer>
                  )}

                  <BreadcrumbSeparator />
                </>
              ) : null}

              {data.slice(-config.siteConfig.breadcrumbMax + 1).map((item) => (
                <Fragment key={`${item.label}/${item.href}`}>
                  <BreadcrumbItem className='line-clamp-1 whitespace-pre-wrap break-all'>
                    {item.href ? (
                      <>
                        <BreadcrumbLink asChild>
                          <Link
                            href={`/${data
                              .map((item) => item.href)
                              .join("/")
                              .replace(/\/\//g, "/")}`}
                          >
                            {item.label}
                          </Link>
                        </BreadcrumbLink>
                      </>
                    ) : (
                      <BreadcrumbPage className='line-clamp-1 whitespace-pre-wrap break-all'>
                        {item.label}
                      </BreadcrumbPage>
                    )}
                  </BreadcrumbItem>
                  {item.href && <BreadcrumbSeparator />}
                </Fragment>
              ))}
            </>
          ) : null}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}
