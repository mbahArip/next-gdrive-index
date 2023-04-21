import type { AppProps } from "next/app";
import { SWRConfig } from "swr";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import NextNProgress from "nextjs-progressbar";

import "@/styles/globals.css";
import "@/styles/markdown.css";
import "@/styles/highlight.css";
import "@config/site.config";
import "react-toastify/dist/ReactToastify.min.css";

import { Exo_2, Source_Sans_Pro, JetBrains_Mono } from "next/font/google";
import { IconContext } from "react-icons";
import { ToastContainer } from "react-toastify";
import useLocalStorage from "@hooks/useLocalStorage";

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
  return (
    <main
      className={`${exo2.variable} ${sourceSansPro.variable} ${jetBrainsMono.variable} font-body`}
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
