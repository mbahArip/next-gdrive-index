import type { AppProps } from "next/app";
import { useEffect, useState } from "react";
import Navbar from "components/layout/Navbar";
import Footer from "components/layout/Footer";
import NextNProgress from "nextjs-progressbar";

import "styles/globals.css";
import "styles/markdown.css";
import "styles/highlight.css";
import "react-toastify/dist/ReactToastify.min.css";
import config from "config/site.config";

import { Exo_2, JetBrains_Mono, Source_Sans_Pro } from "next/font/google";
import { toast, ToastContainer } from "react-toastify";
import { DefaultSeo, DefaultSeoProps } from "next-seo";
import { SWRConfig } from "swr";
import { IconContext } from "react-icons";
import { LayoutContext } from "context/layoutContext";
import { ThemeContext } from "context/themeContext";
import fetcher from "utils/swrFetch";
import siteConfig from "config/site.config";
import { hashToken, verifyHash } from "utils/hashHelper";

const exo2 = Exo_2({
  weight: ["300", "400", "600", "700"],
  style: ["normal", "italic"],
  display: "auto",
  subsets: ["latin", "latin-ext"],
  variable: "--font-exo2",
});
const sourceSansPro = Source_Sans_Pro({
  weight: ["300", "400", "600", "700"],
  style: ["normal", "italic"],
  display: "auto",
  subsets: ["latin", "latin-ext"],
  variable: "--font-source-sans-pro",
});
const jetBrainsMono = JetBrains_Mono({
  weight: ["300", "400", "600", "700"],
  style: ["normal", "italic"],
  display: "auto",
  subsets: ["latin", "latin-ext"],
  variable: "--font-jetbrains-mono",
});

export default function App({ Component, pageProps }: AppProps) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [layoutStyle, setLayoutStyle] = useState<"grid" | "list">("grid");

  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const theme = localStorage.getItem("theme");
      const layout = localStorage.getItem("layout");
      const adminPassword = localStorage.getItem("sitePassword");

      if (siteConfig.privateIndex) {
        if (adminPassword === siteConfig.indexPassword) {
          setIsUnlocked(true);
        } else {
          setIsUnlocked(false);
        }
      }
      if (layout) {
        setLayoutStyle(layout as "grid" | "list");
      } else {
        setLayoutStyle("grid");
      }
      if (theme) {
        setTheme(theme as "light" | "dark");
      } else {
        setTheme("light");
      }
    }
  }, []);

  useEffect(() => {
    if (theme === "light") {
      document.body.classList.remove("dark");
    } else {
      document.body.classList.add("dark");
    }
  }, [theme]);

  const SEOConfig: DefaultSeoProps = {
    titleTemplate: `%s | ${config.siteName}`,
    defaultTitle: config.siteName,
    description: config.siteDescription,
    dangerouslySetAllPagesToNoFollow: true,
    dangerouslySetAllPagesToNoIndex: true,
    openGraph: {
      type: "website",
      title: config.siteName,
      description: config.siteDescription,
      url: process.env.NEXT_PUBLIC_DOMAIN,
      images: [
        {
          url: `${process.env.NEXT_PUBLIC_DOMAIN}/api/og`,
          width: 1200,
          height: 630,
          alt: config.siteName,
        },
      ],
      siteName: config.siteName,
    },
    twitter: {
      handle: "@mbaharip_",
      site: "@mbaharip_",
      cardType: "summary_large_image",
    },
  };

  return (
    <main
      className={`${exo2.variable} ${sourceSansPro.variable} ${jetBrainsMono.variable} font-body`}
    >
      <SWRConfig
        value={{
          fetcher: fetcher,
          revalidateOnFocus: false,
          revalidateOnReconnect: false,
          refreshWhenOffline: false,
          errorRetryCount: 3,
        }}
      >
        <DefaultSeo {...SEOConfig} />
        <ThemeContext.Provider
          value={{
            theme,
            setTheme: (theme) => {
              if (typeof window !== "undefined") {
                localStorage.setItem("theme", theme);
              }
              setTheme(theme);
            },
          }}
        >
          <IconContext.Provider
            value={{
              size: "18px",
              className: "react-icons",
            }}
          >
            <ToastContainer
              position='bottom-center'
              autoClose={2500}
              limit={3}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss={false}
              draggable
              pauseOnHover={false}
              theme={theme}
            />
            <Navbar
              isUnlocked={isUnlocked}
              setIsUnlocked={setIsUnlocked}
            />
            <NextNProgress options={{ showSpinner: false }} />

            <LayoutContext.Provider
              value={{
                layout: layoutStyle,
                setLayout: (layout) => {
                  if (typeof window !== "undefined") {
                    localStorage.setItem("layout", layout);
                  }
                  setLayoutStyle(layout);
                },
              }}
            >
              <div className='h-full w-full flex-grow items-center justify-center bg-zinc-200 px-4 py-4 dark:bg-zinc-800'>
                {siteConfig.privateIndex && !isUnlocked ? (
                  <div
                    className={
                      "card fillCard mx-auto flex max-w-screen-xl flex-col"
                    }
                  >
                    <div className='flex w-full items-center justify-between rounded-lg'>
                      <span className='font-bold'>Preview</span>
                    </div>
                    <div className={"divider-horizontal"} />
                    <div
                      className={
                        "flex h-full flex-grow flex-col items-center justify-center"
                      }
                    >
                      <p className={"my-2 text-center"}>
                        You have reached a private site that requires authorized
                        access. <br />
                        If you have a valid password, please enter it below to
                        proceed. Otherwise, please leave this site immediately.
                        Thank you for your cooperation.
                      </p>
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          const verify = verifyHash(
                            passwordInput,
                            siteConfig.indexPassword,
                          );
                          if (verify) {
                            toast("Welcome back!");
                            setIsUnlocked(true);
                            localStorage.setItem(
                              "sitePassword",
                              hashToken(passwordInput),
                            );
                            setPasswordInput("");
                          } else {
                            toast.error("Wrong password");
                            setPasswordInput("");
                          }
                        }}
                        className={"mx-auto my-2 flex max-w-md gap-2"}
                      >
                        <input
                          className={`w-full`}
                          type={"password"}
                          placeholder={"Site password"}
                          value={passwordInput}
                          onChange={(e) => {
                            setPasswordInput(e.target.value);
                          }}
                        />
                        <button type={"submit"}>Submit</button>
                      </form>
                    </div>
                  </div>
                ) : (
                  <Component {...pageProps} />
                )}
              </div>
            </LayoutContext.Provider>

            <Footer />
          </IconContext.Provider>
        </ThemeContext.Provider>
      </SWRConfig>
    </main>
  );
}
