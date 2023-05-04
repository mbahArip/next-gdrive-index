import type { AppProps } from "next/app";
import Navbar from "components/layout/Navbar";
import Footer from "components/layout/Footer";
import NextNProgress from "nextjs-progressbar";

import "styles/globals.css";
import "styles/markdown.css";
import "styles/highlight.css";
import "config/site.config";
import "react-toastify/dist/ReactToastify.min.css";

import { Exo_2, JetBrains_Mono, Source_Sans_Pro } from "next/font/google";
import { IconContext } from "react-icons";
import { ToastContainer } from "react-toastify";
import useLocalStorage from "hooks/useLocalStorage";
import { DefaultSeo, DefaultSeoProps } from "next-seo";
import config from "config/site.config";

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
  const [isDarkMode] = useLocalStorage<boolean>("isDarkMode", false);

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
      images: [
        {
          url: `${process.env.NEXT_PUBLIC_DOMAIN}/og-image.png`,
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
      <DefaultSeo {...SEOConfig} />
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
          pauseOnFocusLoss
          draggable
          pauseOnHover={false}
          theme={isDarkMode ? "dark" : "light"}
        />
        <Navbar />
        <NextNProgress options={{ showSpinner: false }} />

        <div className='h-full w-full flex-grow items-center justify-center bg-zinc-300 px-4 py-4 dark:bg-zinc-800'>
          <Component {...pageProps} />
        </div>

        <Footer />
      </IconContext.Provider>
    </main>
  );
}
