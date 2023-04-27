import { formatDuration } from "@/utils/formatHelper";
import { drive_v3 } from "googleapis";
import Link from "next/link";
import { MdPlayCircleFilled } from "react-icons/md";
import { getFileIcon } from "@utils/mimeTypesHelper";
import { BsFolderFill } from "react-icons/bs";

type Props = {
  data: drive_v3.Schema$File;
};

export default function GridFile({ data }: Props) {
  const isFolder = data.mimeType === "application/vnd.google-apps.folder";
  // const Icon = getMimeIcon(data.mimeType as string);
  const Icon = isFolder
    ? BsFolderFill
    : getFileIcon(data.fileExtension as string, data.mimeType as string);

  return (
    <Link
      href={isFolder ? `/folder/${data.id}` : `/file/${data.id}`}
      key={data.id}
      className={"hover:opacity-100"}
      title={data.name as string}
    >
      <div className='items relative mx-auto h-32 w-32'>
        {data.thumbnailLink ? (
          <div
            className={
              "group relative mx-auto h-full w-full opacity-90 transition-opacity hover:opacity-100"
            }
          >
            <img
              className='h-full w-full rounded-lg bg-zinc-950/10 object-cover transition duration-300 ease-in-out'
              src={data.thumbnailLink}
              alt={data.name as string}
            />
            {data.videoMediaMetadata && (
              <>
                <MdPlayCircleFilled className='center absolute h-8 w-8 text-white/50 transition-colors duration-300 group-hover:text-white/80' />
                <span className='absolute bottom-0 right-0 rounded-lg rounded-bl-none rounded-tr-none bg-zinc-950/75 px-1 py-0.5 text-xs text-white'>
                  {formatDuration(data.videoMediaMetadata.durationMillis || 0)}
                </span>
              </>
            )}
          </div>
        ) : (
          <Icon className='h-full w-full p-8 transition-none' />
        )}
      </div>
      <div className={"flex items-center justify-center gap-2"}>
        {/*<Icon className='h-4 w-4 flex-shrink-0' />*/}
        <span className='my-2 line-clamp-2 w-fit break-words text-center text-sm'>
          {data.name}
        </span>
      </div>
    </Link>
  );
}
