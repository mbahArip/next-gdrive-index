"use client";

import { useRef, useState } from "react";
import toast from "react-hot-toast";
import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import rehypePrism from "rehype-prism-plus";
import rehypeRaw from "rehype-raw";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkSlug from "remark-slug";
import remarkToc from "remark-toc";
import { cn } from "~/utils";

import Icon from "~/components/Icon";

import "./highlight.css";

type Props = {
  content: string;
  view: "markdown" | "raw";
  className?: string;
};
export default function Markdown({ content, view, className }: Props) {
  return (
    <div className={cn("flex flex-col p-3", className)}>
      <div
        className={cn(
          "markdown w-full rounded-[var(--radius)]",
          view !== "raw" && "hidden",
        )}
      >
        <pre className='w-full whitespace-pre-wrap break-words bg-transparent !p-0 shadow shadow-background'>
          {content}
        </pre>
      </div>
      <div
        className={cn(
          "markdown w-full rounded-[var(--radius)]",
          view !== "markdown" && "hidden",
        )}
      >
        <ReactMarkdown
          className='w-full'
          disallowedElements={["script"]}
          remarkPlugins={[
            remarkGfm,
            remarkMath,
            remarkSlug,
            remarkToc,
            remarkBreaks,
          ]}
          rehypePlugins={[
            rehypeKatex,
            rehypeRaw,
            [rehypePrism, { ignoreMissing: true }],
          ]}
          components={{
            p: ({ node, children, ...props }) => (
              <p
                {...props}
                className='paragraph text-balance'
              >
                {children}
              </p>
            ),
            pre: PreComponent,
            code: ({ node, inline, className, children, ...props }) => (
              <code
                className={`${className} font-mono !text-sm`}
                {...props}
              >
                {children}
              </code>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}

interface PreProps extends React.HTMLAttributes<HTMLPreElement> {}
function PreComponent(props: PreProps) {
  const codeRef = useRef<HTMLPreElement | null>(null);
  const [showCopy, setShowCopy] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [copyTimeout, setCopyTimeout] = useState<NodeJS.Timeout>();

  const handleCopy = () => {
    if (!codeRef.current) return;
    if (isCopied || isError) return;
    if (copyTimeout) clearTimeout(copyTimeout);
    const toastId = `copy-${Math.random() * 1000}`;
    toast.loading("Copying code to clipboard...", {
      id: toastId,
    });
    try {
      navigator.clipboard.writeText(codeRef.current.textContent as string);
      setIsError(false);
      setIsCopied(true);
      setCopyTimeout(
        setTimeout(() => {
          setIsCopied(false);
        }, 2000),
      );
      toast.success("Code copied to clipboard", {
        id: toastId,
      });
    } catch (error: any) {
      setIsCopied(false);
      setIsError(true);
      setCopyTimeout(
        setTimeout(() => {
          setIsError(false);
        }, 2000),
      );
      toast.error("Failed to copy code to clipboard", {
        id: toastId,
      });
    }
  };

  return (
    <div
      className={`relative h-full w-full`}
      onMouseEnter={() => {
        setShowCopy(true);
      }}
      onMouseLeave={() => {
        setShowCopy(false);
        setIsCopied(false);
        setIsError(false);
      }}
    >
      <div className={`transition-smooth absolute right-0 top-0 p-1.5`}>
        <div
          className='cursor-pointer rounded-[var(--radius)] bg-background p-1.5'
          onClick={() => {
            handleCopy();
          }}
        >
          <Icon
            name={isCopied ? "Check" : isError ? "X" : "Copy"}
            className={
              isCopied
                ? "text-green-500"
                : isError
                ? "text-red-500"
                : "text-foreground"
            }
            size={16}
          />
        </div>
      </div>
      <pre
        ref={codeRef}
        {...props}
        className='overflow-x-auto border border-border shadow shadow-background'
      >
        {props.children}
      </pre>
    </div>
  );
}
