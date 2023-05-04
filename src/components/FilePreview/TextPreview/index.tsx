import { TFile } from "types/googleapis";
import { drive_v3 } from "googleapis";
import useSWR from "swr";
import LoadingFeedback from "components/APIFeedback/Loading";
import ErrorFeedback from "components/APIFeedback/Error";
import MarkdownRender from "components/utility/MarkdownRender";
import fetcher from "utils/swrFetch";

type Props = {
  data: TFile | drive_v3.Schema$File;
};

export default function TextPreview({ data }: Props) {
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
          <MarkdownRender content={swrData as string} />
        </div>
      )}
    </div>
  );
}
