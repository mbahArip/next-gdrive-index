"use client";

import ErrorComponent from "~/components/layout/Error";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset?: () => void }) {
  return (
    <ErrorComponent
      error={error}
      reset={reset}
    />
  );
}
