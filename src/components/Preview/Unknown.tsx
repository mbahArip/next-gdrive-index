"use client";

import { Loader, Status } from "~/components/Global";

import useLoading from "~/hooks/useLoading";

export default function PreviewUnknown() {
  const loading = useLoading();

  if (loading) return <Loader message='Loading content...' />;

  return (
    <Status
      icon='Frown'
      message='This file type is not supported for preview, try downloading the file instead.'
    />
  );
}
