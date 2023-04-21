import { FilesResponse } from "@/types/googleapis";
import ListFile from "@components/File/List";
import { drive_v3 } from "googleapis";
import EmptyFeedback from "@components/APIFeedback/Empty";

type Props = {
  data: FilesResponse | undefined;
  pagination: {
    swrData: FilesResponse[] | undefined;
    size: number;
    setSize: (size: number) => Promise<FilesResponse[] | undefined>;
    isLoadingMore: boolean | undefined;
    isReachingEnd: boolean | undefined;
  };
};

export default function ListLayout({ data, pagination }: Props) {
  const { swrData, isLoadingMore, isReachingEnd, size, setSize } = pagination;

  if (!data) return null;

  return (
    <>
      {/* Head */}
      <div
        className={"grid grid-cols-1 gap-2 px-4 font-bold tablet:grid-cols-8"}
      >
        <div className={"tablet:col-span-4"}>Name</div>
        <div className={"hidden tablet:col-span-2 tablet:block"}>Modified</div>
        <div className={"hidden tablet:block"}>Size</div>
        <div className={"hidden tablet:block"}>Action</div>
      </div>

      <div className={"divider-horizontal"} />

      {/* Items */}
      <div className={"grid grid-cols-1 gap-2 tablet:grid-cols-8"}>
        {data?.folders.length === 0 && data?.files.length === 0 && (
          <div className={"col-span-full"}>
            <EmptyFeedback />
          </div>
        )}

        {data.folders.map((folder) => (
          <ListFile
            data={folder as drive_v3.Schema$File}
            key={folder.id}
          />
        ))}

        {data!.files.map((file) => (
          <ListFile
            data={file as drive_v3.Schema$File}
            key={file.id}
          />
        ))}
      </div>
      {swrData?.[0].nextPageToken && !isReachingEnd && (
        <button
          disabled={isLoadingMore}
          onClick={() => {
            setSize(size + 1);
          }}
          className='w-full rounded-lg'
        >
          {isLoadingMore ? "Loading..." : "Load more file"}
        </button>
      )}
    </>
  );
}
