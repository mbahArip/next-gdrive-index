import { Icon, IconifyIcon } from "@iconify/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Fragment, useEffect, useState } from "react";

import ButtonIcon from "components/ButtonIcon";
import ClickAway from "components/ClickAway";

interface BreadcrumbProps {
  paths: Record<"label" | "path", string>[];
  separator?: string | IconifyIcon;
  maxPath?: number;
}

export default function Breadcrumb(props: BreadcrumbProps) {
  const router = useRouter();
  const {
    paths,
    separator = "ion:chevron-forward",
    maxPath = 2,
  } = props;
  const [breadcrumbPaths, setBreadcrumbPaths] =
    useState<Record<"label" | "path", string>[]>(paths);
  const [isPathSliced, setIsPathSliced] =
    useState<boolean>(false);
  const [hiddenPaths, setHiddenPaths] = useState<
    Record<"label" | "path", string>[]
  >([]);
  const [menuAnchor, setMenuAnchor] =
    useState<HTMLElement | null>(null);

  const [menuOpen, setMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    if (paths.length > maxPath) {
      const newPaths = paths.slice(
        paths.length - maxPath,
        paths.length,
      );
      const hiddenPaths = paths.slice(
        0,
        paths.length - maxPath,
      );
      setBreadcrumbPaths(newPaths);
      setIsPathSliced(true);
      setHiddenPaths(hiddenPaths);
    } else {
      setBreadcrumbPaths(paths);
      setIsPathSliced(false);
    }
  }, [paths, maxPath]);

  return (
    <>
      <div className='flex items-center flex-wrap w-full gap-2'>
        <Link href={"/"}>
          <ButtonIcon
            icon={"ion:home"}
            variant='transparent'
            className='flex-shrink-0 flex-grow-0 p-1'
          />
          {/* <Icon
          icon='ion:home'
          color='currentColor'
          width={20}
          height={20}
          className='flex-shrink-0 flex-grow-0'
        /> */}
        </Link>
        {isPathSliced && (
          <>
            <Icon
              icon={separator}
              color='currentColor'
              width={20}
              height={20}
            />
            <ButtonIcon
              icon={"ion:ellipsis-horizontal"}
              variant='transparent'
              className='flex-shrink-0 flex-grow-0 p-1'
              ref={setMenuAnchor}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setMenuOpen(!menuOpen);
              }}
            />
            {/* <span className='mx-1'>...</span> */}
          </>
        )}
        {breadcrumbPaths.map((path, index) => (
          <Fragment key={`breadcrumb-${path}@${index}`}>
            <Icon
              icon={separator}
              color='currentColor'
              width={20}
              height={20}
              className='flex-shrink-0 flex-grow-0'
            />
            <Link
              href={path.path}
              className={`${
                path.path === router.asPath
                  ? "text-primary-50 pointer-events-none cursor-default"
                  : "text-primary-300 hover:text-primary-100 cursor-pointer"
              } transition-smooth max-w-md mx-1 w-fit ${
                index === breadcrumbPaths.length - 1 &&
                "line-clamp-1"
              }`}
            >
              {decodeURIComponent(path.label)}
            </Link>
          </Fragment>
        ))}
      </div>

      <ClickAway
        open={menuOpen}
        onClickAway={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setMenuOpen(false);
        }}
        className={`w-screen h-screen z-30 fixed top-0 left-0 transition-smooth backdrop-blur-none ${
          menuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          id='more-menu'
          className={`absolute drop-shadow-md mr-4 w-full max-w-sm bg-primary-800 rounded-lg shadow-lg overflow-hidden transition-opacity transition-smooth ${
            menuOpen
              ? `opacity-100 pointer-events-auto`
              : `opacity-0 pointer-events-none `
          }`}
          style={{
            top: menuAnchor
              ? menuAnchor?.getBoundingClientRect()
                  .bottom ?? 0
              : "unset",
            left: menuAnchor
              ? menuAnchor?.getBoundingClientRect().left ??
                0
              : "unset",
          }}
        >
          <div className='w-full bg-primary-800 flex flex-col gap-1'>
            {hiddenPaths.map((path, index) => (
              <Link
                href={path.path}
                key={`hidden-path-${path}@${index}`}
                className='flex items-center gap-2 hover:bg-primary-50 hover:text-primary-950 cursor-pointer p-2 w-full'
                title={decodeURIComponent(path.label)}
              >
                {decodeURIComponent(path.label)}
              </Link>
            ))}
          </div>
        </div>
      </ClickAway>
    </>
  );
}
