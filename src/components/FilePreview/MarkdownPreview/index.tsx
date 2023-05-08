import { drive_v3 } from "googleapis";
import useSWR from "swr";
import MarkdownRender from "components/utility/MarkdownRender";
import { createFileId } from "utils/driveHelper";
import SWRLayout from "components/layout/SWRLayout";

type Props = {
  data: drive_v3.Schema$File;
};

export default function MarkdownPreview({ data }: Props) {
  const fileId = createFileId(data);
  const {
    data: swrData,
    error,
    isLoading,
  } = useSWR(`/api/files/${fileId}?download=1`);

  return (
    <div className='flex w-full items-center justify-center'>
      <SWRLayout
        data={swrData}
        error={error}
        isLoading={isLoading}
        useCard={false}
      >
        <div className={"w-full"}>
          <MarkdownRender content={swrData as string} />
        </div>
      </SWRLayout>
    </div>
  );
}
