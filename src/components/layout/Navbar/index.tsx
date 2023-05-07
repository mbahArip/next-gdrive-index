import {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import siteConfig from "config/site.config";
import Link from "next/link";
import Image from "next/image";
import {
  MdClose,
  MdDarkMode,
  MdLightMode,
  MdLogout,
  MdMenu,
  MdSearch,
} from "react-icons/md";
import Modal from "components/utility/Modal";
import { formatBytes, formatDate } from "utils/formatHelper";
import { ErrorResponse, SearchResponse } from "types/googleapis";
import useSWR from "swr";
import { drive_v3 } from "googleapis";
import LoadingFeedback from "components/APIFeedback/Loading";
import ErrorFeedback from "components/APIFeedback/Error";
import EmptyFeedback from "components/APIFeedback/Empty";
import { BsFolderFill } from "react-icons/bs";
import { getFileIcon } from "utils/mimeTypesHelper";
import { ThemeContext, TThemeContext } from "context/themeContext";
import { createFileId } from "utils/driveHelper";

type Props = {
  isUnlocked: boolean;
  setIsUnlocked: (isUnlocked: boolean) => void;
};
export default function Navbar({ isUnlocked, setIsUnlocked }: Props) {
  const { theme, setTheme } = useContext<TThemeContext>(ThemeContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<drive_v3.Schema$File[]>(); // [
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => {
      clearTimeout(timerId);
    };
  }, [searchQuery]);

  const { data, error, isLoading } = useSWR<SearchResponse, ErrorResponse>(
    `/api/search?q=${debouncedSearchQuery}`,
  );

  useEffect(() => {
    if (!isLoading && data) {
      setSearchResults(data.files as drive_v3.Schema$File[]);
    }
  }, [data, isLoading]);

  const handleCloseSearch = useCallback(() => {
    setIsSearching(false);
    const timeout = setTimeout(() => {
      setSearchQuery("");
      setSearchResults([]);
    }, 150);

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  const handleCloseLogout = useCallback(() => {
    setIsLogoutOpen(false);
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
        {(siteConfig.privateIndex && isUnlocked) || !siteConfig.privateIndex ? (
          <div
            id={"search-modal-toggle"}
            className='interactive flex items-center gap-2'
            role={"button"}
            title={"Search"}
          >
            <div
              className='relative flex aspect-square h-6 w-6 cursor-pointer items-center justify-center text-inherit'
              onClick={() => {
                setIsSearching(true);
                searchInputRef.current?.focus();
              }}
            >
              <MdSearch className='h-full w-full' />
            </div>
          </div>
        ) : (
          <></>
        )}
        {/* Dark mode */}
        <div
          id={"btn-theme-toggle"}
          className='interactive relative flex aspect-square h-6 w-6 cursor-pointer items-center justify-center text-inherit'
          onClick={() => {
            setTheme(theme === "dark" ? "light" : "dark");
          }}
          role={"button"}
          title={"Toggle theme"}
        >
          <MdDarkMode
            className={`absolute left-0 h-full w-full transition-all duration-75 ${
              theme === "dark"
                ? "pointer-events-none rotate-90 opacity-0"
                : "pointer-events-auto rotate-0 opacity-100"
            }`}
          />
          <MdLightMode
            className={`absolute left-0 h-full w-full transition-all duration-75 ${
              theme === "dark"
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

        {/* Remove password / logout */}
        {siteConfig.privateIndex && isUnlocked && (
          <div
            id={"btn-logout"}
            className={"interactive flex items-center gap-2"}
            role={"button"}
            title={"Logout"}
            onClick={() => setIsLogoutOpen(true)}
          >
            <MdLogout className={"h-full w-full"} />
            <span className={"max-tablet:hidden"}>Logout</span>
          </div>
        )}

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
          <span className='flex items-center gap-2 text-lg'>Search files</span>
        }
        isOpen={isSearching}
        isCentered={false}
        onClose={handleCloseSearch}
      >
        {/* Input */}
        <div className='relative flex w-full flex-grow items-center'>
          <MdSearch className='absolute right-4' />
          <input
            ref={searchInputRef}
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
          {isLoading && <LoadingFeedback message={"Searching..."} />}
          {!isLoading && error && (
            <ErrorFeedback message={error?.errors.message} />
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
                  : getFileIcon(
                      item.fileExtension as string,
                      item.mimeType as string,
                    );

                return (
                  <Link
                    href={
                      isFolder
                        ? `/folder/${createFileId(item)}`
                        : `/file/${createFileId(item)}`
                    }
                    key={item.id}
                    className='rounded-lg py-1 hover:bg-zinc-300 dark:hover:bg-zinc-600 tablet:px-2 tablet:py-2'
                    onClick={handleCloseSearch}
                  >
                    <div className='flex items-center gap-4'>
                      <div className='flex aspect-square h-10 w-10 flex-shrink-0 flex-grow-0 items-center justify-center overflow-hidden rounded-lg tablet:h-12 tablet:w-12'>
                        {item.thumbnailLink ? (
                          <Image
                            priority={true}
                            src={item.thumbnailLink}
                            alt={item.name as string}
                            className='h-full w-full object-cover'
                            width={64}
                            height={64}
                          />
                        ) : (
                          <Icon className='h-full w-full' />
                        )}
                      </div>
                      <div className='line-clamp-1 flex w-full flex-shrink flex-grow flex-col'>
                        <div className={"flex items-center gap-2"}>
                          <Icon className='h-4 w-4' />
                          <span className='text-sm font-medium'>
                            {item.name}
                          </span>
                        </div>
                        <span className='text-xs text-gray-500'>
                          {formatDate(new Date(item.modifiedTime as string))}
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

      {/* Logout Modal */}
      <Modal
        title={<span className={"text-lg"}>Logout</span>}
        isOpen={isLogoutOpen}
        isCentered={true}
        onClose={handleCloseLogout}
      >
        <div className={"flex flex-col gap-4"}>
          <span>Are you sure you want to logout?</span>
          <span>
            It will remove all your data from this device and you will need to
            login again.
          </span>
          <div className={"flex gap-4"}>
            <button
              onClick={handleCloseLogout}
              className={"secondary flex-grow"}
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.localStorage.removeItem("sitePassword");
                  setIsLogoutOpen(false);
                  setIsUnlocked(false);
                }
              }}
              className={"primary flex-grow"}
            >
              Logout
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
