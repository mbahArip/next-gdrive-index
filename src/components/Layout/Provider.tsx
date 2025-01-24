"use client";

import { type TooltipProviderProps } from "@radix-ui/react-tooltip";
import { ThemeProvider, type ThemeProviderProps } from "next-themes";
import { usePathname } from "next/navigation";
import NextTopLoader, { type NextTopLoaderProps } from "nextjs-toploader";
import { type ToasterProps } from "sonner";

import { Toaster } from "~/components/ui/sonner";
import { TooltipProvider } from "~/components/ui/tooltip";

import UseConfirmDialogProvider from "~/context/confirmProvider";
import { LayoutProvider } from "~/context/layoutContext";
import { ResponsiveProvider } from "~/context/responsiveContext";
import { cn } from "~/lib/utils";

type Props = {
  loader?: NextTopLoaderProps;
  theme?: ThemeProviderProps;
  tooltip?: Omit<TooltipProviderProps, "children">;
  toaster?: ToasterProps;
};
export default function Provider(props: React.PropsWithChildren<Props>) {
  const pathname = usePathname();
  return (
    <ThemeProvider {...props.theme}>
      <LayoutProvider>
        <ResponsiveProvider>
          <NextTopLoader
            color='hsl(var(--primary))'
            {...props.loader}
          />
          <UseConfirmDialogProvider>
            <TooltipProvider {...props.tooltip}>
              <div
                className={cn(
                  "flex w-full flex-col items-start font-sans text-foreground",
                  pathname.startsWith("/ngdi-internal/embed/") ? "h-fit" : "h-full min-h-screen",
                )}
              >
                {props.children}
              </div>
            </TooltipProvider>

            <Toaster {...props.toaster} />
          </UseConfirmDialogProvider>
        </ResponsiveProvider>
      </LayoutProvider>
    </ThemeProvider>
  );
}
