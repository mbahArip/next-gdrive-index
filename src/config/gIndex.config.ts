import { icons } from "lucide-react";
import { Metadata } from "next";
import { ToastPosition } from "react-hot-toast";
import colors from "tailwindcss/colors";

const config: gIndexConfig = {
  /**
   * If possible, please don't change this value
   * Even if you're creating a PR, just let me change it myself
   */
  version: "2.0",
  /**
   * Base path of the app, used for generating links
   * If you're not using Vercel, you need to change this to your domain name
   *
   * 2023/09/10: This is not used anymore, edit via env variable instead
   *
   * @default process.env.NEXT_PUBLIC_VERCEL_URL
   */
  basePath:
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`,

  /**
   * DEPRECATED
   *
   * Hashed key for fetching protected files / folders from the server
   * This key will bypass the file / folder password
   */
  // masterKey: "masterkey",

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
    isTeamDrive: false, // Set this to true if you're using Team Drive
    defaultQuery: [
      "trashed = false",
      "(not mimeType contains 'google-apps' or mimeType contains 'folder')",
    ],
    defaultField:
      "id, name, mimeType, thumbnailLink, fileExtension, modifiedTime, size, imageMediaMetadata, videoMediaMetadata, webContentLink, trashed",
    defaultOrder: "folder, name asc, modifiedTime desc",
    itemsPerPage: 12,
    searchResult: 10,

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
     * Site Name will be used for default metadata title
     * Site Name Template will be used if the page has a title
     * %s will be replaced with the page title
     *
     * You can set it to undefined if you don't want to use it
     */
    siteName: "next-gdrive-index",
    siteNameTemplate: "%s - next-gdrive-index",
    siteDescription: "A simple file browser for Google Drive",
    siteIcon: "/flaticon.svg",
    siteAuthor: "mbaharip",
    favIcon: "/favicon.svg",
    /**
     * Next.js Metadata robots object
     *
     * ref: https://nextjs.org/docs/app/api-reference/functions/generate-metadata#robots
     */
    robots: undefined,
    twitterHandle: "@mbaharip_",

    /**
     * Footer content
     * You can use string or array of string for multiple lines
     * You can also set it to empty array if you don't want to use it
     *
     * Basic markdown is supported (bold, italic, and link)
     * External link will be opened in new tab
     *
     * Template:
     * - {{ year }} will be replaced with the current year
     * - {{ repository }} will be replaced with the original repository link
     * - {{ author }} will be replaced with author from siteAuthor config above (If it's not set, it will be set to mbaharip)
     * - {{ version }} will be replaced with the current version
     * - {{ siteName }} will be replaced with the siteName config above
     * - {{ creator }} will be replaced with mbaharip if you want to credit me
     */
    footer: [
      "{{ siteName }} *v{{ version }}* @ {{ repository }}",
      "{{ year }} - Made with ❤️ by **{{ author }}**",
    ],

    /**
     * DEPRECATED
     * Since we're using shadcn/ui now, please refer to their theming documentation
     * https://ui.shadcn.com/docs/theming
     *
     * Or you can use their themes, and replace the color in /src/app/globals.css
     * https://ui.shadcn.com/themes
     *
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
    privateIndex: true,

    /**
     * Maximum breadcrumb length
     * If the breadcrumb is longer than this, it will be shortened
     */
    breadcrumbMax: 3,

    /**
     * Toast notification configuration
     *
     * position: Self-explanatory
     * duration: duration before the toast disappear in milliseconds
     */
    toaster: {
      position: "bottom-right",
      duration: 3000,
    },

    /**
     * Example item:
     * {
     *  icon: string, // icon name from lucide icons (https://lucide.dev/icons/)
     *  name: string,
     *  href: string,
     *  external?: boolean
     * }
     */
    navbarItems: [
      {
        icon: "FileText",
        name: "Documentation",
        href: "https://github.com/mbahArip/next-gdrive-index/wiki",
        external: true,
      },
      {
        icon: "Github",
        name: "Github",
        href: "https://www.github.com/mbaharip",
        external: true,
      },
      {
        icon: "Mail",
        name: "Contact",
        href: "mailto:support@mbaharip.com",
      },
    ],

    /**
     * Add support / donation links on the navbar
     * Example item:
     * {
     *  name: string,
     *  currency: string,
     *  href: string,
     * }
     */
    supports: [
      {
        name: "Paypal",
        currency: "USD",
        href: "https://paypal.me/mbaharip",
      },
      {
        name: "Ko-fi",
        currency: "USD",
        href: "https://ko-fi.com/mbaharip",
      },
      {
        name: "Saweria",
        currency: "IDR",
        href: "https://saweria.co/mbaharip",
      },
    ],
  },
};

export default config;

interface gIndexConfig {
  version: string;
  basePath: string;
  // masterKey: string;
  cacheControl: string;

  apiConfig: {
    rootFolder: string;
    isTeamDrive: boolean;
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
    siteNameTemplate?: string;
    siteDescription: string;
    siteIcon: string;
    siteAuthor?: string;
    favIcon: string;
    robots?: Metadata["robots"];
    twitterHandle?: string;

    footer: string | string[];

    defaultAccentColor?: keyof typeof colors;

    privateIndex: boolean;
    breadcrumbMax: number;

    toaster?: {
      position?: ToastPosition;
      duration?: number;
    };

    navbarItems: {
      icon: keyof typeof icons;
      name: string;
      href: string;
      external?: boolean;
    }[];
    supports: {
      name: string;
      currency: string;
      href: string;
    }[];
  };
}
