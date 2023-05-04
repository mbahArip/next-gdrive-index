import { FilesResponse } from "types/googleapis";
import GridFile from "components/File/Grid";
import { drive_v3 } from "googleapis";
import EmptyFeedback from "components/APIFeedback/Empty";

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

export default function GridLayout({ data, pagination }: Props) {
  const { swrData, isLoadingMore, isReachingEnd, size, setSize } = pagination;
  return (
    <>
      {data?.folders.length === 0 && data?.files.length === 0 && (
        <EmptyFeedback />
      )}

      {data!.folders.length > 0 && (
        <>
          <div className='flex w-full items-center justify-between rounded-lg px-4'>
            <span className='font-bold'>Folders</span>
          </div>
          <div
            id={"grid-folders"}
            className='my-4 grid grid-cols-2 gap-4  tablet:grid-cols-5 desktop:grid-cols-7'
          >
            {data?.folders.length === 0 ? (
              <div className='col-span-full mb-4 flex w-full items-center justify-center'>
                <span className='text-gray-500'>No folders</span>
              </div>
            ) : (
              <>
                {data?.folders?.map((folder) => (
                  <GridFile
                    data={folder as drive_v3.Schema$File}
                    key={folder.id}
                  />
                ))}
              </>
            )}
          </div>
        </>
      )}

      {data!.folders.length > 0 && data!.files.length > 0 && (
        <div className='divider-horizontal' />
      )}

      {data!.files.length > 0 && (
        <>
          <div className='flex w-full items-center justify-between rounded-lg px-4'>
            <span className='font-bold'>Files</span>
          </div>
          <div
            id={"grid-files"}
            className='my-4 grid grid-cols-2 gap-4  tablet:grid-cols-5 desktop:grid-cols-7'
          >
            {data?.files.length === 0 ? (
              <div className='col-span-full mb-4 flex w-full items-center justify-center'>
                <span className='text-gray-500'>No files</span>
              </div>
            ) : (
              <>
                {data?.files.map((file, idx) => (
                  <GridFile
                    data={file as drive_v3.Schema$File}
                    key={`File-idx${idx}`}
                  />
                ))}
              </>
            )}
          </div>
        </>
      )}

      {swrData?.[0].nextPageToken && !isReachingEnd && (
        <button
          disabled={isLoadingMore}
          onClick={() => {
            setSize(size + 1).then((r) => r);
          }}
          className='w-full rounded-lg'
        >
          {isLoadingMore ? "Loading..." : "Load more file"}
        </button>
      )}
    </>
  );
}
