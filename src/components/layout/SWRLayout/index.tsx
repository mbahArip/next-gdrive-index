import React, { useEffect, useState } from "react";
import LoadingFeedback from "components/APIFeedback/Loading";
import ErrorFeedback from "components/APIFeedback/Error";

type Props = {
  data: unknown;
  error: unknown;
  isLoading: boolean;
  children: React.ReactNode;
};

export default function SWRLayout({ data, error, isLoading, children }: Props) {
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    if (!isLoading && !error && data) {
      setIsMounted(true);
    }
  }, [data, error, isLoading]);

  return (
    <>
      {isLoading && <LoadingFeedback />}
      {!isLoading && error && <ErrorFeedback />}
      {isMounted && <>{children}</>}
    </>
  );
}
