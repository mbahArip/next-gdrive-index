"use client";

import Link from "next/link";
import { Fragment, useEffect, useState } from "react";
import { MdHome } from "react-icons/md";

import { FilePath } from "types/api/path";

import siteConfig from "config/site.config";

type Props = {
  data?: FilePath[];
};

function Breadcrumb({ data = [] }: Props) {
  const [breadcrumb, setBreadcrumb] = useState<FilePath[]>(
    [],
  );
  const [isLimited, setIsLimited] =
    useState<boolean>(false);
  const [breadcrumbPath, setBreadcrumbPath] = useState<
    string[]
  >([]);

  useEffect(() => {
    if (data.length) {
      const reverseBreadcrumbs = data;
      const isLimitReached =
        reverseBreadcrumbs.length >
        siteConfig.files.breadcrumbDepth;
      const limitBreadcrumbs = isLimitReached
        ? reverseBreadcrumbs.slice(
            reverseBreadcrumbs.length -
              siteConfig.files.breadcrumbDepth,
            reverseBreadcrumbs.length,
          )
        : reverseBreadcrumbs;

      setBreadcrumb(limitBreadcrumbs);
      setIsLimited(isLimitReached);

      const path: string[] = [];
      reverseBreadcrumbs.forEach((item) => {
        path.push(item.name);
      });
      setBreadcrumbPath(path);
    }
  }, [data]);

  return (
    <div className={"flex w-full items-center gap-1 py-1"}>
      {/*  Home  */}
      <Link
        href={"/"}
        className={"flex items-center gap-1"}
      >
        <MdHome />
        <span className={"hidden tablet:block"}>Root</span>
      </Link>
      {isLimited && (
        <Fragment>
          <span>{siteConfig.files.breadcrumbLimiter}</span>
          <span>...</span>
        </Fragment>
      )}
      <div
        className={
          "line-clamp-1 flex w-auto flex-grow-0 items-center gap-1 overflow-hidden break-words break-all"
        }
      >
        {breadcrumb.map(
          (parent: FilePath, index: number) => {
            const findCurrentPath =
              breadcrumbPath.findIndex(
                (item) => item === parent.name,
              );
            const url = breadcrumbPath
              .slice(0, findCurrentPath + 1)
              .join("/");
            return (
              <Fragment key={index}>
                <span>
                  {siteConfig.files.breadcrumbLimiter}
                </span>
                <Link
                  href={
                    index === breadcrumb.length - 1
                      ? "#"
                      : url
                  }
                  key={`breadcrumb-${index}`}
                  className={`${
                    index === breadcrumb.length - 1
                      ? "cursor-default opacity-100"
                      : ""
                  } `}
                >
                  <span
                    className={`${
                      index === breadcrumb.length - 1
                        ? "line-clamp-1 w-auto flex-grow-0 overflow-hidden break-words font-bold"
                        : "whitespace-nowrap"
                    }`}
                  >
                    {parent.name}
                  </span>
                </Link>
              </Fragment>
            );
          },
        )}
      </div>
    </div>
  );
}

export default Breadcrumb;
