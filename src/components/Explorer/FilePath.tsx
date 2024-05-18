"use client";

import Link from "next/link";
import { Fragment, useState } from "react";
import { z } from "zod";

import { Icon } from "~/components/Global";
import { ResponsiveDropdown } from "~/components/Layout";
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
import { Skeleton } from "~/components/ui/skeleton";

import useLoading from "~/hooks/useLoading";
import useRouter from "~/hooks/usePRouter";

import { Schema_Breadcrumb } from "~/types/schema";

import config from "config";

type Props = {
  data: z.infer<typeof Schema_Breadcrumb>[];
};
export default function FilePath({ data }: Props) {
  const loading = useLoading();
  const router = useRouter();

  const [open, setOpen] = useState<boolean>(false);

  if (loading) return <Skeleton className='my-2 h-5 w-1/2' />;

  return (
    <section
      slot='file-path'
      className='flex w-full flex-nowrap items-center'
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
                  />
                  ~
                </div>
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>

          {!!data.length ? (
            <>
              <BreadcrumbSeparator />

              {data.length >= config.siteConfig.breadcrumbMax && (
                <>
                  <ResponsiveDropdown
                    open={open}
                    onOpenChange={setOpen}
                    trigger={
                      <div>
                        <BreadcrumbLink asChild>
                          <BreadcrumbEllipsis className='w-4 cursor-pointer' />
                        </BreadcrumbLink>
                      </div>
                    }
                    mobile={{
                      title: "Navigate",
                      description: "Navigate to parent directories",
                      content: data.slice(0, -config.siteConfig.breadcrumbMax + 1).map((item, idx, array) => (
                        <BreadcrumbItem key={`mobile-${item.label}/${item.href}`}>
                          <BreadcrumbLink asChild>
                            <Button
                              size={"sm"}
                              variant={"outline"}
                              className='w-full justify-start'
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
                            </Button>
                          </BreadcrumbLink>
                        </BreadcrumbItem>
                      )),
                      closeOnFooter: true,
                    }}
                    desktop={{
                      align: "start",
                      items: data.slice(0, -config.siteConfig.breadcrumbMax + 1).map((item, idx, array) => ({
                        type: "item",
                        key: `desktop-${item.label}/${item.href}`,
                        title: item.label,
                        onClick: () => {
                          router.push(
                            `/${array
                              .slice(0, array.indexOf(item) + 1)
                              .map((item) => item.href)
                              .join("/")}`,
                          );
                        },
                      })),
                    }}
                  />

                  <BreadcrumbSeparator />
                </>
              )}

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
    </section>
  );
}
