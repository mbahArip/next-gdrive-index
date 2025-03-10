import { type z } from "zod";
import { BASE_URL, IS_DEV } from "~/constant";

import { type Schema_Config } from "~/types/schema";

const config: z.input<typeof Schema_Config> = {
  /**
   * If possible, please don't change this value
   * Even if you're creating a PR, just let me change it myself
   */
  version: "2.4.2",
  /**
   * Base path of the app, used for generating links
   *
   * If you're using another port for development, you can set it here
   *
   * @default process.env.NEXT_PUBLIC_DOMAIN
   * @fallback process.env.NEXT_PUBLIC_VERCEL_URL
   */
  basePath: IS_DEV ? "http://localhost:3000" : `https://${BASE_URL}`,

  /**
   * Show deploy guide dropdown on navbar
   * that contains the deploy guide and configurator
   *
   * Set this to false on final deployment, except you want to show it
   *
   * @default false
   */
  showGuideButton: true,

  /**
   * How long the cache will be stored in the browser
   * Used for all pages and api routes
   *
   * @default "public, max-age=60, s-maxage=60, stale-while-revalidate"
   */
  cacheControl: "public, max-age=60, s-maxage=60, stale-while-revalidate",

  apiConfig: {
    /**
     * Starting point of the drive.
     * Will be used for '/' route.
     *
     * Since service account can't access 'root' folder
     * You need to create a new folder and share it with the service account
     * Then, copy the folder id and paste it here
     */
    rootFolder:
      "e0a5fd4f9f7d05d220e517ef3ef4de7acf4277b64a09b916e8ee30703f0d6fd1cdbde87601a667ca61afd1a702e203e6ec;e13a51f76049b2e4e02c5d41",

    /**
     * If your rootfolder inside a shared drive, you NEED to set this to true
     * If not, you can set this to false
     *
     * You also need to set the shared drive ID to make it work
     * Make sure you have add your service account to the shared drive since the service account can't access the shared drive by default
     *
     * Where to get the shared drive id?
     * Go to your Shared Drive > Click on the shared drive > copy the ID from the url
     * ex: https://drive.google.com/drive/u/0/folders/:shared_drive_id
     *
     * Then you need to encrypt it using `/api/internal/encrypt?q=:shared_drive_id` route
     */
    isTeamDrive: true,
    sharedDrive: "908f663cfd7fa75a494061c4856f03c76ac72430d9212bb34bc0707d1867cfece98664;5f1d6ec93903f2af7b9cfe2f",

    defaultQuery: ["trashed = false", "(not mimeType contains 'google-apps' or mimeType contains 'folder')"],
    defaultField:
      "id, name, mimeType, thumbnailLink, fileExtension, modifiedTime, size, imageMediaMetadata, videoMediaMetadata, webContentLink, trashed",
    defaultOrder: "folder, name asc, modifiedTime desc",
    itemsPerPage: 50,
    searchResult: 5,

    /**
     * By default, the app will use the thumbnail URL from Google Drive
     *
     * Sometimes, the thumbnail can't be accessed because of CORS policy
     * If you're having this issue, you can set this to true
     *
     * This will make the api fetch the thumbnail and serve it from the server
     * instead of using the Google Drive thumbnail
     *
     * This will increase the server load, so use it wisely
     *
     * Default: true
     */
    proxyThumbnail: true,

    /**
     * Only show preview for files that are smaller than this size
     * If the file is larger than this size, it will show "can't preview" message instead
     *
     * Why?
     * Since the stream endpoint are counted as a bandwidth usage
     * I want to limit the preview to only small files
     * It also to prevent abuse from the user
     *
     * You can also set this to 0 to disable the limit
     *
     * Default: 100MB
     */
    streamMaxSize: 100 * 1024 * 1024,

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
    /**
     * Reason why banner has multiple extensions:
     * - If I use contains query, it will also match the file or folder that contains the word.
     *   (e.g: File / folder with the name of "Test Password" will be matched)
     * - If I use = query, it will only match the exact name, hence the multiple extensions
     *
     * You can add more extensions if you want
     */
    hiddenFiles: [".password", ".readme.md", ".banner", ".banner.jpg", ".banner.png", ".banner.webp"],

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
     * In version 2, this will be used for download link expiration.
     * If you need it under 1 hour, you can use math expression. (e.g: (5 / 60) * 1 = 5 minutes)
     *
     * This only affect when the user download the file
     * For example if you set it for example 30 minutes (0.5)
     * After 30 minutes, and the user still downloading the file, the download will NOT be interrupted
     * But if the user refresh the page / trying to download again, the download link will be expired
     *
     * Default: 1 hour
     */
    temporaryTokenDuration: 1,

    /**
     * Maximum file size that can be downloaded via api routes
     * If it's larger than this, it will be redirected to the file url
     *
     * If you're using Vercel, they have a limit of ~4 - ~4.5MB response size
     * ref: https://vercel.com/docs/functions/runtimes#request-body-size
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
     * %t will be replaced with the site name
     *
     * You can set it to undefined if you don't want to use it
     */
    siteName: "next-gdrive-index",
    siteNameTemplate: "%s - %t",
    siteDescription: "A simple file browser for Google Drive",
    siteIcon: "/logo.svg",
    siteAuthor: "mbaharip",
    favIcon: "/favicon.png",
    /**
     * Next.js Metadata robots object
     *
     * ref: https://nextjs.org/docs/app/api-reference/functions/generate-metadata#robots
     */
    robots: "noindex, nofollow",
    twitterHandle: "@mbaharip_",

    /**
     * Show file extension on the file name
     * Example:
     *    true       |   false
     *    file.txt   |   file
     *    100KB      |   txt / 100KB
     *
     * Default: false
     */
    showFileExtension: true,

    /**
     * Footer content
     * You can also set it to empty array if you don't want to use it
     *
     * Basic markdown is supported (bold, italic, and link)
     * External link will be opened in new tab
     *
     * Template:
     * - {{ year }} will be replaced with the current year
     * - {{ repository }} will be replaced with the original repository link
     * - {{ poweredBy }} will be replaced with "Powered by next-gdrive-index", linked to the repository
     * - {{ author }} will be replaced with author from siteAuthor config above (If it's not set, it will be set to mbaharip)
     * - {{ version }} will be replaced with the current version
     * - {{ siteName }} will be replaced with the siteName config above
     * - {{ handle }} will be replaced with the twitter handle from twitterHandle config above
     * - {{ creator }} will be replaced with mbaharip if you want to credit me
     */
    footer: [
      { value: "{{ poweredBy }}" },
      { value: "Made with ❤️ by [**{{ author }}**](https://github.com/mbaharip)" },
    ],
    /**
     * Add page load time on the footer
     * If you don't want to use it, you can set it to false
     */
    experimental_pageLoadTime: false,

    /**
     * Site wide password protection
     * If this is set, all files and folders will be protected by this password
     *
     * The site password are set from Environment Variable (NEXT_GDRIVE_INDEX_PASSWORD)
     * It's because I don't want to store sensitive data in the code
     */
    privateIndex: false,

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
      duration: 5000,
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

    /**
     * Configuration for file preview
     */
    previewSettings: {
      manga: {
        /**
         * Load first X MB of the file for preview
         * or load first X items for preview
         *
         * @default
         * maxSize: 15MB
         * maxItem: 10 items
         */
        maxSize: 15 * 1024 * 1024,
        maxItem: 10,
      },
    },
  },
};

export default config;
