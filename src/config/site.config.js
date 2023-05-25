import {
  BsEnvelopeAt,
  BsGithub,
  BsPaypal,
} from "react-icons/bs";

const config = {
  /* Site MetaData */
  siteName: "mbahArip Stash",
  siteDescription:
    "Personal Stash of mbahArip, a place to store my files.",

  /* General */
  /**
   * Site wide password protection
   */
  privateIndex: false,
  indexPassword:
    "640e3e38dd31aec254f214ba38541a82ddb615e73ce9c6129f33ef549b154ab9",

  navbar: {
    /**
     * Title beside the logo
     * If not set, will be using `siteName` instead
     */
    title: "",
    links: [
      {
        icon: BsGithub,
        name: "GitHub",
        href: "https://www.github.com/mbaharip",
        newTab: true,
      },
      {
        icon: BsPaypal,
        name: "Donate",
        href: "https://www.paypal.me/mbaharip",
        newTab: true,
      },
      {
        icon: BsEnvelopeAt,
        name: "Email",
        href: "mailto:support@mbaharip.com",
      },
      {
        name: "Main Website",
        href: "https://www.mbaharip.com",
        newTab: true,
      },
    ],
  },
  files: {
    /**
     * Limit breadcrumb to specific depth
     * 0 = Unlimited
     * 1 = Only show current file
     * 2 = Show current file and its parent
     * 3 = Show current file, its parent and grandparent
     * and so on.
     * Default: 2
     */
    breadcrumbDepth: 2,
    breadcrumbLimiter: "/",
    /**
     * Limit thumbnail to specific file group
     * Refer to typeGroup on /src/utils/fileHelper/fileGroup.ts:1
     * Will use google drive thumbnailLink
     * If thumbnailLink not available, will use Icon instead
     */
    allowThumbnailFileType: ["image", "video", "pdf"],
  },
  footer: {
    /**
     * Footer text will be rendered as
     * {year} {footerText} - next-gdrive-index ❤️
     */
    text: "mbahArip Stash",
    renderYear: true,
  },
};

export default config;
