"use client";

import { type TooltipProviderProps } from "@radix-ui/react-tooltip";
import { ThemeProvider, type ThemeProviderProps } from "next-themes";
import { usePathname } from "next/navigation";
import NextTopLoader, { type NextTopLoaderProps } from "nextjs-toploader";
import { type ToasterProps } from "sonner";

import UseConfirmDialogProvider from "~/context/confirmProvider";
import { LayoutProvider } from "~/context/layoutContext";
import { ResponsiveProvider } from "~/context/responsiveContext";
import { cn } from "~/lib/utils";

import { Toaster } from "../ui/sonner";
import { TooltipProvider } from "../ui/tooltip";

type Props = {
  loader?: NextTopLoaderProps;
  theme?: ThemeProviderProps;
  tooltip?: Omit<TooltipProviderProps, "children">;
  toaster?: ToasterProps;
};
export default function Provider(props: React.PropsWithChildren<Props>) {
  const pathname = usePathname();
  return (
    <LayoutProvider>
      <ResponsiveProvider>
        <NextTopLoader
          color='hsl(var(--primary))'
          {...props.loader}
        />
        <ThemeProvider {...props.theme}>
          <UseConfirmDialogProvider>
            <TooltipProvider {...props.tooltip}>
              <div
                className={cn(
                  "flex w-full flex-col items-start font-sans text-foreground",
                  pathname.startsWith("/_/embed/") ? "h-fit" : "h-full min-h-screen",
                )}
              >
                {props.children}
              </div>
            </TooltipProvider>

            <Toaster {...props.toaster} />
          </UseConfirmDialogProvider>
        </ThemeProvider>
      </ResponsiveProvider>
    </LayoutProvider>
  );
}
