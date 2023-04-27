import { TFile } from "@/types/googleapis";
import { drive_v3 } from "googleapis";
import ErrorFeedback from "@components/APIFeedback/Error";

type Props = {
  data: TFile | drive_v3.Schema$File;
};

export default function DefaultPreview({ data }: Props) {
  return (
    <div className='flex h-full flex-col items-center justify-center'>
      <ErrorFeedback
        message={`.${data.fileExtension} file is currently not supported. Please download the file to view it.`}
      />
    </div>
  );
}
