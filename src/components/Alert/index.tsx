import { Icon, IconifyIcon } from "@iconify/react";
import { twMerge } from "tailwind-merge";

interface AlertProps {
  variant?: "success" | "error" | "warning" | "info";
  icon?: string | IconifyIcon;
  title?: string;
  message: string;
  className?: string;
}
export default function Alert(props: AlertProps) {
  const {
    variant = "info",
    icon,
    title,
    message,
    className,
  } = props;
  return (
    <div
      className={twMerge(
        "w-full h-fit flex flex-col rounded-lg gap-1 px-4 py-2",
        variant === "success" &&
          "bg-success-100 text-success-main",
        variant === "error" &&
          "bg-danger-100 text-danger-main",
        variant === "warning" &&
          "bg-warning-100 text-warning-main",
        variant === "info" && "bg-info-100 text-info-main",
        className && className,
      )}
    >
      {(icon || title) && (
        <div className='flex gap-1 items-center'>
          {icon && (
            <Icon
              icon={icon}
              color='currentColor'
              width={24}
              height={24}
            />
          )}
          {title && (
            <span className='font-medium text-lg'>
              {title}
            </span>
          )}
        </div>
      )}
      <p className='text-sm'>{message}</p>
    </div>
  );
}
