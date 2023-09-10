import gIndexConfig from "config";
import { NextSeo, NextSeoProps } from "next-seo";
import { useRouter } from "next/router";
import { ReactNode, useEffect, useState } from "react";

import {
  addNewPassword,
  checkPathPassword,
} from "utils/passwordHelper";

import { Constant } from "types/constant";

import PasswordLayout from "../Password";

interface LoaderLayoutProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  seo?: NextSeoProps;
}

export default function LoaderLayout(
  props: LoaderLayoutProps,
) {
  const router = useRouter();
  const { children, seo, className, ...rest } = props;
  const sitePassword =
    process.env.NEXT_PUBLIC_SITE_PASSWORD;

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isPasswordUnlocked, setIsPasswordUnlocked] =
    useState<boolean>(
      gIndexConfig.siteConfig.privateIndex ? false : true,
    );

  const handlePrivateIndexCheck = () => {
    const cookie =
      document.cookie
        .split(";")
        .find((cookie) =>
          cookie.startsWith(
            `${Constant.cookies_SitePassword}=`,
          ),
        ) ?? undefined;
    if (cookie) {
      const password = cookie.split("=")[1];
      if (!password) return setIsPasswordUnlocked(false);
      if (!sitePassword)
        throw new Error("Can't find site password");

      const valid = checkPathPassword(
        "site-wide",
        password,
        sitePassword as string,
      );
      if (valid) return setIsPasswordUnlocked(true);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    new Promise((resolve) =>
      resolve(handlePrivateIndexCheck()),
    ).then(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const routeChangeStart = () => setIsLoading(true);
    const routeChangeComplete = () => {
      handlePrivateIndexCheck();
      setIsLoading(false);
    };

    router.events.on("routeChangeStart", routeChangeStart);
    router.events.on(
      "routeChangeComplete",
      routeChangeComplete,
    );
    router.events.on(
      "routeChangeError",
      routeChangeComplete,
    );

    return () => {
      router.events.off(
        "routeChangeStart",
        routeChangeStart,
      );
      router.events.off(
        "routeChangeComplete",
        routeChangeComplete,
      );
      router.events.off(
        "routeChangeError",
        routeChangeComplete,
      );
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.events]);

  return (
    <>
      <NextSeo {...seo} />
      {isLoading ? (
        <div className='w-full h-auto flex items-center justify-center'>
          <div className='flex flex-col gap-4 items-center justify-center animate-pulse'>
            <div className='w-fit h-fit relative grid place-items-center'>
              <img
                src={gIndexConfig.siteConfig.siteIcon}
                alt={gIndexConfig.siteConfig.siteName}
                className='w-12 -top-1 relative'
              />
              <div className='absolute w-12 h-12 bg-transparent border border-primary-50 rounded-full animate-ping' />
            </div>
            <span>Validating path...</span>
          </div>
        </div>
      ) : (
        <div
          className={`w-full h-auto flex flex-col p-4 tablet:px-8 desktop:px-16 ${className}`}
          {...rest}
          key={router.asPath}
        >
          {gIndexConfig.siteConfig.privateIndex &&
          !isPasswordUnlocked ? (
            <PasswordLayout
              path='Private Mode Password'
              onSubmitted={(password) => {
                const cookie =
                  document.cookie
                    .split(";")
                    .find((cookie) =>
                      cookie.startsWith(
                        `${Constant.cookies_SitePassword}=`,
                      ),
                    ) ?? undefined;
                addNewPassword(
                  "site-wide",
                  password,
                  cookie?.split("=")[1] ?? undefined,
                );
                setIsLoading(true);
                const validPassword = () => {
                  const cookie =
                    document.cookie
                      .split(";")
                      .find((cookie) =>
                        cookie.startsWith(
                          `${Constant.cookies_SitePassword}=`,
                        ),
                      ) ?? undefined;
                  if (cookie) {
                    const password = cookie.split("=")[1];
                    if (!password) return false;
                    if (!sitePassword)
                      throw new Error(
                        "Can't find site password",
                      );

                    const valid = checkPathPassword(
                      "site-wide",
                      password,
                      sitePassword as string,
                    );
                    return valid;
                  }
                };
                new Promise((resolve) =>
                  resolve(validPassword()),
                )
                  .then((data) => {
                    if (data) {
                      setIsPasswordUnlocked(true);
                    } else {
                      setIsPasswordUnlocked(false);
                    }
                  })
                  .finally(() => setIsLoading(false));
              }}
            />
          ) : (
            <>{children}</>
          )}
        </div>
      )}
    </>
  );
}
