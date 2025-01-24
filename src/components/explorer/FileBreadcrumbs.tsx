"use client";

import Link from "next/link";
import { Fragment, useState } from "react";
import { type z } from "zod";

import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import {
  ResponsiveDropdownMenu,
  ResponsiveDropdownMenuContent,
  ResponsiveDropdownMenuItem,
  ResponsiveDropdownMenuTrigger,
} from "~/components/ui/dropdown-menu.responsive";
import Icon from "~/components/ui/icon";
import { Skeleton } from "~/components/ui/skeleton";

import useLoading from "~/hooks/useLoading";

import { type Schema_Breadcrumb } from "~/types/schema";

import config from "config";

type Props = {
  data?: z.infer<typeof Schema_Breadcrumb>[];
};
export default function FileBreadcrumb({ data }: Props) {
  const loading = useLoading();

  const [open, setOpen] = useState<boolean>(false);
  const [path] = useState<z.infer<typeof Schema_Breadcrumb>[]>(data ?? []);

  if (loading) return <Skeleton className='my-2 h-5 w-1/2' />;

  return (
    <section
      slot='file-path'
      className='flex w-full flex-nowrap items-center px-3'
    >
      <Breadcrumb>
        <BreadcrumbList>
          {/* Root */}
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={"/"}>
                <div className='flex items-center gap-1'>
                  <Icon
                    name='FolderRoot'
                    size={"1rem"}
                    className='stroke-foreground'
                  />
                  ~
                </div>
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>

          {!!path.length ? (
            <>
              <BreadcrumbSeparator />

              {path.length >= config.siteConfig.breadcrumbMax && (
                <>
                  <ResponsiveDropdownMenu
                    open={open}
                    onOpenChange={setOpen}
                  >
                    <ResponsiveDropdownMenuTrigger asChild>
                      <BreadcrumbLink asChild>
                        <BreadcrumbEllipsis className='w-4 cursor-pointer' />
                      </BreadcrumbLink>
                    </ResponsiveDropdownMenuTrigger>
                    <ResponsiveDropdownMenuContent
                      header={{
                        title: "Navigate",
                        description: "Navigate to parent directories",
                      }}
                    >
                      {path.slice(0, -config.siteConfig.breadcrumbMax + 1).map((item, idx, array) => (
                        <ResponsiveDropdownMenuItem
                          key={`breadcrumb-${item.label}/${item.href}`}
                          closeOnSelect
                          asChild
                        >
                          <Link
                            href={`/${array
                              .slice(0, array.indexOf(item) + 1)
                              .map((item) => item.href)
                              .join("/")}`}
                          >
                            {item.label}
                          </Link>
                        </ResponsiveDropdownMenuItem>
                      ))}
                    </ResponsiveDropdownMenuContent>
                  </ResponsiveDropdownMenu>

                  <BreadcrumbSeparator />
                </>
              )}

              {path.slice(-config.siteConfig.breadcrumbMax + 1).map((item) => (
                <Fragment key={`${item.label}/${item.href}`}>
                  <BreadcrumbItem className='line-clamp-1 whitespace-pre-wrap break-all'>
                    {item.href ? (
                      <>
                        <BreadcrumbLink asChild>
                          <Link
                            href={`/${path
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
    </section>
  );
}
