import { TFileParent } from "@/types/googleapis";
import Link from "next/link";
import { Fragment, useEffect, useState } from "react";
import { MdHome } from "react-icons/md";
import ReactLoading from "react-loading";
import config from "@config/site.config";

type Props = {
  data: TFileParent[];
  isLoading: boolean;
};

export default function Breadcrumb({ data, isLoading }: Props) {
  const limitItem = 2;
  const [limitedPath, setLimitedPath] = useState<TFileParent[]>([]);
  const [isLimited, setIsLimited] = useState<boolean>();
  // const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // setIsLoading(true);
    if (data.length > 0) {
      const findRoot = data.find((item) => item.id === config.files.rootFolder);
      let _data = data;
      if (findRoot) {
        _data = _data.filter((item) => item.id !== config.files.rootFolder);
      }
      setLimitedPath(_data.slice(0, limitItem).reverse());
      setIsLimited(_data.length > limitItem);
      // setIsLoading(false);
    }
  }, [data]);

  return (
    <div className='flex items-center gap-2'>
      {isLoading ? (
        <ReactLoading
          type='spin'
          width={20}
          height={20}
          className={"loading"}
        />
      ) : (
        <>
          <Link
            href='/'
            className='flex items-center gap-2'
          >
            <MdHome />
            <span>Root</span>
          </Link>
          {isLimited && (
            <Fragment>
              <span className={"cursor-default"}>/</span>
              <span className={"cursor-default"}>...</span>
            </Fragment>
          )}
          <>
            {limitedPath.map((parent, idx) => (
              <Fragment key={parent.id}>
                <span className={"cursor-default"}>/</span>

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
        </>
      )}
    </div>
  );
}
