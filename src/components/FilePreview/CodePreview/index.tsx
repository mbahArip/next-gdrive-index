import { TFile } from "@/types/googleapis";
import { drive_v3 } from "googleapis";
import { useEffect, useState } from "react";
import useSWR from "swr";
import LoadingFeedback from "@components/APIFeedback/Loading";
import ErrorFeedback from "@components/APIFeedback/Error";
import MarkdownRender from "@components/utility/MarkdownRender";
import fetcher from "@utils/swrFetch";
import { getCodeLanguage } from "@utils/mimeTypesHelper";

type Props = {
  data: TFile | drive_v3.Schema$File;
};

export default function CodePreview({ data }: Props) {
  const [codeContent, setCodeContent] = useState<string>("");
  const {
    data: swrData,
    error,
    isLoading,
  } = useSWR(`/download/${data.id}/${data.name}`, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    refreshWhenOffline: false,
    refreshWhenHidden: false,
    refreshInterval: 0,
    shouldRetryOnError: false,
    revalidateIfStale: true,
  });

  useEffect(() => {
    if (swrData) {
      const isObject = typeof swrData === "object";
      setCodeContent(
        `\`\`\`${getCodeLanguage(data.fileExtension as string)}\n${
          isObject ? JSON.stringify(swrData, null, 2) : swrData
        }\`\`\``,
      );
    }
  }, [swrData, data.fileExtension]);

  return (
    <div className='flex w-full items-center justify-center'>
      {isLoading ? (
        <LoadingFeedback
          message={"Loading code preview..."}
          useContainer={false}
        />
      ) : error ? (
        <ErrorFeedback
          message={error.message || "Failed to load code"}
          useContainer={false}
        />
      ) : (
        <div className={"w-full"}>
          <MarkdownRender content={codeContent} />
        </div>
      )}
    </div>
  );
}
