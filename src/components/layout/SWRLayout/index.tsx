import React, { useEffect, useState } from "react";
import LoadingFeedback from "components/APIFeedback/Loading";
import ErrorFeedback from "components/APIFeedback/Error";

type Props = {
  data: unknown;
  error: unknown;
  isLoading: boolean;
  useCard?: boolean;
  children: React.ReactNode;
};

export default function SWRLayout({
  data,
  error,
  isLoading,
  useCard = true,
  children,
}: Props) {
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    if (!isLoading && !error && data) {
      setIsMounted(true);
    }
  }, [data, error, isLoading]);

  return (
    <>
      {isLoading && (
        <div className={useCard ? "card" : ""}>
          <LoadingFeedback />
        </div>
      )}
      {!isLoading && error && (
        <div className={useCard ? "card" : ""}>
          <ErrorFeedback />
        </div>
      )}
      {!isLoading && isMounted && <>{children}</>}
    </>
  );
}
