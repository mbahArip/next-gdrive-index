"use client";

import { type LucideProps, icons } from "lucide-react";
import { Fragment, useCallback } from "react";

import { cn } from "~/lib/utils";

export type IconName = keyof typeof icons;
export const IconNamesArray = Object.keys(icons) as [IconName, ...IconName[]];

type Props = {
  name: keyof typeof icons;
  className?: string;
  hideWrapper?: true;
  wrapperProps?: React.HTMLAttributes<HTMLSpanElement>;
} & LucideProps;

export default function Icon({ name, className, hideWrapper, wrapperProps, ...props }: Props) {
  const LucideIcon = icons[name];
  const { className: wrapperClassName, ...restWrapperProps } = wrapperProps ?? {};
  // const Wrapper = hideWrapper ? Fragment : "span";
  const Wrapper = useCallback<React.FC<React.HTMLAttributes<HTMLSpanElement>>>(
    () =>
      hideWrapper ? (
        <Fragment>
          <LucideIcon
            className={cn("size-4 stroke-current", className)}
            {...props}
          />
        </Fragment>
      ) : (
        <span
          className={cn("grid aspect-square h-fit w-fit place-items-center", wrapperClassName)}
          {...restWrapperProps}
        >
          <LucideIcon
            className={cn("size-4 stroke-current", className)}
            {...props}
          />
        </span>
      ),
    [hideWrapper, wrapperClassName, restWrapperProps, LucideIcon, className, props],
  );

  return <Wrapper />;
}
