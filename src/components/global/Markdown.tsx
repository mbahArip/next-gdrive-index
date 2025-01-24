"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { type SpecialComponents } from "react-markdown/lib/ast-to-react";
import { type NormalComponents } from "react-markdown/lib/complex-types";
import rehypeKatex from "rehype-katex";
import rehypePrism from "rehype-prism-plus";
import rehypeRaw from "rehype-raw";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkSlug from "remark-slug";
import remarkToc from "remark-toc";
import { toast } from "sonner";

import Icon from "~/components/ui/icon";

import { cn } from "~/lib/utils";

type Props = {
  content: string;
  view?: "markdown" | "raw";
  className?: string;
  customComponents?: Partial<Omit<NormalComponents, keyof SpecialComponents> & SpecialComponents>;
};
export default function Markdown({ content, view, className, customComponents }: Props) {
  const [viewState, setViewState] = useState<"markdown" | "raw">(view ?? "markdown");

  useEffect(() => {
    if (view) setViewState(view);
  }, [view]);

  return (
    <div
      slot='markdown-container'
      className={cn("flex flex-col py-3", className)}
    >
      {viewState === "raw" ? (
        <div className={cn("markdown w-full rounded-lg bg-background")}>
          <pre className='w-full whitespace-pre-wrap break-words bg-transparent p-0 text-sm tablet:p-2'>{content}</pre>
        </div>
      ) : (
        <div className={cn("markdown w-full rounded-lg")}>
          <ReactMarkdown
            className='prose w-full !max-w-none px-0 dark:prose-invert tablet:px-2'
            disallowedElements={["script"]}
            remarkPlugins={[remarkGfm, remarkMath, remarkSlug, remarkToc, remarkBreaks]}
            rehypePlugins={[rehypeKatex, rehypeRaw, [rehypePrism, { ignoreMissing: true }]]}
            components={{
              img: ({ src, alt, className, ...props }) => {
                return (
                  <>
                    <img
                      src={src}
                      alt={alt}
                      className={cn("mx-auto max-w-screen-md cursor-pointer rounded-lg", className)}
                      onClick={() => {
                        window.open(src, "_blank");
                      }}
                      {...props}
                    />
                    {alt && <figcaption className='mt-1 text-center text-sm text-muted-foreground'>{alt}</figcaption>}
                  </>
                );
              },
              a: ({ href, target, rel, className, ...props }) => {
                if (!href) return null;
                const isRelative = href.startsWith("/");

                return (
                  <a
                    href={href}
                    target={isRelative ? target : "_blank"}
                    rel={isRelative ? rel : "noreferer"}
                    className={cn("!whitespace-pre-wrap !break-words", className)}
                    {...props}
                  />
                );
              },
              p: ({ children, ...props }) => (
                <p
                  {...props}
                  className='paragraph text-pretty'
                >
                  {children}
                </p>
              ),
              pre: PreComponent,
              code: ({ inline: _inline, className, children, ...props }) => (
                <code
                  className={cn(`!whitespace-pre-wrap break-words font-mono !text-sm`, className)}
                  {...props}
                >
                  {children}
                </code>
              ),
              ...customComponents,
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
}

function PreComponent(props: React.HTMLAttributes<HTMLPreElement>) {
  const codeRef = useRef<HTMLPreElement | null>(null);

  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">("idle");
  const copyTimeout = useRef<NodeJS.Timeout>();

  const handleCopy = useCallback(async () => {
    if (!codeRef.current) return;
    if (copyStatus !== "idle") return;
    if (copyTimeout.current) clearTimeout(copyTimeout.current);

    const toastId = `copy-${Math.random() * 1000}`;
    toast.loading("Copying content to clipboard...", {
      id: toastId,
    });

    try {
      if (!codeRef.current.textContent) throw new Error("No content to copy");
      await navigator.clipboard.writeText(codeRef.current.textContent);
      setCopyStatus("copied");
      copyTimeout.current = setTimeout(() => {
        setCopyStatus("idle");
      }, 2000);
      toast.success("Code copied to clipboard", {
        id: toastId,
      });
    } catch (e) {
      console.error(e);
      setCopyStatus("error");
      copyTimeout.current = setTimeout(() => {
        setCopyStatus("idle");
      }, 2000);
      toast.error("Failed to copy code to clipboard", {
        id: toastId,
      });
    }
  }, [copyStatus]);

  return (
    <div className={`relative h-full w-full`}>
      <div className={`transition-smooth absolute right-0 top-0 p-1.5`}>
        <div
          className='group cursor-pointer rounded-lg bg-background p-1.5 opacity-75 transition duration-300 ease-in-out hover:opacity-100'
          data-state={copyStatus}
          onClick={() => {
            handleCopy().catch(() => {
              toast.error("Failed to copy code to clipboard");
            });
          }}
        >
          <Icon
            name='Copy'
            className='hidden size-4 group-data-[state=idle]:block'
          />
          <Icon
            name='Check'
            className='hidden size-4 stroke-green-600 group-data-[state=copied]:block dark:stroke-green-400'
          />
          <Icon
            name='X'
            className='hidden size-4 stroke-destructive group-data-[state=error]:block'
          />
        </div>
      </div>
      <pre
        ref={codeRef}
        {...props}
        className='overflow-x-auto border border-border shadow shadow-background'
        style={{
          ...props,
          backgroundColor: "var(--syntax-bg) !important",
        }}
      >
        {props.children}
      </pre>
    </div>
  );
}
