import Link from "next/link";

import siteConfig from "config/site.config";

function Footer() {
  return (
    <footer
      className={
        "flex w-full items-center justify-center gap-2 bg-zinc-100 py-1 dark:bg-zinc-900"
      }
    >
      <span className={"text-xs font-semibold"}>
        {siteConfig.footer.renderYear &&
          new Date().getFullYear()}{" "}
        {siteConfig.footer.text} -{" "}
        <Link
          role={"url"}
          href={
            "https://www.github.com/mbaharip/next-gdrive-index"
          }
          target={"_blank"}
          rel={"noreferrer noopener"}
        >
          next-gdrive-index
        </Link>{" "}
        ❤️
      </span>
    </footer>
  );
}

export default Footer;
