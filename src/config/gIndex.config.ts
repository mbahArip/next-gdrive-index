import colors from "tailwindcss/colors";

const config: gIndexConfig = {
  version: "1.0.0",
  /**
   * Base path of the app, used for generating links
   * If you're not using Vercel, you need to change this to your domain name
   *
   * 2023/09/10: This is not used anymore, edit via env variable instead
   *
   * @default process.env.NEXT_PUBLIC_VERCEL_URL
   */
  basePath:
    process.env.NODE_ENV === "development" ? "http://localhost:3000" : `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`,

  /**
   * Hashed key for fetching protected files / folders from the server
   * This key will bypass the file / folder password
   *
   * 2023/09/10: This is not used anymore
   */
  masterKey: "masterkey",

  /**
   * How long the cache will be stored in the browser
   * Used for all pages and api routes
   * Default is 5 minutes (300/60 = 5min)
   *
   * @default "max-age=300, s-maxage=300, stale-while-revalidate, public"
   */
  cacheControl: "max-age=300, s-maxage=300, stale-while-revalidate, public",

  apiConfig: {
    /**
     * Starting point of the drive.
     * Will be used for '/' route.
     *
     * Since service account can't access 'root' folder
     * You need to create a new folder and share it with the service account
     * Then, copy the folder id and paste it here
     */
    rootFolder: "1KgPV6QB1GYT8fmn2uTfbtr9rDXqcRR0j",

    defaultQuery: ["trashed = false", "(not mimeType contains 'google-apps' or mimeType contains 'folder')"],
    defaultField:
      "id, name, mimeType, thumbnailLink, fileExtension, modifiedTime, size, imageMediaMetadata, videoMediaMetadata, webContentLink, trashed",
    defaultOrder: "folder, name asc, modifiedTime desc",
    itemsPerPage: 50,
    searchResult: 5,

    /**
     * Special file name that will be used for certain purposes
     * These files will be ignored when searching for files
     * and will be hidden from the files list by default
     */
    specialFile: {
      password: ".password",
      readme: ".readme.md",
      /**
       * Banner will be used for opengraph image for folder
       * By default, all folder will use default og image
       */
      banner: ".banner",
    },
    hiddenFiles: [".password", ".readme.md", ".banner"],

    /**
     * Allow user to download protected file without password.
     * If this set to false, download link will have temporary token attached to it
     * If this set to true, user can download the file without password as long as they have the link
     *
     * Default: false
     */
    allowDownloadProtectedFile: false,
    /**
     * Duration in hours.
     *
     * Default: 6 hours
     */
    temporaryTokenDuration: 6,

    /**
     * Maximum file size that can be downloaded via api routes
     * If it's larger than this, it will be redirected to the file url
     *
     * If you're using Vercel, they have a limit of ~4 - ~4.5MB response size
     * ref: https://vercel.com/docs/platform/limits#serverless-function-payload-size-limit
     * If you're using another platform, you can match the limit with your platform
     * Or you can set this to 0 to disable the limit
     *
     * Default: 4MB
     */
    maxFileSize: 4 * 1024 * 1024,
  },

  siteConfig: {
    /**
     * This value will be used for metadata
     */
    siteName: "next-gdrive-index",
    siteDescription: "A simple file browser for Google Drive",
    siteIcon: "/flaticon.svg",
    favIcon: "/favicon.svg",
    twitterHandle: "@mbaharip_",

    /**
     * Tailwind color name.
     * Ref: https://tailwindcss.com/docs/customizing-colors
     */
    defaultAccentColor: "teal",

    /**
     * Site wide password protection
     * If this is set, all files and folders will be protected by this password
     *
     * The site password are set from Environment Variable (NEXT_GDRIVE_INDEX_PASSWORD)
     * It's because I don't want to store sensitive data in the code
     */
    privateIndex: false,

    /**
     * Example item:
     * {
     *  icon: string, // icon name from iconify (https://icon-sets.iconify.design/)
     *  name: string,
     *  href: string,
     *  external?: boolean
     * }
     */
    navbarItems: [
      {
        icon: "ion:document-text",
        name: "Documentation",
        href: "https://github.com/mbahArip/next-gdrive-index/wiki",
        external: true,
      },
      {
        icon: "ion:logo-github",
        name: "Github",
        href: "https://www.github.com/mbaharip",
        external: true,
      },
      {
        icon: "ion:logo-paypal",
        name: "Buy me a coffee",
        href: "https://www.paypal.me/mbaharip",
        external: true,
      },
      {
        icon: "ion:mail",
        name: "Contact",
        href: "mailto:support@mbaharip.com",
      },
    ],
  },
};

export default config;

interface gIndexConfig {
  version: string;
  basePath: string;
  masterKey: string;
  cacheControl: string;

  apiConfig: {
    rootFolder: string;
    defaultQuery: string[];
    defaultField: string;
    defaultOrder: string;
    itemsPerPage: number;
    searchResult: number;

    specialFile: {
      password: string;
      readme: string;
      banner: string;
    };
    hiddenFiles: string[];

    allowDownloadProtectedFile: boolean;
    temporaryTokenDuration: number;
    maxFileSize: number;
  };
  siteConfig: {
    siteName: string;
    siteDescription: string;
    siteIcon: string;
    favIcon: string;
    twitterHandle: string;

    defaultAccentColor: keyof typeof colors;

    privateIndex: boolean;

    navbarItems: {
      icon: string;
      name: string;
      href: string;
      external?: boolean;
    }[];
  };
}
