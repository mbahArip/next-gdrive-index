import { jetbrainsMono } from "pages/_app";
import { useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { toast } from "react-toastify";
import rehypeKatex from "rehype-katex";
import rehypePrism from "rehype-prism-plus";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkSlug from "remark-slug";
import remarkToc from "remark-toc";

import Button from "components/Button";

import "styles/highlight.css";
import "styles/markdown.css";

interface PreProps extends React.HTMLAttributes<HTMLPreElement> {}
function PreComponent(props: PreProps) {
  const codeRef = useRef<HTMLPreElement | null>(null);
  const [showCopy, setShowCopy] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [copyTimeout, setCopyTimeout] = useState<NodeJS.Timeout>();

  const handleCopy = () => {
    if (!codeRef.current) return;
    if (copyTimeout) clearTimeout(copyTimeout);
    try {
      navigator.clipboard.writeText(codeRef.current.textContent as string);
      setIsError(false);
      setIsCopied(true);
      setCopyTimeout(
        setTimeout(() => {
          setIsCopied(false);
        }, 2000),
      );
      toast.success("Code copied to clipboard");
    } catch (error: any) {
      setIsCopied(false);
      setIsError(true);
      setCopyTimeout(
        setTimeout(() => {
          setIsError(false);
        }, 2000),
      );
      toast.error("Failed to copy code to clipboard");
    }
  };

  return (
    <div
      className={`w-full h-full relative`}
      onMouseEnter={() => {
        setShowCopy(true);
      }}
      onMouseLeave={() => {
        setShowCopy(false);
        setIsCopied(false);
        setIsError(false);
      }}
    >
      <div className={`absolute top-0 right-0 p-2 ${showCopy ? "opacity-100" : "opacity-0"} transition-smooth`}>
        <Button
          size='small'
          rounded='medium'
          variant={isError ? "danger" : isCopied ? "success" : "primary"}
          startIcon={isCopied ? "ion:checkmark" : isError ? "ion:close" : "ion:copy"}
          disabled={isCopied || isError}
          onClick={() => {
            handleCopy();
          }}
        >
          {isCopied ? "Copied!" : isError ? "Failed to copy" : "Copy"}
        </Button>
      </div>
      <pre
        ref={codeRef}
        {...props}
        className='overflow-x-auto'
      >
        {props.children}
      </pre>
    </div>
  );
}

interface MarkdownProps {
  content: string;
}
export default function Markdown(props: MarkdownProps) {
  return (
    <div className='markdown w-full'>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath, remarkSlug, remarkToc]}
        rehypePlugins={[rehypeKatex, rehypeRaw, [rehypePrism, { ignoreMissing: true }]]}
        components={{
          pre: PreComponent,
          code: ({ node, inline, className, children, ...props }) => (
            <code
              className={`${className} ${jetbrainsMono.className}`}
              {...props}
            >
              {children}
            </code>
          ),
        }}
      >
        {props.content}
      </ReactMarkdown>
    </div>
  );
}
