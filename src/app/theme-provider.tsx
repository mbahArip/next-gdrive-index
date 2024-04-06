"use client";

import { ThemeProvider as NextThemeProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";
import NextTopLoader from "nextjs-toploader";
import { Toaster } from "react-hot-toast";
import { cn } from "~/utils";

import { TooltipProvider } from "~/components/ui/tooltip";

import LayoutProvider from "~/context/layoutContext";

import config from "~/config/gIndex.config";

export default function ThemeProvider({
  children,
  ...props
}: ThemeProviderProps) {
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
              background: "hsl(var(--accent))",
              color: "hsl(var(--accent-foreground))",
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
