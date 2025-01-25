"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import { NO_LAYOUT_PATHS } from "~/constant";

import { Skeleton } from "~/components/ui/skeleton";

import useLoading from "~/hooks/useLoading";

import config from "config";

type Props = {
  content?: string;
};
export default function Footer({ content }: Props) {
  const pathname = usePathname();
  const loading = useLoading();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loadTime, setLoadTime] = useState<number>(0);

  if (NO_LAYOUT_PATHS.some((path) => new RegExp(path).test(pathname))) return null;

  return (
    <footer className='flex w-full flex-col items-center justify-center pb-3'>
      {config.siteConfig.experimental_pageLoadTime &&
        (loading ? (
          <Skeleton className='h-4 w-40 max-w-96' />
        ) : (
          <span className='text-center text-sm text-muted-foreground'>
            Page loaded in{" "}
            {config.siteConfig.experimental_pageLoadTime === "ms"
              ? `${Math.round(loadTime ?? 0)}`
              : `${loadTime?.toFixed(2)}`}
            {config.siteConfig.experimental_pageLoadTime}
          </span>
        ))}
      {content && (
        <ReactMarkdown
          className='flex w-full select-none flex-col items-center justify-center text-center'
          components={{
            p: ({ children, ...props }) => (
              <p
                {...props}
                className='muted text-balance text-sm'
              >
                {children}
              </p>
            ),
            a: ({ children, ...props }) => {
              const isExternal = props.href?.startsWith("http");

              return (
                <a
                  {...props}
                  className='text-balance text-sm text-blue-600 opacity-80 transition-all duration-300 hover:opacity-100 dark:text-blue-400'
                  target={isExternal ? "_blank" : undefined}
                  rel={isExternal ? "noopener noreferrer" : undefined}
                >
                  {children}
                </a>
              );
            },
          }}
          remarkPlugins={[remarkBreaks]}
        >
          {content}
        </ReactMarkdown>
      )}
    </footer>
  );
}
