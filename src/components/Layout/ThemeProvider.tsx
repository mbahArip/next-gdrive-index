"use client";

import { ThemeProvider as NextThemeProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";
import NextTopLoader from "nextjs-toploader";
import { Toaster } from "react-hot-toast";

import { TooltipProvider } from "~/components/ui/tooltip";

import LayoutProvider from "~/context/layoutContext";
import { cn } from "~/utils/cn";

import config from "config";

export default function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <LayoutProvider>
      <NextTopLoader color='hsl(var(--primary))' />
      <NextThemeProvider {...props}>
        <TooltipProvider delayDuration={250}>
          <div
            vaul-drawer-wrapper=''
            className={cn(
              "bg-background font-sans text-foreground",
              "h-full min-h-screen w-full",
              "flex flex-col items-start",
              // "tablet:flex-row",
              "pr-1.5",
            )}
          >
            {children}
          </div>
        </TooltipProvider>

        <Toaster
          position={config.siteConfig.toaster?.position}
          toastOptions={{
            style: {
              background: "hsl(var(--background))",
              color: "hsl(var(--foreground))",
              borderRadius: "var(--radius)",
              border: "1px solid hsl(var(--border))",
            },
            duration: config.siteConfig.toaster?.duration,
            loading: {
              duration: 0,
            },
          }}
        />
      </NextThemeProvider>
    </LayoutProvider>
  );
}
