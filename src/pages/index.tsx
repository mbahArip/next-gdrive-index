import { useContext, useEffect, useState } from "react";
import DefaultLayout from "components/layout/DefaultLayout";
import { LayoutContext, TLayoutContext } from "context/layoutContext";
import useSWRInfinite from "swr/infinite";
import { buildNextKey } from "utils/swrFetch";
import axios, { AxiosHeaders } from "axios";
import { BannerResponse, ErrorResponse, FilesResponse } from "types/googleapis";
import SWRLayout from "components/layout/SWRLayout";
import { drive_v3 } from "googleapis";
import siteConfig from "config/site.config";
import Readme from "components/layout/Readme";
import GridLayout from "components/layout/Files/GridLayout";
import ListLayout from "components/layout/Files/ListLayout";
import { createFileId } from "utils/driveHelper";
import { NextSeo } from "next-seo";
import { GetServerSideProps } from "next";

// type Props = {
//   bannerFileId?: string;
// };
export default function Home() {
  const { layout } = useContext<TLayoutContext>(LayoutContext);
  const [data, setData] = useState<FilesResponse>();

  const [isReadmeExists, setIsReadmeExists] = useState<boolean>(false);
  const [isReadmeLoading, setIsReadmeLoading] = useState<boolean>(false);
  const [readmeData, setReadmeData] = useState<string>();

  /**
   * ===========================
   * START - fetch file data
   * ===========================
   * **/
  const getNextKey = buildNextKey("/api/files");
  const {
    data: swrData,
    error,
    isLoading,
    size,
    setSize,
  } = useSWRInfinite<FilesResponse, ErrorResponse>(
    getNextKey,
    (url: string, headers: AxiosHeaders) =>
      axios
        .get<FilesResponse>(url, {
          headers: {
            ...headers,
          },
        })
        .then((res) => res.data),
  );

  const filePagination = {
    isLoadingInitialData: !swrData && !error,
    isLoadingMore:
      (!swrData && !error) ||
      (size > 0 && swrData && typeof swrData[size - 1] === "undefined"),
    isEmpty: swrData?.[0]?.files?.length === 0,
    isReachingEnd:
      swrData && swrData[swrData.length - 1]?.nextPageToken === undefined,
  };

  // Since SWRInfinite returning array of response, we need to flatten it.
  useEffect(() => {
    if (swrData) {
      // Flatten files and folders, in case someone have more folders too.
      const files: drive_v3.Schema$File[] = swrData.flatMap(
        (item) => item.files,
      );
      const folders: drive_v3.Schema$File[] = swrData.flatMap(
        (item) => item.folders,
      );
      const flattenData: FilesResponse = {
        ...swrData[size - 1],
        files,
        folders,
      };
      setData(flattenData);

      if (flattenData.isReadmeExists) {
        setIsReadmeExists(true);
        setIsReadmeLoading(true);
        // Since it's on root folder, we can fetch from readme api without id.
        axios
          .get<string>(`/api/readme`)
          .then((res) => {
            setReadmeData(res.data);
          })
          .finally(() => {
            setIsReadmeLoading(false);
          });
      }
    }
  }, [swrData, size]);
  /**
   * ===========================
   * END - fetch file data
   * ===========================
   * **/

  return (
    <DefaultLayout fileId={"root"}>
      <NextSeo
        openGraph={{
          images: [
            {
              url: `${process.env.NEXT_PUBLIC_DOMAIN}/api/og-folder`,
              alt: siteConfig.siteName,
              width: 1200,
              height: 630,
            },
          ],
        }}
      />
      <SWRLayout
        data={data}
        error={error}
        isLoading={isLoading}
      >
        {siteConfig.readme.position === "start" && (
          <Readme
            isReadmeExist={isReadmeExists}
            isReadmeLoading={isReadmeLoading}
            readmeData={readmeData}
          />
        )}
        <div className={"card"}>
          {layout === "grid" && (
            <GridLayout
              data={data}
              pagination={{
                swrData,
                size,
                setSize,
                isLoadingMore: filePagination.isLoadingMore,
                isReachingEnd: filePagination.isReachingEnd,
              }}
            />
          )}
          {layout === "list" && (
            <ListLayout
              data={data}
              pagination={{
                swrData,
                size,
                setSize,
                isLoadingMore: filePagination.isLoadingMore,
                isReachingEnd: filePagination.isReachingEnd,
              }}
            />
          )}
        </div>
        {siteConfig.readme.position === "end" && (
          <Readme
            isReadmeExist={isReadmeExists}
            isReadmeLoading={isReadmeLoading}
            readmeData={readmeData}
          />
        )}
      </SWRLayout>
    </DefaultLayout>
  );
}

// export const getServerSideProps: GetServerSideProps = async () => {
//   const fetchBanner = await axios.get<BannerResponse>(
//     `${process.env.NEXT_PUBLIC_DOMAIN}/api/banner`,
//   );
//   if (!fetchBanner.data.banner) {
//     return {
//       props: {},
//     };
//   }
//
//   const bannerFileId = createFileId(fetchBanner.data.banner, true);
//   return {
//     props: {
//       bannerFileId,
//     },
//   };
// };
