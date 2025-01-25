"use client";

import { type icons } from "lucide-react";

import Icon from "~/components/ui/icon";

import { cn } from "~/lib/utils";

type Props = {
  icon: keyof typeof icons;
  iconClassName?: string;
  message?: string;
  destructive?: boolean;
};

export default function Status({ icon, iconClassName, message, destructive }: Props) {
  return (
    <div
      className={cn(
        "h-fit min-h-[33dvh] w-full",
        "flex flex-col items-center justify-center gap-2",
        destructive ? "stroke-destructive text-destructive" : "stroke-muted-foreground text-muted-foreground",
      )}
    >
      <Icon
        name={icon}
        className={cn("size-10", iconClassName)}
      />
      <p>{message ?? "Something went wrong"}</p>
    </div>
  );
}
