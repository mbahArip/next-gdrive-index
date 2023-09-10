import { ReactNode } from "react";
import { twMerge } from "tailwind-merge";

interface ButtonGroupProps {
  children: ReactNode;
  fullWidth?: boolean;
  rounded?: "none" | "small" | "medium" | "large";
  className?: string;
}

export default function ButtonGroup(
  props: ButtonGroupProps,
) {
  const {
    children,
    fullWidth = false,
    rounded = "large",
    className,
  } = props;

  return (
    <div
      className={twMerge(
        "flex flex-row items-center justify-center overflow-hidden",
        fullWidth && "w-full",
        rounded === "none" && "rounded-none",
        rounded === "small" && "rounded-sm",
        rounded === "medium" && "rounded-md",
        rounded === "large" && "rounded-lg",
        className && className,
      )}
    >
      {children}
    </div>
  );
}
