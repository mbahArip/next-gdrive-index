"use client";

import { icons } from "lucide-react";

import { Icon } from "~/components/Global";

import { cn } from "~/utils/cn";

type Props = {
  icon: keyof typeof icons;
  message?: string;
  destructive?: boolean;
};

export default function Status({ icon, message, destructive }: Props) {
  return (
    <div
      className={cn(
        "h-auto min-h-[33dvh] w-full",
        "flex flex-grow flex-col items-center justify-center gap-3",
        destructive ? "text-destructive" : "text-foreground",
      )}
    >
      <Icon
        name={icon}
        size={"1.5rem"}
      />
      <p>{message || "Something went wrong"}</p>
    </div>
  );
}
