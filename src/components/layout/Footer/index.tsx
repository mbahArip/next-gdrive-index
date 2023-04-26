import siteConfig from "@config/site.config";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <div className='flex w-full items-center justify-center gap-2 py-1'>
      <span className='text-xs font-semibold'>
        {currentYear} {siteConfig.footerText} - Powered by{" "}
        <a
          className={"link"}
          href={"https://www.github.com/mbaharip/gudora-index"}
          target={"blank"}
          rel={"noreferrer noopener"}
        >
          gudora-index
        </a>{" "}
        ❤️
      </span>
    </div>
  );
}
