import {
  Exo_2,
  JetBrains_Mono,
  Source_Sans_Pro,
} from "next/font/google";

import ClientContextWrapper from "components/clientContextWrapper";
import Footer from "components/compFooter";
import Navbar from "components/compNavbar";

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

type Props = {
  children: React.ReactNode;
};

function RootLayout({ children }: Props) {
  return (
    <html lang='en'>
      <body
        className={`${exo2.variable} ${sourceSansPro.variable} ${jetBrainsMono.variable} font-body`}
      >
        <ClientContextWrapper>
          <main
            className={
              "text-dark-900 flex h-full min-h-dynamic w-full flex-col bg-zinc-200 font-body dark:bg-zinc-800 dark:text-zinc-100"
            }
          >
            <Navbar />
            <div className={"flex-grow px-4 py-2"}>
              {children}
            </div>
            <Footer />
          </main>
        </ClientContextWrapper>
      </body>
    </html>
  );
}

export default RootLayout;
