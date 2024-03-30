import axios from "axios";
import gIndexConfig from "config";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import ExplorerLayout from "components/Layout/Explorer";
import LoaderLayout from "components/Layout/Loader";

import { IGDriveFiles } from "types/api/files";
import {
  APIGetFileResponse,
  APIGetReadmeResponse,
} from "types/api/response";

interface StateDataProps {
  file: IGDriveFiles | null;
  files: IGDriveFiles[];
  folders: IGDriveFiles[];
  pageToken: string | null;
}
export default function RootPage() {
  const router = useRouter();
  const [data, setData] = useState<StateDataProps>({
    file: null,
    files: [],
    folders: [],
    pageToken: null,
  });
  const [readmeFile, setReadmeFile] = useState<
    string | null
  >(null);
  const [isLoadingData, setIsLoadingData] =
    useState<boolean>(true);

  useEffect(() => {
    setIsLoadingData(true);
    const _getData =
      axios.get<APIGetFileResponse>("/api/getData");
    const _getReadme = axios.get<APIGetReadmeResponse>(
      "/api/getReadme",
    );

    Promise.all([_getData, _getReadme])
      .then(([fileData, readmeData]) => {
        // Assign files
        setData(fileData.data.data);

        // Fetch readme
        setReadmeFile(readmeData.data.data);
      })
      .catch((err) => {
        console.error(err);
        throw new Error(err);
      })
      .finally(() => {
        setIsLoadingData(false);
      });
  }, []);

  return (
    <LoaderLayout>
      {isLoadingData ? (
        <div className='w-full h-full flex items-center justify-center'>
          <div className='flex flex-col gap-4 items-center justify-center animate-pulse'>
            <div className='w-fit h-fit relative grid place-items-center'>
              <img
                src={gIndexConfig.siteConfig.siteIcon}
                alt={gIndexConfig.siteConfig.siteName}
                className='w-12 -top-1 relative'
              />
              <div className='absolute w-12 h-12 bg-transparent border border-primary-50 rounded-full animate-ping' />
            </div>
            <span>Fetching folder contents...</span>
          </div>
        </div>
      ) : (
        <ExplorerLayout
          key={router.asPath}
          data={data}
          readmeFile={readmeFile}
          // If you want the root to be protected, use Private index instead
          isProtected={false}
        />
      )}
    </LoaderLayout>
  );
}
