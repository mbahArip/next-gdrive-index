import { z } from "zod";
import pkg from "~/../package.json";

import { encryptData } from "~/utils/encryptionHelper";

import { Schema_App_Configuration } from "~/types/schema";

const config_template = `import { z } from "zod";
import { isDev } from "~/utils/isDev";
import { Schema_Config } from "~/types/schema";

const config: z.input<typeof Schema_Config> = {
  /**
   * If possible, please don't change this value
   * Even if you're creating a PR, just let me change it myself
   */
  version: {{version}},

  /**
   * Base path of the app, used for generating links
   *
   * If you're using another port for development, you can set it here
   *
   * @default process.env.NEXT_PUBLIC_DOMAIN
   * @fallback process.env.NEXT_PUBLIC_VERCEL_URL
   */
  basePath: isDev
    ? "http://localhost:3000"
    : \`https://\${process.env.NEXT_PUBLIC_DOMAIN || process.env.NEXT_PUBLIC_VERCEL_URL}\`,

  /**
   * Allow access to the deploy guide
   * Will use the \`/deploy\` route, might be overlap with file / folder name
   *
   * Set this to false on final deployment
   *
   * I'm using this to show the deploy guide on my own demo deployment
   *
   * @default false
   */
  showDeployGuide: false,

  /**
   * How long the cache will be stored in the browser
   * Used for all pages and api routes
   *
   * @default "max-age=0, s-maxage=60, stale-while-revalidate"
   */
  cacheControl: "max-age=0, s-maxage=60, stale-while-revalidate",

  apiConfig: {
    /**
     * Starting point of the drive.
     * Will be used for '/' route.
     *
     * Since service account can't access 'root' folder
     * You need to create a new folder and share it with the service account
     * Then, copy the folder id and paste it here
     */
    rootFolder: {{apiConfig.rootFolder}},

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
     * Then you need to encrypt it using \`/api/internal/encrypt?q=:shared_drive_id\` route
     */
    isTeamDrive: {{apiConfig.isTeamDrive}},
    sharedDrive: {{apiConfig.sharedDrive}},

    defaultQuery: [
      "trashed = false",
      "(not mimeType contains 'google-apps' or mimeType contains 'folder')",
    ],
    defaultField:
      "id, name, mimeType, thumbnailLink, fileExtension, modifiedTime, size, imageMediaMetadata, videoMediaMetadata, webContentLink, trashed",
    defaultOrder: "folder, name asc, modifiedTime desc",

    /**
     * Set how many items to display per page in the file list
     * It's recommended to set this to a reasonable number
     * Since it will affect the load time
     * 
     * @default: 50 items per page | 5 search result
    */
    itemsPerPage: {{apiConfig.itemsPerPage}},
    searchResult: {{apiConfig.searchResult}},

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
     * @default: true
     */
    proxyThumbnail: {{apiConfig.proxyThumbnail}},

    /**
     * Special file name that will be used for certain purposes
     * These files will be ignored when searching for files
     * and will be hidden from the files list by default
     * 
     * Banner will be used for opengraph image for folder
     * By default, all folder will use default og image
     */
    specialFile: {
      password: ".password",
      readme: ".readme.md",
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
    hiddenFiles: [
      ".password",
      ".readme.md",
      ".banner",
      ".banner.jpg",
      ".banner.png",
      ".banner.webp",
    ],

    /**
     * Allow user to download protected file without password.
     * If this set to false, download link will have temporary token attached to it
     * If this set to true, user can download the file without password as long as they have the link
     *
     * @default: false
     */
    allowDownloadProtectedFile: {{apiConfig.allowDownloadProtectedFile}},

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
     * @default: 6 hours
     */
    temporaryTokenDuration: {{apiConfig.temporaryTokenDuration}},

    /**
     * Maximum file size that can be downloaded via api routes
     * If it's larger than this, it will be redirected to the file url
     *
     * If you're using Vercel, they have a limit of ~4 - ~4.5MB response size
     * ref: https://vercel.com/docs/platform/limits#serverless-function-payload-size-limit
     * If you're using another platform, you can match the limit with your platform
     * Or you can set this to 0 to disable the limit
     *
     * @default: 4MB
     */
    maxFileSize: {{apiConfig.maxFileSize}},

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
     * @default: 100MB
     */
    streamMaxSize: {{apiConfig.streamMaxSize}},
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
    siteName: {{siteConfig.siteName}},
    siteNameTemplate: {{siteConfig.siteNameTemplate}},
    siteDescription: {{siteConfig.siteDescription}},

    /**
     * Site Icon will be used on navbar
     * Favicon will be used as website icon
    */
    siteIcon: "/logo.svg",
    favIcon: "/favicon.png",

    /**
     * Both are used on metadata
     * Affects the value of footer
    */
    siteAuthor: {{siteConfig.siteAuthor}},
    twitterHandle: {{siteConfig.twitterHandle}},

    /**
     * Next.js Metadata robots object
     *
     * ref: https://nextjs.org/docs/app/api-reference/functions/generate-metadata#robots
     */
    robots: "noindex, nofollow",

    /**
     * Show file extension on the file name
     * Example:
     *    true       |   false
     *    file.txt   |   file
     *    100KB      |   txt / 100KB
     *
     * @default: false
     */
    showFileExtension: {{siteConfig.showFileExtension}},

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
     * - {{ author }} will be replaced with author from siteAuthor config above (If it's not set, it will be set to mbaharip)
     * - {{ version }} will be replaced with the current version
     * - {{ siteName }} will be replaced with the siteName config above
     * - {{ handle }} will be replaced with the twitter handle from twitterHandle config above
     * - {{ creator }} will be replaced with mbaharip if you want to credit me
     */
    footer: [
      "{{ siteName }} *v{{ version }}* @ {{ repository }}",
      "{{ year }} - Made with ❤️ by **{{ author }}**",
    ],

    /**
     * Site wide password protection
     * If this is set, all files and folders will be protected by this password
     *
     * The site password are set from Environment Variable (NEXT_GDRIVE_INDEX_PASSWORD)
     * It's because I don't want to store sensitive data in the code
     */
    privateIndex: {{siteConfig.privateIndex}},

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
    navbarItems: [],

    /**
     * Add support / donation links on the navbar
     * Example item:
     * {
     *  name: string,
     *  currency: string,
     *  href: string,
     * }
     */
    supports: [],
  },
};

export default config;`;

export async function generateConfig(data: z.input<typeof Schema_App_Configuration>) {
  const generated = config_template
    .replace("{{version}}", `"${pkg.version}"`)

    .replace("{{apiConfig.rootFolder}}", `"${await encryptData(data.api.rootFolder, data.environment.ENCRYPTION_KEY)}"`)
    .replace("{{apiConfig.isTeamDrive}}", `${data.api.isTeamDrive}`)
    .replace(
      "{{apiConfig.sharedDrive}}",
      `"${data.api.sharedDrive ? await encryptData(data.api.sharedDrive, data.environment.ENCRYPTION_KEY) : ""}"`,
    )
    .replace("{{apiConfig.itemsPerPage}}", `${data.api.itemsPerPage}`)
    .replace("{{apiConfig.searchResult}}", `${data.api.searchResult}`)
    .replace("{{apiConfig.proxyThumbnail}}", `${data.api.proxyThumbnail}`)
    .replace("{{apiConfig.allowDownloadProtectedFile}}", `${data.api.allowDownloadProtectedFile}`)
    .replace("{{apiConfig.temporaryTokenDuration}}", `${data.api.temporaryTokenDuration}`)
    .replace("{{apiConfig.maxFileSize}}", `${data.api.maxFileSize}`)
    .replace("{{apiConfig.streamMaxSize}}", `${data.api.streamMaxSize}`)

    .replace("{{siteConfig.siteName}}", `"${data.site.siteName}"`)
    .replace("{{siteConfig.siteNameTemplate}}", `"${data.site.siteNameTemplate}"`)
    .replace("{{siteConfig.siteDescription}}", `"${data.site.siteDescription}"`)
    .replace("{{siteConfig.siteAuthor}}", `"${data.site.siteAuthor}"`)
    .replace("{{siteConfig.twitterHandle}}", `"${data.site.twitterHandle}"`)
    .replace("{{siteConfig.showFileExtension}}", `${data.site.showFileExtension}`)
    .replace("{{siteConfig.privateIndex}}", `${data.site.privateIndex}`);

  return generated;
}
