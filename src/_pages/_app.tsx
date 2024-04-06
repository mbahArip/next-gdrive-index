import { Icon } from "@iconify/react";
import Button from "components/Button";
import ButtonGroup from "components/ButtonGroup";
import ButtonIcon from "components/ButtonIcon";
import ClickAway from "components/ClickAway";
import Modal from "components/Modal";
import Tooltip from "components/Tooltip";
import gIndexConfig from "config";
import { DefaultSeo } from "next-seo";
import { AppProps } from "next/app";
import { JetBrains_Mono, Kanit, Poppins } from "next/font/google";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "styles/globals.css";
import { twMerge } from "tailwind-merge";
import twColor from "tailwindcss/colors";
import hexToRgb from "utils/hexToRGB";
import { removeAllPassword } from "utils/passwordHelper";

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
  const [clearPasswordModalOpen, setClearPasswordModalOpen] =
    useState<boolean>(false);

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
      className={`${kanit.className} flex w-full flex-col tablet:flex-row`}
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
      <nav className='bg-primary-950 text-primary-50 fixed top-0 z-50 flex h-12 w-full flex-row items-center justify-between tablet:min-h-screen tablet:w-20 tablet:flex-col'>
        <div className='bg-primary-950 relative z-50 flex h-12 w-full flex-row items-center justify-between px-4 tablet:min-h-screen tablet:w-20 tablet:flex-col tablet:py-4'>
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
                className='h-8 w-8 tablet:h-10 tablet:w-10'
                loading='eager'
              />
            </Tooltip>
          </Link>
          <div className='hidden flex-col gap-4 tablet:flex'>
            {gIndexConfig.siteConfig.navbarItems.map((link) => (
              <Link
                href={link.href}
                key={`navbar-${link.name}`}
                target={link.external ? "_blank" : undefined}
                rel={link.external ? "noopener noreferrer" : undefined}
                className={`transition-smooth flex flex-col items-center justify-center opacity-80 hover:opacity-100 ${
                  router.pathname === link.href
                    ? "cursor-default opacity-100"
                    : "cursor-pointer"
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
            <div className='bg-primary-500 h-px w-full' />
            <Tooltip
              content='Clear password'
              placement='right'
            >
              <ButtonIcon
                icon={"ion:log-out"}
                variant='transparent'
                className='transition-smooth opacity-80 hover:opacity-100'
                onClick={() => setClearPasswordModalOpen(true)}
              />
            </Tooltip>
          </div>
          <div className='flex h-full items-center tablet:hidden'>
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
                    ? "pointer-events-none rotate-90 opacity-0"
                    : "pointer-events-auto rotate-0 opacity-100"
                }`}
              />
              <Icon
                icon='ion:close'
                width={24}
                height={24}
                color='white'
                className={`transition-smooth absolute ${
                  isMobileMenuOpen
                    ? "pointer-events-auto rotate-0 opacity-100"
                    : "pointer-events-none rotate-90 opacity-0"
                }`}
              />
            </Button>
          </div>
        </div>
        <ClickAway
          open={isMobileMenuOpen}
          onClickAway={() => setIsMobileMenuOpen(false)}
          className={`transition-smooth absolute top-0 z-40 block h-screen w-full tablet:hidden ${
            isMobileMenuOpen
              ? "pointer-events-auto opacity-100"
              : "pointer-events-none opacity-0"
          }`}
        >
          <div
            className={`transition-smooth ${
              isMobileMenuOpen ? "translate-y-0" : "-translate-y-full"
            }`}
          >
            <div className='bg-primary-950 z-40 flex h-fit w-full flex-col gap-4 px-4 py-16 pb-4 drop-shadow-md'>
              {gIndexConfig.siteConfig.navbarItems.map((link) => (
                <Link
                  href={link.href}
                  key={`navbar-${link.name}`}
                  target={link.external ? "_blank" : undefined}
                  rel={link.external ? "noopener noreferrer" : undefined}
                  className={`transition-smooth flex w-full items-center justify-start gap-4 opacity-80 hover:opacity-100 ${
                    router.pathname === link.href
                      ? "cursor-default opacity-100"
                      : "cursor-pointer"
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
        className={`bg-primary-950 text-primary-50 flex min-h-screen w-full flex-col pl-0 pt-12 tablet:pl-20 tablet:pt-0`}
      >
        <div className='flex h-full w-full flex-grow'>
          <Component {...pageProps} />
        </div>

        <footer className='flex h-8 w-full items-center justify-center py-8 text-center text-sm'>
          <span>
            Powered by{" "}
            <Link
              href={"https://www.github.com/mbaharip/next-gdrive-index"}
              target='_blank'
              rel='noopener noreferrer'
              className='hover:decoration-accent-400 text-accent-400 transition-smooth underline decoration-transparent decoration-wavy underline-offset-8 hover:underline-offset-1'
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
          showToTopButton
            ? "pointer-events-auto bottom-4 opacity-100"
            : "pointer-events-none bottom-0 opacity-0",
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
            <span className='text-lg'>
              Are you sure you want to clear your password?
            </span>
            <span className='text-primary-400 text-sm'>
              You will need to re-enter your password to access protected
              folders / files.
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
