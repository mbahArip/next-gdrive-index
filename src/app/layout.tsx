import { Metadata } from "next";
import { JetBrains_Mono, Outfit, Source_Sans_3 } from "next/font/google";
import "plyr-react/plyr.css";
import { cn } from "~/utils";

import { formatFooter } from "~/utils/footerFormatter";

import config from "~/config/gIndex.config";

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
const outfit = Outfit({
  weight: ["300", "400", "600", "700"],
  style: ["normal"],
  display: "auto",
  subsets: ["latin", "latin-ext"],
  variable: "--font-outfit",
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
      url: config.siteConfig.favIcon,
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

  return (
    <html lang='en'>
      <body
        className={cn(
          "h-full bg-background font-sans text-foreground",
          jetbrainsMono.variable,
          sourceSans3.variable,
          outfit.variable,
        )}
      >
        <ThemeProvider
          attribute='class'
          defaultTheme='system'
          enableSystem
          disableTransitionOnChange
        >
          <Navbar />
          <main
            slot='content'
            className={cn(
              "mx-auto h-full w-full max-w-screen-desktop",
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
        </ThemeProvider>
      </body>
    </html>
  );
}
