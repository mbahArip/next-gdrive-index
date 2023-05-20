"use client";

import Link from "next/link";

import siteConfig from "config/site.config";
import {
  MdClose,
  MdDarkMode,
  MdLightMode,
  MdLogout,
  MdMenu,
  MdSearch,
} from "react-icons/md";
import { useContext, useState } from "react";
import {
  ThemeContext,
  TThemeContext,
} from "context/themeContext";

function Navbar() {
  const { theme, setTheme } =
    useContext<TThemeContext>(ThemeContext);
  const [isMenuOpen, setIsMenuOpen] =
    useState<boolean>(false);

  return (
    <>
      <nav
        className={
          "sticky top-0 z-[1000] flex w-full items-center justify-between gap-2 bg-zinc-100 px-2 py-1 dark:bg-zinc-900 tablet:gap-4"
        }
      >
        <Link
          href={"/"}
          title={siteConfig.siteName}
          className={"flex items-center gap-2"}
        >
          <img
            src={"/logo.svg"}
            alt={siteConfig.siteName}
            className={`h-8 w-8 ${
              theme === "dark" && "hue-rotate-180 invert"
            }`}
            loading={"lazy"}
          />
          <span
            className={
              "hidden text-lg font-bold tablet:block"
            }
          >
            {siteConfig.navbar.title || siteConfig.siteName}
          </span>
        </Link>

        <div className={"flex items-center gap-2"}>
          <div
            className={
              "hidden items-center gap-2 tablet:flex"
            }
          >
            {siteConfig.navbar.links.map((link) => (
              <Link
                key={`nav-link-${link.name}`}
                href={link.href}
                rel={
                  link.newTab ? "noopener noreferrer" : ""
                }
                target={link.newTab ? "_blank" : "_self"}
                title={link.name}
                className={
                  "flex items-center gap-1 whitespace-nowrap"
                }
              >
                {link.icon && <link.icon />}
                {link.name}
              </Link>
            ))}
          </div>

          <div
            id={"nav-search"}
            title={"Search files"}
            role={"button"}
            className={
              "interactive relative flex aspect-square h-6 w-6 items-center justify-center tablet:h-5 tablet:w-5"
            }
          >
            <MdSearch
              className={
                "global-duration absolute h-full w-full"
              }
            />
          </div>
          <div
            id={"nav-theme"}
            title={"Toggle Theme"}
            role={"button"}
            className={
              "interactive relative flex aspect-square h-6 w-6 items-center justify-center tablet:h-5 tablet:w-5"
            }
            onClick={() =>
              setTheme(theme === "dark" ? "light" : "dark")
            }
          >
            <MdDarkMode
              className={`global-duration absolute h-full w-full transition-all ${
                theme === "dark"
                  ? "pointer-events-none rotate-90 opacity-0"
                  : "pointer-events-auto rotate-0 opacity-100"
              }`}
            />
            <MdLightMode
              className={`global-duration absolute h-full w-full transition-all ${
                theme === "dark"
                  ? "pointer-events-auto rotate-0 opacity-100"
                  : "pointer-events-none rotate-90 opacity-0"
              }`}
            />
          </div>
          <div
            id={"nav-logout"}
            title={"Logout"}
            role={"button"}
            className={
              "interactive relative flex aspect-square h-6 w-6 items-center justify-center tablet:h-5 tablet:w-5"
            }
          >
            <MdLogout
              className={
                "global-duration absolute h-full w-full"
              }
            />
          </div>
          <div
            id={"nav-menu"}
            title={"Menu"}
            role={"button"}
            className={
              "interactive relative flex aspect-square h-6 w-6 items-center justify-center tablet:hidden"
            }
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <MdMenu
              className={`global-duration absolute h-full w-full transition-all ${
                isMenuOpen
                  ? "pointer-events-none rotate-90 opacity-0"
                  : "pointer-events-auto rotate-0 opacity-100"
              }`}
            />
            <MdClose
              className={`global-duration absolute h-full w-full transition-all ${
                isMenuOpen
                  ? "pointer-events-auto rotate-0 opacity-100"
                  : "pointer-events-none rotate-90 opacity-0"
              }`}
            />
          </div>
        </div>
      </nav>

      <div
        className={`global-duration fixed z-[999] flex h-dynamic w-full flex-col items-start justify-center gap-4 bg-zinc-100 px-8 text-xl transition-all dark:bg-zinc-900 tablet:hidden ${
          isMenuOpen ? "top-0" : "-top-full"
        }`}
      >
        {siteConfig.navbar.links.map((link, index) => (
          <Link
            key={`m-nav-link-${link.name}`}
            href={link.href}
            rel={link.newTab ? "noopener noreferrer" : ""}
            target={link.newTab ? "_blank" : "_self"}
            title={link.name}
            className={`global-duration relative flex items-center gap-1 whitespace-nowrap transition-opacity delay-75 ${
              isMenuOpen ? "opacity-100" : "opacity-0"
            }`}
          >
            {link.icon && <link.icon />}
            {link.name}
          </Link>
        ))}
      </div>
    </>
  );
}

export default Navbar;
