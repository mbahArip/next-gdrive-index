"use client";

import {
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  LayoutContext,
  TLayoutContext,
} from "context/layoutContext";

import { API_Response } from "types/api";
import { FilesResponse } from "types/api/files";

import apiConfig from "config/api.config";

import GridLayout from "./compGridLayout";
import ListLayout from "./compListLayout";

type Props = {
  data: FilesResponse;
};

function FileLayout({ data }: Props) {
  const { layout } =
    useContext<TLayoutContext>(LayoutContext);
  const [clientData, setClientData] =
    useState<FilesResponse>(data);
  const [nextPageToken, setNextPageToken] =
    useState<string>(data.nextPageToken ?? "");
  const [isNextPageLoading, setIsNextPageLoading] =
    useState<boolean>(false);
  const [totalItems, setTotalItems] = useState<number>(
    data.files.length + data.folders.length || 0,
  );

  useEffect(() => {
    const files = clientData.files.length ?? 0;
    const folders = clientData.folders.length ?? 0;
    setTotalItems(files + folders);
  }, [clientData]);

  const handleLoadMore = useCallback(async () => {
    setIsNextPageLoading(true);
    const { data: newData } = await fetch(
      `${apiConfig.basePath}/api/files?pageToken=${nextPageToken}`,
    ).then(
      (res) =>
        res.json() as Promise<API_Response<FilesResponse>>,
    );

    setClientData((prev) => ({
      ...prev,
      files: [...prev.files, ...(newData?.files ?? [])],
      folders: [
        ...prev.folders,
        ...(newData?.folders ?? []),
      ],
    }));
    setNextPageToken(newData?.nextPageToken ?? "");
    setIsNextPageLoading(false);
  }, [nextPageToken]);

  return (
    <>
      {layout === "grid" ? (
        <>
          <GridLayout data={clientData} />
        </>
      ) : (
        <ListLayout data={clientData} />
      )}
      {nextPageToken && (
        <div
          className={
            "flex w-full flex-nowrap items-center justify-center"
          }
        >
          <button
            className={"link w-full whitespace-nowrap"}
            onClick={handleLoadMore}
          >
            {isNextPageLoading
              ? "Loading data..."
              : "Load more"}
          </button>
        </div>
      )}
      <div
        className={
          "flex w-full flex-nowrap items-center justify-between gap-2 opacity-75"
        }
      >
        <div className={"divider-horizontal"} />
        <span
          className={
            "w-fit whitespace-nowrap text-center text-xs"
          }
        >
          Total {totalItems} items
        </span>
        <div className={"divider-horizontal"} />
      </div>
    </>
  );
}

export default FileLayout;
