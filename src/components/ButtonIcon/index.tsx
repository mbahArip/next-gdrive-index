import { Icon, IconifyIcon } from "@iconify/react";
import { ForwardRefRenderFunction, forwardRef } from "react";
import { twMerge } from "tailwind-merge";

interface ButtonIconProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: string | IconifyIcon;
  size?: "small" | "medium" | "large";
  variant?: "primary" | "accent" | "success" | "danger" | "warning" | "info" | "transparent";
  className?: string;
}

const ButtonIcon: ForwardRefRenderFunction<HTMLButtonElement, ButtonIconProps> = (props, ref) => {
  const { icon, size = "medium", variant = "primary", className, ...rest } = props;
  let iconSize = 24;
  switch (size) {
    case "small":
      iconSize = 16;
      break;
    case "medium":
      iconSize = 24;
      break;
    case "large":
      iconSize = 32;
  }

  return (
    <button
      ref={ref}
      className={twMerge(
        "outline-none border-none capitalize transition-smooth aspect-square",
        "focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-accent-500",
        "rounded-full flex items-center justify-center w-fit h-fit p-0",
        size === "small" && "w-6 h-6",
        size === "medium" && "w-8 h-8",
        size === "large" && "w-12 h-12",
        variant === "primary" && "bg-primary-600/25 text-primary-50 hover:bg-primary-500/50 active:bg-primary-700",
        variant === "accent" && "bg-accent-600/25 text-accent-50 hover:bg-accent-500/50 active:bg-accent-700",
        variant === "success" && "bg-success-600/25 text-success-50 hover:bg-success-500/50 active:bg-success-700",
        variant === "danger" && "bg-danger-600/25 text-danger-50 hover:bg-danger-500/50 active:bg-danger-700",
        variant === "warning" && "bg-warning-600/25 text-warning-50 hover:bg-warning-500/50 active:bg-warning-700",
        variant === "info" && "bg-info-600/25 text-info-50 hover:bg-info-500/50 active:bg-info-700",
        variant === "transparent" && "bg-transparent text-primary-50 hover:bg-primary-500/50 active:bg-primary-700",
        props.disabled && "opacity-50 cursor-not-allowed",
        className && className,
      )}
      {...rest}
    >
      <Icon
        icon={icon}
        color='white'
        width={iconSize}
        height={iconSize}
      />
    </button>
  );
};

export default forwardRef(ButtonIcon);
