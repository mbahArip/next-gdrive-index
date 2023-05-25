"use client";

// Error components must be Client Components
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
  const [extendedError, setExtendedError] =
    useState<ExtendedError>();
  const [path, setPath] = useState<string>("root");

  useEffect(() => {
    if (error.message.includes("{")) {
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
                  document.cookie = `next-gdrive-password={"Protected%20Folder%20-%20pass%20loremipsum":"5245a52778d684fa698f69861fb2e058b308f6a74fed5bf2fe77d97bad5e071c"}`;
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
