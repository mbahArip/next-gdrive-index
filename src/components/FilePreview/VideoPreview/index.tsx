import { drive_v3 } from "googleapis";
import ReactPlayer from "react-player";
import { createFileId } from "utils/driveHelper";

type Props = {
  data: drive_v3.Schema$File;
};

export default function VideoPreview({ data }: Props) {
  const fileId = createFileId(data);

  return (
    <div className='flex w-full items-center justify-center'>
      <div className={`aspect-video h-full max-h-[70vh] w-full`}>
        <ReactPlayer
          url={`/api/files/${fileId}?download=1`}
          controls={true}
          width='100%'
          height='100%'
        />
      </div>
    </div>
  );
}
