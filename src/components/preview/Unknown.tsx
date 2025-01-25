"use client";

import { Status } from "~/components/global";
import { PageLoader } from "~/components/layout";

import useLoading from "~/hooks/useLoading";

export default function PreviewUnknown() {
  const loading = useLoading();

  if (loading) return <PageLoader message='Loading content...' />;

  return (
    <Status
      icon='Frown'
      message='This file type is not supported for preview, try downloading the file instead.'
    />
  );
}
