import { type Metadata } from "next";
import { JetBrains_Mono, Outfit, Source_Sans_3 } from "next/font/google";
import { headers } from "next/headers";
import { BASE_URL } from "~/constant";
import { type ActionResponseSchema } from "~/types";

import { Footer, Navbar, Password, Provider, ToTop } from "~/components/layout";

import { cn, formatFooterContent } from "~/lib/utils";

import { CheckIndexPassword } from "~/actions/password";
import "~/styles/code-highlight.css";
import "~/styles/globals.css";
import "~/styles/markdown.css";

import config from "config";

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
  metadataBase: new URL(BASE_URL.includes("http") ? BASE_URL : `https://${BASE_URL}`),
  title: {
    default: config.siteConfig.siteName,
    template: config.siteConfig.siteNameTemplate?.replace("%t", config.siteConfig.siteName) ?? "%s",
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
  keywords: ["gdrive", "index", "nextjs", "reactjs", "google drive"],
  openGraph: {
    type: "website",
    siteName: config.siteConfig.siteName,
    images: [
      {
        url: "/og.webp",
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
  const head = await headers();
  const pathname = head.get("X-Pathname") ?? "/";
  let unlocked: ActionResponseSchema = {
    success: true,
    message: "Index is public",
    data: undefined,
  };
  if (config.siteConfig.privateIndex) {
    unlocked = await CheckIndexPassword();
  }

  return (
    <html
      lang='en'
      suppressHydrationWarning
    >
      <body
        className={cn(
          "overflow-x-hidden stroke-foreground font-sans text-foreground",
          pathname.startsWith("/ngdi-internal/embed/") ? "h-fit bg-transparent" : "h-full min-h-screen bg-background",
          jetbrainsMono.variable,
          sourceSans3.variable,
          outfit.variable,
        )}
      >
        <Provider
          theme={{
            attribute: "class",
            enableSystem: true,
            disableTransitionOnChange: true,
          }}
          tooltip={{
            delayDuration: 500,
          }}
          toaster={{
            position: config.siteConfig.toaster?.position,
            duration: config.siteConfig.toaster?.duration,
            pauseWhenPageIsHidden: true,
          }}
        >
          <Navbar />
          <main
            slot='content'
            className={cn(
              "mx-auto h-auto w-full max-w-screen-desktop",
              "relative left-0 top-0",
              "flex flex-grow flex-col gap-4 px-2 py-6 mobile:px-3 tablet:px-4",
              "tablet:gap-6",
            )}
          >
            {config.siteConfig.privateIndex && !unlocked.success ? (
              <Password
                type='global'
                errorMessage={unlocked.error}
              />
            ) : (
              <>{children}</>
            )}
          </main>
          <Footer content={formatFooterContent(config.siteConfig.footer ?? [])} />
          <ToTop />
        </Provider>
      </body>
    </html>
  );
}
