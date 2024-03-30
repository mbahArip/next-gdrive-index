import { Metadata } from "next";
import { JetBrains_Mono, Source_Sans_3 } from "next/font/google";
import config from "~/config/gIndex.config";
import { cn } from "~/utils";

import Footer from "./@footer";
import Navbar from "./@navbar";
import Password from "./@password";
import { CheckSitePassword } from "./actions";
import "./globals.css";
import "./markdown.css";
import ThemeProvider from "./theme-provider";

const sourceSans3 = Source_Sans_3({
  weight: ["300", "400", "600", "700"],
  style: ["normal", "italic"],
  display: "auto",
  subsets: ["latin", "latin-ext"],
  variable: "--font-source-sans-3",
});
const jetbrainsMono = JetBrains_Mono({
  weight: ["300", "400", "600", "700"],
  style: ["normal", "italic"],
  display: "auto",
  subsets: ["latin", "latin-ext"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL(config.basePath),
  title: {
    default: config.siteConfig.siteName,
    template: config.siteConfig.siteNameTemplate || "%s",
  },
  description: config.siteConfig.siteDescription,
  authors: config.siteConfig.siteAuthor
    ? {
        name: config.siteConfig.siteAuthor,
      }
    : undefined,
  creator: "mbaharip",
  icons: [
    {
      url: config.siteConfig.siteIcon,
    },
  ],
  keywords: ["gdrive", "index", "nextjs", "reactjs"],
  openGraph: {
    type: "website",
    siteName: config.siteConfig.siteName,
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    creator: config.siteConfig.twitterHandle,
  },
  robots: config.siteConfig.robots,
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const unlocked = await CheckSitePassword();
  const formatFooter = (text: string | string[]): string => {
    let toFormat: string;
    if (Array.isArray(text)) {
      toFormat = text.join(`\n\n`);
    } else {
      toFormat = text;
    }
    return toFormat
      .replaceAll("{{ year }}", new Date().getFullYear().toString())
      .replaceAll(
        "{{ repository }}",
        "[Repository](https://github.com/mbaharip/next-gdrive-index)",
      )
      .replaceAll("{{ author }}", config.siteConfig.siteAuthor || "mbaharip")
      .replaceAll("{{ version }}", config.version || "0.0.0")
      .replaceAll("{{ siteName }}", config.siteConfig.siteName)
      .replaceAll("{{ creator }}", "mbaharip");
  };

  return (
    <html lang='en'>
      <body
        className={cn(
          "bg-background font-sans text-foreground",
          jetbrainsMono.variable,
          sourceSans3.variable,
        )}
      >
        <ThemeProvider
          attribute='class'
          defaultTheme='system'
          enableSystem
          disableTransitionOnChange
        >
          <div
            className={cn(
              "h-full min-h-screen w-full overflow-x-hidden",
              "flex flex-col items-start",
              // "tablet:flex-row",
            )}
          >
            <Navbar />
            <main
              slot='content'
              className={cn(
                "mx-auto h-full min-h-screen w-full max-w-screen-desktop",
                "relative left-0 top-0",
                "flex flex-grow flex-col gap-3 p-6",
                "tablet:gap-6",
              )}
            >
              {config.siteConfig.privateIndex && !unlocked.success ? (
                <Password
                  path='global'
                  errorMessage={unlocked.message}
                />
              ) : (
                <>{children}</>
              )}
            </main>
            {config.siteConfig.footer && (
              <Footer content={formatFooter(config.siteConfig.footer)} />
            )}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
