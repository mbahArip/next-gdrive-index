import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkSlug from "remark-slug";
import remarkToc from "remark-toc";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import rehypePrism from "rehype-prism-plus";
import { SpecialComponents } from "react-markdown/lib/ast-to-react";
import { NormalComponents } from "react-markdown/lib/complex-types";
import config from "@/config/site.config";

type Props = {
  content: string;
};

const customComponents: Partial<
  Omit<NormalComponents, keyof SpecialComponents> & SpecialComponents
> = {
  img({ alt, src, ...props }: any) {
    return (
      <div className='my-4 flex flex-col gap-0'>
        <img
          src={src}
          alt={alt}
          className='mx-auto w-full max-w-screen-tablet rounded-lg drop-shadow'
          {...props}
        />
        {config.readme.renderImageAlt && (
          <span className='my-0.5 text-center text-sm italic tablet:text-base'>
            {alt} |{" "}
            <a
              href={src}
              target='_blank'
              rel='noopener noreferrer'
            >
              Open in new tab
            </a>
          </span>
        )}
      </div>
    );
  },
};

export default function MarkdownRender({ content }: Props) {
  return (
    <div className='markdown'>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath, remarkSlug, remarkToc]}
        rehypePlugins={[rehypeKatex, rehypeRaw, rehypePrism]}
        components={customComponents}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
