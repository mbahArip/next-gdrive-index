import { drive_v3 } from "googleapis";
import { useEffect, useState } from "react";
import useSWR from "swr";
import MarkdownRender from "components/utility/MarkdownRender";
import { getCodeLanguage } from "utils/mimeTypesHelper";
import { createFileId } from "utils/driveHelper";
import SWRLayout from "components/layout/SWRLayout";

type Props = {
  data: drive_v3.Schema$File;
};

export default function CodePreview({ data }: Props) {
  const [codeContent, setCodeContent] = useState<string>("");

  const fileId = createFileId(data);
  const {
    data: swrData,
    isLoading,
    error,
  } = useSWR(`/api/files/${fileId}?download=1`);

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
      <SWRLayout
        data={codeContent}
        error={error}
        isLoading={isLoading}
      >
        <div className={"w-full"}>
          <MarkdownRender content={codeContent} />
        </div>
      </SWRLayout>
    </div>
  );
}
