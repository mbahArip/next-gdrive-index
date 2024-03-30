"use client";

import { ThemeProvider as NextThemeProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";
import { Toaster } from "react-hot-toast";
import { TooltipProvider } from "~/components/ui/tooltip";
import config from "~/config/gIndex.config";
import LayoutProvider from "~/context/layoutContext";

export default function ThemeProvider({
  children,
  ...props
}: ThemeProviderProps) {
  return (
    <LayoutProvider>
      <NextThemeProvider {...props}>
        <TooltipProvider delayDuration={250}>{children}</TooltipProvider>

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
