"use client";

import { LucideProps, icons } from "lucide-react";
import { ReactElement } from "react";

type Props = {
  name: keyof typeof icons;
  wrapper?: ReactElement<"div">;
} & LucideProps;

export default function Icon({ name, wrapper, ...props }: Props) {
  const LucideIcon = icons[name];

  return (
    <div {...wrapper}>
      <LucideIcon {...props} />
    </div>
  );
}
