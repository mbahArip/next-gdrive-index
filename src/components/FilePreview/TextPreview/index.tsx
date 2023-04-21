import { TFile } from "@/types/googleapis";
import { drive_v3 } from "googleapis";

type Props = {
  data: TFile | drive_v3.Schema$File;
};

export default function TextPreview({ data }: Props) {
  return (
    <div className='flex w-full items-center justify-center'>Text Preview</div>
  );
}
