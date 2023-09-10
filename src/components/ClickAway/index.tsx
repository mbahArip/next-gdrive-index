import { ReactNode, useEffect } from "react";
import { twMerge } from "tailwind-merge";

interface ClickAwayProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  open: boolean;
  onClickAway: (e: any) => void;
  className?: string;
}
export default function ClickAway(props: ClickAwayProps) {
  const { children, open, onClickAway, className, ...rest } = props;

  useEffect(() => {
    const body = document.querySelector("body");
    const isScrollbarRendered = document.documentElement.clientHeight < document.documentElement.scrollHeight;
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    if (open && isScrollbarRendered) {
      body?.style.setProperty("overflow", "hidden");
      if (!isMobile) body?.style.setProperty("padding-right", "4px");
    } else {
      body?.style.removeProperty("overflow");
      if (!isMobile) body?.style.removeProperty("padding-right");
    }
  }, [open]);

  return (
    <div
      className={twMerge(
        "w-full h-full bg-primary-950/50 backdrop-blur-none transition-smooth",
        className && className,
      )}
      onClick={onClickAway}
      {...rest}
    >
      {children}
    </div>
  );
}
