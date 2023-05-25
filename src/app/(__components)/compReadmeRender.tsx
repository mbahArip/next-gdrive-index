"use client";

import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import rehypePrism from "rehype-prism-plus";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkSlug from "remark-slug";
import remarkToc from "remark-toc";

import shortEncryption from "utils/encryptionHelper/shortEncryption";

import "styles/highlight.css";
import "styles/markdown.css";

type Props = {
  data: string;
};

function CompReadmeRender({ data }: Props) {
  return (
    <div className={"markdown w-full"}>
      <ReactMarkdown
        remarkPlugins={[
          remarkGfm,
          remarkMath,
          remarkSlug,
          remarkToc,
        ]}
        rehypePlugins={[
          rehypeKatex,
          rehypeRaw,
          [rehypePrism, { ignoreMissing: true }],
        ]}
      >
        {shortEncryption.decrypt(data)}
      </ReactMarkdown>
    </div>
  );
}

export default CompReadmeRender;
