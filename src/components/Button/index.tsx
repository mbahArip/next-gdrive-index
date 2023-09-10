import { Icon, IconifyIcon } from "@iconify/react";
import { ReactNode } from "react";
import { twMerge } from "tailwind-merge";

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  fullWidth?: boolean;
  variant?:
    | "primary"
    | "accent"
    | "success"
    | "danger"
    | "warning"
    | "info"
    | "transparent";
  size?: "small" | "medium" | "large";
  pill?: boolean;
  square?: boolean;
  rounded?: "none" | "small" | "medium" | "large";
  startIcon?: string | IconifyIcon;
  endIcon?: string | IconifyIcon;
  children: ReactNode;
  loading?: boolean;
  className?: string;
}

export default function Button(props: ButtonProps) {
  const {
    fullWidth = false,
    variant = "primary",
    size = "medium",
    pill = false,
    square = false,
    rounded = "none",
    loading = false,
    startIcon,
    endIcon,
    children,
    className,
    ...rest
  } = props;

  return (
    <button
      className={twMerge(
        "outline-none border-none capitalize transition-smooth",
        "focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-accent-500",
        "rounded-lg w-fit flex items-center justify-center flex-grow",
        fullWidth && "w-full",
        rounded === "none" && "rounded-none",
        rounded === "small" && "rounded-sm",
        rounded === "medium" && "rounded-md",
        rounded === "large" && "rounded-lg",
        pill && "rounded-full",
        size === "small" && "px-2 py-1 text-sm gap-1",
        size === "medium" && "px-4 py-2 text-base gap-2",
        size === "large" && "px-8 py-4 text-lg gap-4",
        square && "aspect-square",
        variant === "primary" &&
          "bg-primary-600 text-primary-50 hover:bg-primary-500 active:bg-primary-700",
        variant === "accent" &&
          "bg-accent-600 text-accent-50 hover:bg-accent-500 active:bg-accent-700",
        variant === "success" &&
          "bg-success-600 text-success-50 hover:bg-success-500 active:bg-success-700",
        variant === "danger" &&
          "bg-danger-600 text-danger-50 hover:bg-danger-500 active:bg-danger-700",
        variant === "warning" &&
          "bg-warning-600 text-warning-50 hover:bg-warning-500 active:bg-warning-700",
        variant === "info" &&
          "bg-info-600 text-info-50 hover:bg-info-500 active:bg-info-700",
        variant === "transparent" &&
          "bg-transparent text-primary-50 hover:bg-primary-500 active:bg-primary-700",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-primary-700 disabled:hover:bg-primary-700 disabled:active:bg-primary-700 disabled:text-primary-50",
        className && className,
      )}
      disabled={loading ?? props.disabled}
      {...rest}
    >
      {props.loading ? (
        <Icon
          icon={"mdi:loading"}
          color='white'
          className={twMerge(
            "w-5 h-5 animate-spin",
            size === "small" && "w-4 h-4",
            size === "medium" && "w-5 h-5",
            size === "large" && "w-6 h-6",
          )}
        />
      ) : (
        <>
          {startIcon && (
            <Icon
              icon={startIcon}
              color='white'
              className={twMerge(
                "w-5 h-5",
                size === "small" && "w-4 h-4",
                size === "medium" && "w-5 h-5",
                size === "large" && "w-6 h-6",
              )}
            />
          )}
          {children}
          {endIcon && (
            <Icon
              icon={endIcon}
              color='white'
              className={twMerge(
                "w-5 h-5",
                size === "small" && "w-4 h-4",
                size === "medium" && "w-5 h-5",
                size === "large" && "w-6 h-6",
              )}
            />
          )}
        </>
      )}
    </button>
  );
}
