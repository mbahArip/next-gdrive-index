import { BreadCrumbsResponse, TFileParent } from "types/googleapis";
import Link from "next/link";
import { Fragment } from "react";
import { MdHome } from "react-icons/md";
import ReactLoading from "react-loading";
import siteConfig from "config/site.config";

type Props = {
  data: BreadCrumbsResponse | undefined;
  isLoading: boolean;
};

export default function Breadcrumb({ data, isLoading }: Props) {
  return (
    <>
      {isLoading ? (
        <div className='flex h-[1.5rem] w-32 animate-pulse items-center gap-2 rounded bg-zinc-300 dark:bg-zinc-600' />
      ) : (
        <div className={"flex items-center gap-2"}>
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
              <span>...</span>
              <span>{siteConfig.breadcrumb.limiter}</span>
            </Fragment>
          )}
          {data?.breadcrumbs.map((parent: TFileParent, index: number) => (
            <Link
              href={`/folder/${parent.id}`}
              key={index}
              className={"flex items-center gap-1"}
            >
              <span>{parent.name}</span>
              {index !== data.breadcrumbs.length - 1 && (
                <span>{siteConfig.breadcrumb.limiter}</span>
              )}
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
