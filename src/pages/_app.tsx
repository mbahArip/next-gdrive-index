import { Icon } from "@iconify/react";
import gIndexConfig from "config";
import { DefaultSeo } from "next-seo";
import { AppProps } from "next/app";
import { JetBrains_Mono, Kanit, Poppins } from "next/font/google";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { twMerge } from "tailwind-merge";
import twColor from "tailwindcss/colors";

import Button from "components/Button";
import ButtonGroup from "components/ButtonGroup";
import ButtonIcon from "components/ButtonIcon";
import ClickAway from "components/ClickAway";
import Modal from "components/Modal";
import Tooltip from "components/Tooltip";

import hexToRgb from "utils/hexToRGB";
import { removeAllPassword } from "utils/passwordHelper";

import "styles/globals.css";

const kanit = Kanit({
  display: "auto",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin-ext", "latin"],
  preload: true,
});
export const poppins = Poppins({
  display: "auto",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin-ext", "latin"],
  preload: true,
});
export const jetbrainsMono = JetBrains_Mono({
  display: "auto",
  weight: ["300", "400", "500", "600", "700", "800"],
  subsets: ["latin-ext", "latin"],
  style: ["normal", "italic"],
  preload: true,
});

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  const [accentColor] = useState<keyof typeof twColor>(
    gIndexConfig.siteConfig.defaultAccentColor as keyof typeof twColor,
  );

  const [showToTopButton, setShowToTopButton] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [clearPasswordModalOpen, setClearPasswordModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 150) {
        setShowToTopButton(true);
      } else {
        setShowToTopButton(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleClearPassword = () => {
    removeAllPassword();
    setClearPasswordModalOpen(false);
    router.reload();
  };

  useEffect(() => {
    const colorObject = twColor[accentColor];
    Object.keys(colorObject).forEach((key) => {
      document.documentElement.style.setProperty(
        `--accent-${key}`,
        hexToRgb(colorObject[key as keyof typeof colorObject]),
      );
    });
  }, [accentColor]);

  return (
    <div
      id='next-gdrive-index'
      className={`${kanit.className} flex flex-col tablet:flex-row w-full`}
    >
      <DefaultSeo
        defaultTitle={gIndexConfig.siteConfig.siteName}
        titleTemplate={`%s | ${gIndexConfig.siteConfig.siteName}`}
        description={gIndexConfig.siteConfig.siteDescription}
        canonical={process.env.NEXT_PUBLIC_VERCEL_URL}
        openGraph={{
          type: "website",
          title: gIndexConfig.siteConfig.siteName,
          description: gIndexConfig.siteConfig.siteDescription,
          url: process.env.NEXT_PUBLIC_VERCEL_URL,
          siteName: gIndexConfig.siteConfig.siteName,
          images: [
            {
              url: `/og.png`,
              width: 1200,
              height: 630,
            },
          ],
        }}
        twitter={{
          cardType: "summary_large_image",
          handle: gIndexConfig.siteConfig.twitterHandle,
        }}
        additionalMetaTags={[
          {
            name: "twitter:title",
            content: gIndexConfig.siteConfig.siteName,
          },
          {
            name: "twitter:description",
            content: gIndexConfig.siteConfig.siteDescription,
          },
          {
            name: "twitter:image",
            content: `/og.png`,
          },
        ]}
      />
      <nav className='w-full fixed top-0 z-50 tablet:w-20 h-12 tablet:min-h-screen bg-primary-950 text-primary-50 flex flex-row tablet:flex-col items-center justify-between'>
        <div className='w-full tablet:w-20 h-12 tablet:min-h-screen px-4 tablet:py-4 bg-primary-950 relative z-50 flex flex-row tablet:flex-col items-center justify-between'>
          <Link
            href='/'
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <Tooltip
              content={"Home"}
              placement={"right"}
            >
              <img
                src={gIndexConfig.siteConfig.siteIcon}
                alt={gIndexConfig.siteConfig.siteName}
                className='w-8 tablet:w-10 h-8 tablet:h-10'
                loading='eager'
              />
            </Tooltip>
          </Link>
          <div className='hidden tablet:flex flex-col gap-4'>
            {gIndexConfig.siteConfig.navbarItems.map((link) => (
              <Link
                href={link.href}
                key={`navbar-${link.name}`}
                target={link.external ? "_blank" : undefined}
                rel={link.external ? "noopener noreferrer" : undefined}
                className={`flex flex-col items-center justify-center opacity-80 hover:opacity-100 transition-smooth ${
                  router.pathname === link.href ? "opacity-100 cursor-default" : "cursor-pointer"
                }`}
              >
                <Tooltip
                  content={link.name}
                  placement='right'
                >
                  <ButtonIcon
                    icon={link.icon as string}
                    variant='transparent'
                  />
                </Tooltip>
              </Link>
            ))}
            <div className='w-full h-px bg-primary-500' />
            <Tooltip
              content='Clear password'
              placement='right'
            >
              <ButtonIcon
                icon={"ion:log-out"}
                variant='transparent'
                className='opacity-80 hover:opacity-100 transition-smooth'
                onClick={() => setClearPasswordModalOpen(true)}
              />
            </Tooltip>
          </div>
          <div className='tablet:hidden h-full flex items-center'>
            <Button
              variant='transparent'
              pill
              square
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            >
              <Icon
                icon='ion:menu'
                width={24}
                height={24}
                color='white'
                className={`transition-smooth absolute ${
                  isMobileMenuOpen
                    ? "opacity-0 rotate-90 pointer-events-none"
                    : "opacity-100 rotate-0 pointer-events-auto"
                }`}
              />
              <Icon
                icon='ion:close'
                width={24}
                height={24}
                color='white'
                className={`transition-smooth absolute ${
                  isMobileMenuOpen
                    ? "opacity-100 rotate-0 pointer-events-auto"
                    : "opacity-0 rotate-90 pointer-events-none"
                }`}
              />
            </Button>
          </div>
        </div>
        <ClickAway
          open={isMobileMenuOpen}
          onClickAway={() => setIsMobileMenuOpen(false)}
          className={`transition-smooth w-full h-screen block tablet:hidden absolute top-0 z-40 ${
            isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
        >
          <div className={`transition-smooth ${isMobileMenuOpen ? "translate-y-0" : "-translate-y-full"}`}>
            <div className='h-fit flex px-4 w-full flex-col gap-4 py-16 pb-4 bg-primary-950 drop-shadow-md z-40'>
              {gIndexConfig.siteConfig.navbarItems.map((link) => (
                <Link
                  href={link.href}
                  key={`navbar-${link.name}`}
                  target={link.external ? "_blank" : undefined}
                  rel={link.external ? "noopener noreferrer" : undefined}
                  className={`flex items-center justify-start gap-4 w-full opacity-80 hover:opacity-100 transition-smooth ${
                    router.pathname === link.href ? "opacity-100 cursor-default" : "cursor-pointer"
                  }`}
                  onClick={(e) => {
                    // If href === current page, prevent default
                    if (router.pathname === link.href) {
                      e.preventDefault();
                    }
                    e.stopPropagation();
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <Icon
                    icon={link.icon as string}
                    width={24}
                    height={24}
                    color='white'
                  />
                  <span>{link.name}</span>
                </Link>
              ))}
              <Button
                variant='danger'
                fullWidth
                onClick={() => setClearPasswordModalOpen(true)}
                rounded='large'
                startIcon={"ion:log-out"}
                className='mt-4'
              >
                Clear password
              </Button>
            </div>
          </div>
        </ClickAway>
      </nav>

      <main
        className={`w-full min-h-screen bg-primary-950 text-primary-50 flex flex-col tablet:pl-20 pl-0 pt-12 tablet:pt-0`}
      >
        <div className='flex-grow w-full h-full flex'>
          <Component {...pageProps} />
        </div>

        <footer className='w-full h-8 text-center text-sm py-8 flex items-center justify-center'>
          <span>
            Powered by{" "}
            <Link
              href={"https://www.github.com/mbaharip/next-gdrive-index"}
              target='_blank'
              rel='noopener noreferrer'
              className='underline underline-offset-8 hover:underline-offset-1 decoration-wavy decoration-transparent hover:decoration-accent-400 text-accent-400 transition-smooth'
            >
              next-gdrive-index
            </Link>
          </span>
        </footer>
      </main>

      <ToastContainer
        autoClose={1500}
        limit={3}
        position='bottom-center'
        theme='dark'
      />

      {/* To the top */}
      <ButtonIcon
        icon={"ion:chevron-up"}
        variant='accent'
        size='large'
        className={twMerge(
          "fixed right-4 z-50",
          showToTopButton ? "opacity-100 pointer-events-auto bottom-4" : "opacity-0 pointer-events-none bottom-0",
        )}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      />

      {/* Clear password */}
      <Modal
        key={`clear-password-modal`}
        open={clearPasswordModalOpen}
        onClose={() => setClearPasswordModalOpen(false)}
        title='Clear password'
      >
        <div className='flex flex-col gap-4'>
          <div className='flex flex-col'>
            <span className='text-lg'>Are you sure you want to clear your password?</span>
            <span className='text-sm text-primary-400'>
              You will need to re-enter your password to access protected folders / files.
            </span>
          </div>
          <ButtonGroup>
            <Button
              variant='primary'
              startIcon={"ion:close"}
              onClick={() => setClearPasswordModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant='danger'
              startIcon={"ion:log-out"}
              onClick={handleClearPassword}
            >
              Clear password
            </Button>
          </ButtonGroup>
        </div>
      </Modal>
    </div>
  );
}
