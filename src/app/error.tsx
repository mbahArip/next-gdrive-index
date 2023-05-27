"use client";

// Error components must be Client Components
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import CompPassword from "components/compPassword";

import ExtendedError from "utils/generalHelper/extendedError";

import { Constant } from "types/general/constant";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [extendedError, setExtendedError] =
    useState<ExtendedError>();
  const [path, setPath] = useState<string>("root");

  useEffect(() => {
    if (error.message.includes("{")) {
      console.log("CHECKPOINT ERROR MESSAGE IS JSON");
      const errorObj = JSON.parse(
        error.message,
      ) as ExtendedError;
      const extendError = new ExtendedError(
        errorObj.extendedMessage ||
          Constant.apiInternalError,
        errorObj.code || 500,
        errorObj.category || "internalServerError",
        errorObj.reason || "Internal Server Error",
      );
      console.log("CHECKPOINT EXTENDED ERROR", extendError);
      setExtendedError(extendError);

      const path =
        extendError.reason?.split('"')[1].split('"')[0] ||
        "root";
      setPath(path);
    } else {
      const extendedError = new ExtendedError(
        Constant.apiInternalError,
        500,
        "internalServerError",
        error.message,
      );
      setExtendedError(extendedError);
    }
  }, [error]);

  useEffect(() => {
    if (extendedError?.code === 401) {
      router.push(
        `/password?redirect=${pathname}&path=${path}`,
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [extendedError, path, pathname]);

  return (
    <div
      className={
        "relative flex h-full min-h-[80dvh] w-full flex-grow flex-col items-center justify-center gap-8"
      }
    >
      {/* Image placeholder */}
      <div
        className={
          "grid h-48 w-48 place-items-center rounded-lg bg-blue-300 font-semibold text-zinc-900"
        }
      >
        Placeholder Image
      </div>

      {extendedError?.code === 401 ? (
        <>
          <CompPassword path={path} />
        </>
      ) : (
        <>
          {/* Error message */}
          <div
            className={
              "flex max-w-screen-lg flex-col items-center gap-2"
            }
          >
            <h1 className={"font-semibold"}>
              {extendedError?.code}
            </h1>
            <p className={"font-medium"}>
              {extendedError?.message}
            </p>
            <div
              className={
                "flex flex-row gap-2 tablet:flex-row"
              }
            >
              <a href={"/"}>
                <button className={"link"}>
                  Go back to home
                </button>
              </a>
              <button
                onClick={() => {
                  reset();
                }}
                className={"interactive"}
              >
                Try again
              </button>
            </div>
          </div>

          {/* Error reason */}
          <pre
            className={
              "absolute bottom-0 my-4 max-w-sm whitespace-pre-wrap rounded-lg border border-zinc-500/25 bg-zinc-100 px-4 py-2 text-xs dark:bg-zinc-900 md:max-w-screen-lg"
            }
          >
            <b>{extendedError?.category}: </b>
            {extendedError?.reason}
          </pre>
        </>
      )}
    </div>
  );
}
