import { BreadCrumbsResponse, TFileParent } from "types/googleapis";
import Link from "next/link";
import { Fragment } from "react";
import { MdHome } from "react-icons/md";
import siteConfig from "config/site.config";

type Props = {
  data: BreadCrumbsResponse | undefined;
  isLoading: boolean;
};

export default function Breadcrumb({ data, isLoading }: Props) {
  const reverseBreadcrumbs = data?.breadcrumbs?.slice().reverse();

  return (
    <>
      {isLoading ? (
        <div className='flex h-[1.5rem] w-32 animate-pulse items-center gap-2 rounded bg-zinc-300 dark:bg-zinc-600' />
      ) : (
        <div className={"flex items-center gap-1"}>
          {/*  Home  */}
          <Link
            href={"/"}
            className={"flex items-center gap-1"}
          >
            <MdHome />
            <span>Root</span>
          </Link>
          {data?.isLimitReached && (
            <Fragment>
              <span>{siteConfig.breadcrumb.limiter}</span>
              <span>...</span>
            </Fragment>
          )}
          <div
            className={
              "line-clamp-1 flex w-auto flex-grow-0 items-center gap-1 overflow-hidden break-words break-all"
            }
          >
            {reverseBreadcrumbs?.map((parent: TFileParent, index: number) => (
              <Fragment key={index}>
                <span>{siteConfig.breadcrumb.limiter}</span>
                <Link
                  href={`/folder/${parent.id}`}
                  key={index}
                >
                  <span
                    className={`${
                      index === reverseBreadcrumbs.length - 1
                        ? "line-clamp-1 w-auto flex-grow-0 overflow-hidden break-words font-bold"
                        : "whitespace-nowrap"
                    }`}
                  >
                    {parent.name}
                  </span>
                </Link>
              </Fragment>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
