"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import { Schema_Breadcrumb } from "~/schema";
import { cn } from "~/utils";

import HeaderBreadcrumb from "./@header.breadcrumb";
import HeaderButton from "./@header.button";

type Props = {
  name: string;
  breadcrumb?: z.infer<typeof Schema_Breadcrumb>[];
};
export default function Header({ name, breadcrumb }: Props) {
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  return (
    <div
      className={cn(
        "w-full",
        "flex flex-col items-center justify-between gap-3",
      )}
    >
      <div
        className={cn(
          "w-full",
          "flex flex-grow items-center justify-between gap-3",
        )}
      >
        {/* <HeaderTitle loading={loading}>{name}</HeaderTitle> */}

        <HeaderBreadcrumb
          data={breadcrumb || []}
          loading={loading}
        />
        <HeaderButton loading={loading} />
      </div>
    </div>
  );
}
