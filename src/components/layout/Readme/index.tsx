import LoadingFeedback from "components/APIFeedback/Loading";
import MarkdownRender from "components/utility/MarkdownRender";
import { useEffect, useState } from "react";

type Props = {
  isReadmeExist: boolean;
  isReadmeLoading: boolean;
  readmeData: string | undefined;
};

export default function Readme({
  isReadmeExist,
  isReadmeLoading,
  readmeData,
}: Props) {
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    if (!isReadmeLoading && isReadmeExist && readmeData) {
      setIsMounted(true);
    }
  }, [isReadmeExist, isReadmeLoading, readmeData]);

  if (!isMounted) return <></>;
  return (
    <div className={"card"}>
      {isReadmeLoading && <LoadingFeedback useContainer={false} />}
      {!isReadmeLoading && readmeData && (
        <MarkdownRender content={readmeData} />
      )}
    </div>
  );
}
