import { Metadata } from "next";
import { JetBrains_Mono, Outfit, Source_Sans_3 } from "next/font/google";
import "plyr-react/plyr.css";

import { Footer, Navbar, Password, ThemeProvider } from "~/components/Layout";
import ToTop from "~/components/Layout/ToTop";

import { cn } from "~/utils/cn";
import { formatFooter } from "~/utils/footerFormatter";

import { CheckSitePassword } from "actions";
import config from "config";

import "./globals.css";
import "./markdown.css";

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
    template: config.siteConfig.siteNameTemplate?.replace("%t", config.siteConfig.siteName) || "%s",
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

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  let unlocked: Awaited<ReturnType<typeof CheckSitePassword>> = {
    success: true,
    message: "",
  };
  if (config.siteConfig.privateIndex) {
    unlocked = await CheckSitePassword();
  }

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
          {config.siteConfig.footer && <Footer content={formatFooter(config.siteConfig.footer)} />}
          <ToTop />
        </ThemeProvider>
      </body>
    </html>
  );
}
