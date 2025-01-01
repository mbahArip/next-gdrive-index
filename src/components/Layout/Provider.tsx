"use client";

import { type TooltipProviderProps } from "@radix-ui/react-tooltip";
import { ThemeProvider, type ThemeProviderProps } from "next-themes";
import NextTopLoader, { type NextTopLoaderProps } from "nextjs-toploader";
import { useEffect } from "react";
import { type ToasterProps } from "sonner";

import UseConfirmDialogProvider from "~/context/confirmProvider";
import { LayoutProvider } from "~/context/layoutContext";
import { ResponsiveProvider } from "~/context/responsiveContext";

import { Toaster } from "../ui/sonner";
import { TooltipProvider } from "../ui/tooltip";

type Props = {
  loader?: NextTopLoaderProps;
  theme?: ThemeProviderProps;
  tooltip?: Omit<TooltipProviderProps, "children">;
  toaster?: ToasterProps;
};
export default function Provider(props: React.PropsWithChildren<Props>) {
  useEffect(() => {
    const anchors = document.querySelectorAll("a");
    console.log(anchors);
  }, []);

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
                vaul-drawer-wrapper=''
                className='flex h-full min-h-screen w-full flex-col items-start bg-background font-sans text-foreground'
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
