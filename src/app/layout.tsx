import { Metadata } from "next";

import Navbar from "components/Navbar";
import Footer from "components/Footer";
import ContextWrapper from "./contextWrapper";
import {
  Exo_2,
  JetBrains_Mono,
  Source_Sans_Pro,
} from "next/font/google";

import siteConfig from "config/site.config";
import "styles/globals.css";

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

export const metadata: Metadata = {
  title: siteConfig.siteName,
  description: siteConfig.siteDescription,
};

type Props = {
  children: React.ReactNode;
};

function RootLayout({ children }: Props) {
  return (
    <html lang='en'>
      <body
        className={`${exo2.variable} ${sourceSansPro.variable} ${jetBrainsMono.variable} font-body`}
      >
        <ContextWrapper>
          <main
            className={
              "text-dark-900 flex h-full min-h-dynamic w-dynamic flex-col bg-zinc-200 font-body dark:bg-zinc-800 dark:text-zinc-100"
            }
          >
            <Navbar />
            <div className={"flex-grow p-4"}>
              {children}
            </div>
            <Footer />
          </main>
        </ContextWrapper>
      </body>
    </html>
  );
}

export default RootLayout;
