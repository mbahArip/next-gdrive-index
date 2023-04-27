import { useCallback, useEffect, useState } from "react";
import siteConfig from "@config/site.config";
import useLocalStorage from "@/hooks/useLocalStorage";
import Link from "next/link";
import Image from "next/image";
import {
  MdLightMode,
  MdDarkMode,
  MdSearch,
  MdMenu,
  MdClose,
} from "react-icons/md";
import Modal from "@/components/utility/Modal";
import { formatBytes } from "@/utils/formatHelper";
import { ErrorResponse, SearchResponse } from "@/types/googleapis";
import useSWR from "swr";
import fetcher from "@utils/swrFetch";
import { drive_v3 } from "googleapis";
import LoadingFeedback from "@components/APIFeedback/Loading";
import ErrorFeedback from "@components/APIFeedback/Error";
import EmptyFeedback from "@components/APIFeedback/Empty";
import { BsFolderFill } from "react-icons/bs";
import { getFileIcon } from "@utils/mimeTypesHelper";

export default function Navbar() {
  const [isDarkMode, setIsDarkMode] = useLocalStorage("isDarkMode", "false");
  const [isDark, setIsDark] = useState<boolean>(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<drive_v3.Schema$File[]>(); // [
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (isDarkMode === "true") {
      document.querySelector("html")?.classList.add("dark");
      setIsDark(true);
    } else {
      document.querySelector("html")?.classList.remove("dark");
      setIsDark(false);
    }
  }, [isDarkMode]);

  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => {
      clearTimeout(timerId);
    };
  }, [searchQuery]);

  const { data, error, isLoading } = useSWR<SearchResponse, ErrorResponse>(
    `/api/search?query=${debouncedSearchQuery}`,
    fetcher,
  );

  useEffect(() => {
    if (!isLoading && data) {
      setSearchResults(data.files as drive_v3.Schema$File[]);
    }
  }, [data, isLoading]);

  const handleDarkMode = useCallback(() => {
    const darkMode = document.querySelector("html")?.classList.contains("dark");
    if (darkMode) {
      document.querySelector("html")?.classList.remove("dark");
      setIsDarkMode("false");
      setIsDark(false);
    } else {
      document.querySelector("html")?.classList.add("dark");
      setIsDarkMode("true");
      setIsDark(true);
    }
  }, [setIsDarkMode]);

  const handleCloseSearch = useCallback(() => {
    setIsSearching(false);
    setSearchQuery("");
    setSearchResults([]);
  }, []);

  return (
    <>
      {/* Navbar */}
      <div className='navbar sticky top-0 z-[1000] flex w-full items-center justify-start gap-2 bg-inherit bg-opacity-90 px-2 py-2 tablet:gap-4'>
        {/* Web Logo */}
        <Link
          href='/'
          className='flex items-center gap-2'
        >
          <Image
            src={siteConfig.siteIcon}
            alt={siteConfig.siteName}
            width={32}
            height={32}
            className='aspect-square h-6 w-6'
          />
          <span className='hidden text-lg font-bold tablet:block'>
            {siteConfig.siteName}
          </span>
        </Link>

        {/* Gap */}
        <div className='flex-grow'></div>

        {/* Search */}
        <div
          id={"search-modal-toggle"}
          className='interactive flex items-center gap-2'
          role={"button"}
        >
          <div
            className='relative flex aspect-square h-6 w-6 cursor-pointer items-center justify-center text-inherit'
            onClick={() => setIsSearching(true)}
          >
            <MdSearch className='h-full w-full' />
          </div>
        </div>
        {/* Dark mode */}
        <div
          id={"btn-theme-toggle"}
          className='interactive relative flex aspect-square h-6 w-6 cursor-pointer items-center justify-center text-inherit'
          onClick={handleDarkMode}
          role={"button"}
        >
          <MdDarkMode
            className={`absolute left-0 h-full w-full transition-all duration-150 ${
              isDark
                ? "pointer-events-none rotate-90 opacity-0"
                : "pointer-events-auto rotate-0 opacity-100"
            }`}
          />
          <MdLightMode
            className={`absolute left-0 h-full w-full transition-all duration-150 ${
              isDark
                ? "pointer-events-auto rotate-0 opacity-100"
                : "pointer-events-none rotate-90 opacity-0"
            }`}
          />
        </div>

        {/* Menu Tablet+ */}
        <div className='hidden gap-4 tablet:flex'>
          {siteConfig.navbarLinks.map((link, linkIdx) => (
            <Link
              key={`navbar-link-${linkIdx}`}
              href={link.href}
              rel={link.newTab ? "noopener noreferrer" : ""}
              target={link.newTab ? "_blank" : "_self"}
              className='flex items-center gap-2'
            >
              {link.icon && <link.icon />}
              {link.name}
            </Link>
          ))}
        </div>

        {/* Menu mobile */}
        <div
          className='interactive relative flex aspect-square h-6 w-6 items-center justify-center text-inherit tablet:hidden'
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <MdMenu
            className={`absolute left-0 h-full w-full ${
              isMenuOpen
                ? "pointer-events-none rotate-90 opacity-0"
                : "pointer-events-auto rotate-0 opacity-100"
            }`}
          />
          <MdClose
            className={`absolute left-0 h-full w-full ${
              isMenuOpen
                ? "pointer-events-auto rotate-0 opacity-100"
                : "pointer-events-none rotate-90 opacity-0"
            }`}
          />
          {/* <span
            className='cursor-pointer'
            onPointerDown={() => setIsMenuOpen(!isMenuOpen)}
          >
            <MdMenu className='h-full w-full' />
          </span> */}
        </div>
      </div>

      {/* MobileMenu */}
      <div
        className={`flex h-full w-full flex-col tablet:hidden ${
          isMenuOpen ? "right-0" : "-right-full"
        } navbar fixed z-[999] bg-zinc-100 py-16 transition-all dark:bg-zinc-900`}
      >
        {siteConfig.navbarLinks.map((link, linkIdx) => (
          <Link
            key={`mobile-link-${linkIdx}`}
            href={link.href}
            rel={link.newTab ? "noopener noreferrer" : ""}
            target={link.newTab ? "_blank" : "_self"}
            className='flex w-full items-center justify-center gap-2 px-4 py-2 text-center text-lg'
          >
            {link.icon && <link.icon />}
            {link.name}
          </Link>
        ))}
      </div>

      {/* Search Modal */}
      <Modal
        title={
          <span className='flex items-center text-lg'>
            <MdSearch /> Search files
          </span>
        }
        isOpen={isSearching}
        isCentered={false}
        onClose={handleCloseSearch}
      >
        {/* Input */}
        <div className='relative flex w-full flex-grow items-center'>
          <MdSearch className='absolute right-4' />
          <input
            type='text'
            className='w-full flex-grow py-2 pr-8'
            placeholder='Type folder or file name...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className='divider-horizontal' />
        {/* Result */}
        <div className='flex max-h-96 w-full flex-col overflow-auto'>
          {isLoading && (
            <LoadingFeedback
              message={"Searching..."}
              useContainer={false}
            />
          )}
          {!isLoading && error && (
            <ErrorFeedback
              message={error?.errors.message}
              useContainer={false}
            />
          )}
          {!isLoading && searchResults?.length === 0 && (
            <EmptyFeedback
              message={
                debouncedSearchQuery
                  ? "No results found"
                  : "Type something to search"
              }
            />
          )}
          {!isLoading && searchResults && (
            <>
              {searchResults.map((item) => {
                const isFolder =
                  item.mimeType === "application/vnd.google-apps.folder";
                const Icon = isFolder
                  ? BsFolderFill
                  : getFileIcon(item.fileExtension as string);

                return (
                  <Link
                    href={isFolder ? `/folder/${item.id}` : `/file/${item.id}`}
                    key={item.id}
                    className='rounded-lg py-1 hover:bg-zinc-300 dark:hover:bg-zinc-600 tablet:px-2 tablet:py-2'
                  >
                    <div className='flex items-center gap-4'>
                      <div className='flex aspect-square h-10 w-10 items-center justify-center overflow-hidden rounded-lg tablet:h-12 tablet:w-12'>
                        {item.thumbnailLink ? (
                          <img
                            src={item.thumbnailLink}
                            alt={item.name as string}
                            className='h-full w-full object-cover'
                          />
                        ) : (
                          <Icon className='h-full w-full' />
                        )}
                      </div>
                      <div className='flex flex-col'>
                        <div className={"flex items-center gap-2"}>
                          <Icon className='h-4 w-4' />
                          <span className='text-sm font-medium'>
                            {item.name}
                          </span>
                        </div>
                        <span className='text-xs text-gray-500'>
                          {item.mimeType}
                          {!isFolder
                            ? ` ・ ${formatBytes(item.size as string)}`
                            : ""}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </>
          )}
        </div>
      </Modal>
    </>
  );
}
