import { TFileParent } from "@/types/googleapis";
import Link from "next/link";
import { Fragment, useEffect, useState } from "react";
import { MdHome } from "react-icons/md";
import useLocalStorage from "@hooks/useLocalStorage";
import ReactLoading from "react-loading";

type Props = {
  data: TFileParent[];
  isLoading: boolean;
};

export default function Breadcrumb({ data, isLoading }: Props) {
  const limitItem = 2;
  const [limitedPath, setLimitedPath] = useState<TFileParent[]>([]);
  const [slicedPath, setSlicedPath] = useState<TFileParent>();
  const [isLimited, setIsLimited] = useState<boolean>();
  // const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // setIsLoading(true);
    if (data.length > 0) {
      setLimitedPath(data.slice(0, limitItem).reverse());
      setSlicedPath(data.slice(limitItem)[0]);
      setIsLimited(data.length > limitItem);
      // setIsLoading(false);
    }
  }, [data]);

  return (
    <div className='flex items-center gap-2'>
      <Link
        href='/'
        className='flex items-center gap-2'
      >
        <MdHome />
        <span>Root</span>
      </Link>
      {isLoading && (
        <ReactLoading
          type='spin'
          width={20}
          height={20}
          className={"loading"}
        />
      )}
      {isLimited && !isLoading && (
        <Fragment>
          <span>/</span>
          <Link
            href={`/folder/${slicedPath?.id}`}
            title={slicedPath?.name}
            className='flex items-center gap-2'
          >
            ...
          </Link>
        </Fragment>
      )}
      {!isLoading && (
        <>
          {limitedPath.map((parent, idx) => (
            <Fragment key={parent.id}>
              <span>/</span>

              {idx === limitedPath.length - 1 ? (
                <span className='flex cursor-default items-center gap-2 font-bold'>
                  {parent.name}
                </span>
              ) : (
                <Link
                  href={`/folder/${parent.id}`}
                  className={`flex items-center gap-2 ${
                    idx === limitedPath.length - 1
                      ? "cursor-default font-bold"
                      : "cursor-pointer"
                  }`}
                >
                  {parent.name}
                </Link>
              )}
            </Fragment>
          ))}
        </>
      )}
    </div>
  );
}
