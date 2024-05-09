"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { z } from "zod";
import {
  ConfigState,
  ConfigurationCategory,
  ConfigurationKeys,
  ConfigurationValue,
  Schema_App_Configuration,
  Schema_Theme,
  ThemeKeys,
} from "~/schema";
import { cn } from "~/utils";

import Markdown from "~/app/@markdown";
import Icon from "~/components/Icon";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Separator } from "~/components/ui/separator";
import { Textarea } from "~/components/ui/textarea";

import { encryptData } from "~/utils/encryptionHelper/hash";
import { parseThemeValue } from "~/utils/parseConfigFile";

import config from "~/config/gIndex.config";

import ApiConfig from "./@form.api-config";
import EnvironmentConfig from "./@form.env-config";
import SiteConfig from "./@form.site-config";
import ThemeForm from "./@form.theme";
import ThemePreview from "./@theme-preview";

export const getting_started = `Welcome to the deployment guide! This guide will help you to deploy the application to Vercel or similar services.

If you are new to this project, you can follow along from the beginning.
But if you've already deployed the app before and want to upgrade from v1, you can skip to the [Migrating from v1](#migrating) section.  
You can also use this guide to [configure the app](#config) and [customize the theme](#theme).  

**We recommend you to use this deployment guide on a desktop browser.**

_**Note:** This guide assumes you have a basic understanding of how to deploy a Next.js app on Vercel or other platforms._`;

export const new_user_guide = `Prerequisites:
- A basic understanding of Vercel (or similar services)
- Google Cloud Platform account

### Fork or Clone the repository
It's pretty obvious, but you need to fork the repository to your account.
You can [click here](https://github.com/mbahArip/next-gdrive-index/fork) to fork the repository.  
You can choose any repository name, description, and visibility.

But if you want to run it locally, you can clone the repository instead.

### Create a Google Cloud Platform project and enable Google Drive API
We need an access to Google Drive API to get the files from Google Drive.
So you need to create a project in Google Cloud Platform and enable Google Drive API to get your own credentials.

1. Go to [Google Cloud Platform](https://console.cloud.google.com/)
2. Click the \`New Project\` button
3. Enter a project name, and click the \`Create\` button
4. After the project is created, click the \`Enable APIs and Services\` button
5. Search for Google Drive API, and click the \`Enable\` button

### Create a Service Account and get the credentials
After enabling the Google Drive API, we need to create a service account to get the credentials.
The credentials will be used to authenticate the application to access the Google Drive API and get the files.

1. On [APIs & Services](https://console.cloud.google.com/apis/dashboard) page, click the \`Credentials\` menu on the sidebar
2. Click the \`Create Credentials\` button, and choose \`Service account\`
3. Enter your service account name and description, and then click the \`Done\` button
4. You will see the service account you just created on \`Service Account\` table, click the name of the service account to open the details
5. Go to \`Keys\` tab, then click the \`Add Key\` button and choose the \`Create new key\`
6. Pick \`JSON\` as the key type and click the \`Create\` button
7. The JSON file will be downloaded to your computer, and **keep it safe**. We will use it later on the configuration

_**Note:** The JSON file contains sensitive information, don't share it with anyone_

### Create shared folder in Google Drive
Since the service account can't access your Root folder, you need to create a new folder, and share it with the service account.
This folder will be used as the root folder for the application.

> If you're using or the folder you want to share inside Shared Drive, you can skip this step and go to the [Shared Drive Guide](#shared-drive)

1. Go to [Google Drive](https://drive.google.com/)
2. Click the \`New\` button, and choose \`Folder\` to create a new folder, you can name it anything you want
3. Right-click the folder you just created, and choose \`Share\`
4. Enter the email address of the service account you just created (you can find it on the JSON file, or on the service account details page)
5. To allow download files larger than deployment limit, you need to enable \`Link sharing\` and set it to \`Anyone with the link\`
6. Copy the folder ID from the URL, it's the part after \`/folders/\` in the URL (e.g: https://drive.google.com/drive/u/0/folders/ \`<folder_id>\` )

### Configuring the app and Customizing the theme
Now we need to configure the app to use the credentials and folder ID we just created.
You can follow the [App Configuration](#config) and [Customize Theme](#theme) sections to configure the app and customize the theme.

_**Note:** You can skip the theme customization, but you **NEED** to configure the app_

### Deploy the app
On this guide we will use Vercel to deploy the app, but you can use other platforms like Netlify, Heroku, etc.
But don't forget to adjust the \`fileSizeLimit\` on the [configuration](#config) if you use other platforms.

> Before deploying, make sure you have pushed the changes to your repository


1. Go to [Vercel](https://vercel.com/)
2. Click on the \`Add new\` button, and choose \`Project\`
3. Choose the repository you just forked
4. On the \`Environment Variables\` section, copy the whole content from \`.env.local\` you just downloaded from [configuration](#config) section, and paste it on the key fields. It will automatically add all the environment variables needed
5. Click the \`Deploy\` button
6. Wait for the deployment to finish, and open project
7. Go to \`Settings\` tab, and click the \`Functions\` menu, and select your \`Function Region\` to the nearest region to your location for optimal speed
8. Go to \`Deployment\` tab, click the 3 dots on the right side of the latest \`Production\` deployment, and click the \`Redeploy\` button to apply the changes

For other platforms, you can check their own documentation for Next.js deployment guide.

### Done! 🎉
Congratulations! You have successfully deployed the app.`;

export const shared_drive_guide = `I'm separating this guide in case someone who already using v1 can see this guide easily.

As of version 2.0.2 we added support for Shared Drive, and the demo actually using a Shared Drive.
You can follow this guide to use Shared Drive as the root folder for the application.

1. Go to [Google Drive](https://drive.google.com/)
2. Open the \`Shared Drives\` menu from the sidebar
3. Right click on the Shared Drive you want to use, and choose \`Manage members\`
4. Add your service account email address to the members list, and give it at least \`Viewer\` permission
5. Open the \`Shared Drive\`, and copy the ID from the URL, it's the part after \`/drive/u/0/folders/\` in the URL (e.g: https://drive.google.com/drive/u/0/folders/ \`<drive_id>\` )
6. Paste the ID to \`Shared Drive\` field on the [configuration](#config) section, and set the \`is Team Drive\` to \`true\`
7. For the root folder, you can set it to the folder ID inside the Shared Drive, or use the Shared Drive ID as the root folder ID
8. Update the configuration file, and redeploy the app to apply the changes
9. Done! 🎉

If you don't want to use the configuration section below, you can encrypt your \`Shared Drive\` ID using the \`/api/internal/encrypt?q=<drive_id>\` endpoint, and update the config file directly.
`;

export const migration_guide = `If you've already deployed the app before and want to upgrade from v1, you can follow this guide to migrate the app to the latest version.

### Update your environment and configuration
If you still have the \`.env.local file\`, you can go to the [configuration](#config) section, and load the file to update the environment variables.
If you don't have it, go to your deployment platform and copy the environment variables from the platform to the [configuration](#config) section.

You can also load the old \`gindex.config.ts\` file to the [configuration](#config) section to set the default configuration.

### Update the repository
First, you need to update the repository to the latest version.
If you open your forked repository, you will see a notification that the repository is behind the original repository.
You can sync the repository by clicking the \`Sync fork\` button.
After the repository is updated, you can replace the \`gindex.config.ts\` file with the new one.

### Update deployment
Now go to your Vercel project page (or other platforms).
Go to the \`Settings\` tab, and click the \`Environment Variables\` menu.
You can delete all the old environment variables, and copy the new environment variables from the updated \`.env.local\` file.
Now you can redeploy the app to apply the changes.
`;
const initialConfiguration: z.input<typeof Schema_App_Configuration> = {
  environment: {
    GD_SERVICE_B64: "",
    ENCRYPTION_KEY: "",
    SITE_PASSWORD: "",
    NEXT_PUBLIC_DOMAIN: "",
  },
  api: {
    ...config.apiConfig,
    rootFolder: "",
    isTeamDrive: false,
    sharedDrive: "",
    itemsPerPage: 50,
    searchResult: 5,

    proxyThumbnail: true,
    streamMaxSize: 100 * 1024 * 1024,

    allowDownloadProtectedFile: false,
    temporaryTokenDuration: 6,
    maxFileSize: 4 * 1024 * 1024,
  },
  site: {
    ...config.siteConfig,
    siteName: "next-gdrive-index",
    siteNameTemplate: "%s - %t",
    siteDescription: "A Google Drive Index built using Next.js",
    siteAuthor: "mbahArip",
    twitterHandle: "@mbahArip",

    showFileExtension: false,
    footer: [
      "{{ siteName }} *v{{ version }}* @ {{ repository }}",
      "{{ year }} - Made with ❤️ by **{{ author }}**",
    ],

    privateIndex: false,
    breadcrumbMax: 3,

    toaster: {
      position: "bottom-right",
      duration: 3000,
    },

    navbarItems: [],
    supports: [],
  },
};

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;

  const afterClick = () => {
    setTimeout(() => {
      URL.revokeObjectURL(url);
      removeEventListener("click", afterClick);
    }, 100);
  };
  anchor.addEventListener("click", afterClick, false);

  anchor.click();
}

export function Configuration() {
  const [loading, setLoading] = useState<boolean>(true);
  const [configuration, setConfiguration] =
    useState<z.input<typeof Schema_App_Configuration>>(initialConfiguration);
  const [error, setError] = useState<{
    environment: Partial<Record<ConfigurationKeys<"environment">, string>>;
    api: Partial<Record<ConfigurationKeys<"api">, string>>;
    site: Partial<Record<ConfigurationKeys<"site">, string>>;
  }>({
    environment: {},
    api: {},
    site: {},
  });
  const [downloadState, setDownloadState] = useState<ConfigState>("idle");

  useEffect(() => {
    setLoading(false);
  }, []);

  // It's been a year I'm learning TS, and this thing still scares me
  function onConfigurationChange<
    T extends ConfigurationCategory = ConfigurationCategory,
    K extends ConfigurationKeys<T> = ConfigurationKeys<T>,
  >(category: T, key: K, value: ConfigurationValue<T, K>) {
    setConfiguration((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value,
      },
    }));
  }
  function onReset(category: ConfigurationCategory) {
    setConfiguration((prev) => ({
      ...prev,
      [category]: initialConfiguration[category],
    }));
    setError((prev) => ({
      ...prev,
      [category]: {},
    }));
  }
  async function onDownload(
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) {
    e.preventDefault();
    setDownloadState("loading");
    toast.loading("Generating configuration file...", {
      id: "download-config",
    });

    try {
      // Check required section first
      const requiredEmpty = [
        !configuration.environment.ENCRYPTION_KEY.length,
        !configuration.environment.GD_SERVICE_B64.length,
        !configuration.api.rootFolder.length,
        configuration.api.isTeamDrive && !configuration.api.sharedDrive?.length,
        !configuration.site.siteName.length,
        !configuration.site.siteDescription.length,
        configuration.site.privateIndex &&
          !configuration.environment.SITE_PASSWORD?.length,
      ];
      if (requiredEmpty.filter((v) => v).length) {
        throw new Error("Looks like you missed some required fields.");
      }

      const errors = [];
      for (const err of Object.values(error.environment)) {
        if (err.length) errors.push(err);
      }
      for (const err of Object.values(error.api)) {
        if (err.length) errors.push(err);
      }
      for (const err of Object.values(error.site)) {
        if (err.length) errors.push(err);
      }

      if (errors.length) {
        throw new Error(
          "Please fix all the errors before downloading the configuration file.",
        );
      }

      let envContent = Object.entries(configuration.environment)
        .map(([key, value]) => `${key}=${value}`)
        .join("\n");
      envContent +=
        "\n\n# Can't name it .env for download, so rename it to .env.local\n# Or you can copy the content to your deployment platform";

      const configContent: string = `import { z } from "zod";
import { Schema_Config } from "~/schema";
import isDev from "~/utils/isDev";

const config: z.input<typeof Schema_Config> = {
  /**
   * If possible, please don't change this value
   * Even if you're creating a PR, just let me change it myself
   */
  version: "${config.version}",

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
    rootFolder:
      "${await encryptData(
        configuration.api.rootFolder,
        configuration.environment.ENCRYPTION_KEY,
      )}",

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
    isTeamDrive: ${configuration.api.isTeamDrive ? "true" : "false"},
    sharedDrive:
      "${
        configuration.api.isTeamDrive && configuration.api.sharedDrive
          ? await encryptData(
              configuration.api.sharedDrive,
              configuration.environment.ENCRYPTION_KEY,
            )
          : ""
      }",

    defaultQuery: [
      "trashed = false",
      "(not mimeType contains 'google-apps' or mimeType contains 'folder')",
    ],
    defaultField:
      "id, name, mimeType, thumbnailLink, fileExtension, modifiedTime, size, imageMediaMetadata, videoMediaMetadata, webContentLink, trashed",
    defaultOrder: "folder, name asc, modifiedTime desc",

    itemsPerPage: ${configuration.api.itemsPerPage},
    searchResult: ${configuration.api.searchResult},

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
    proxyThumbnail: ${configuration.api.proxyThumbnail ? "true" : "false"}, 
    
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
    streamMaxSize: ${configuration.api.streamMaxSize},

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
     * Default: false
     */
    allowDownloadProtectedFile: ${
      configuration.api.allowDownloadProtectedFile ? "true" : "false"
    },

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
     * Default: 6 hours
     */
    temporaryTokenDuration: ${configuration.api.temporaryTokenDuration},

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
    maxFileSize: ${configuration.api.maxFileSize},
  },

  siteConfig: {
    /**
     * Site Name will be used for default metadata title
     * Site Name Template will be used if the page has a title
     * %s will be replaced with the page title
     *
     * You can set it to undefined if you don't want to use it
     */
    siteName: "${configuration.site.siteName}",
    siteNameTemplate: "${configuration.site.siteNameTemplate}",
    siteDescription: "${configuration.site.siteDescription}",
    siteIcon: "/logo.svg",
    favIcon: "/favicon.png",

    siteAuthor: "${configuration.site.siteAuthor}",
    twitterHandle: "${configuration.site.twitterHandle}",

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
     * Default: false
     */
    showFileExtension: ${
      configuration.site.showFileExtension ? "true" : "false"
    },

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
    privateIndex: ${configuration.site.privateIndex ? "true" : "false"},

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
     * This section should have autocomplete for both the object and the icon name
     * 
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
     * 
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

      downloadBlob(new Blob([envContent], { type: "text/plain" }), "env");
      downloadBlob(
        new Blob([configContent], { type: "text/typescript" }),
        "gindex.config.ts",
      );

      toast.success("Configuration file downloaded!", {
        id: "download-config",
      });
    } catch (error) {
      const e = error as Error;
      console.error(e);
      toast.error(e.message, {
        id: "download-config",
      });
    } finally {
      setDownloadState("idle");
    }
  }
  function onErrorSet<
    T extends ConfigurationCategory = ConfigurationCategory,
    K extends ConfigurationKeys<T> = ConfigurationKeys<T>,
  >(category: T, key: K, value: string) {
    setError((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value,
      },
    }));
  }

  if (loading)
    return (
      <Card>
        <CardContent className='grid h-[25dvh] w-full place-items-center'>
          <Icon
            name='LoaderCircle'
            className='animate-spin text-primary'
            size='2rem'
          />
        </CardContent>
      </Card>
    );

  return (
    <Card>
      <CardHeader className='pb-0'>
        <div className='flex w-full items-end justify-between gap-3'>
          <CardTitle
            className='text-3xl'
            id='config'
          >
            App Configuration
          </CardTitle>
          <small className='text-muted-foreground'>v{config.version}</small>
        </div>
        <Separator />
      </CardHeader>
      <CardContent className='space-y-3 py-3'>
        <Markdown
          content={`This configuration only covering things you need to get started and basic personalization.
You can check the configuration file itself to see all the available configuration. _(Each configuration has a description to help you understand it)_
If you're migrating from previous version, you can load your old environment and config file to update the configuration.

> If you found any bugs or issues, please report it to the [issue tracker](https://github.com/mbahArip/next-gdrive-index/issues)
> I'll try to fix it as soon as possible`}
          view='markdown'
        />

        <EnvironmentConfig
          state={{ get: configuration, set: onConfigurationChange }}
          error={{
            get: error?.environment,
            set: (key, value) => onErrorSet("environment", key, value),
          }}
          onReset={onReset}
        />
        <ApiConfig
          state={{ get: configuration, set: onConfigurationChange }}
          error={{
            get: error?.api,
            set: (key, value) => onErrorSet("api", key, value),
          }}
          onReset={onReset}
        />
        <SiteConfig
          state={{ get: configuration, set: onConfigurationChange }}
          error={{
            get: error?.site,
            set: (key, value) => onErrorSet("site", key, value),
          }}
          onReset={onReset}
        />

        <div className='flex w-full items-center justify-end gap-3'>
          <Button
            variant={"destructive"}
            size={"sm"}
            onClick={(e) => {
              e.preventDefault();
              setConfiguration(initialConfiguration);
              setError({
                environment: {},
                api: {},
                site: {},
              });
            }}
          >
            Reset All
          </Button>
          <Button
            size={"sm"}
            disabled={downloadState === "loading"}
            onClick={onDownload}
          >
            <div className='relative flex w-full items-center justify-center'>
              <span className='relative transition-all duration-300 ease-in-out'>
                Download Config
              </span>
              <Icon
                name='LoaderCircle'
                className={cn(
                  "animate-spin transition-all",
                  downloadState === "loading"
                    ? "ml-1.5 size-4 opacity-100"
                    : "ml-0 size-0 opacity-0",
                )}
              />
            </div>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function CustomizeTheme() {
  const [initialTheme] = useState<{
    light: z.input<typeof Schema_Theme>;
    dark: z.input<typeof Schema_Theme>;
  }>({
    light: {
      "background": "0 0% 100%",
      "foreground": "0 0% 3.9%",
      "card": "0 0% 100%",
      "card-foreground": "0 0% 3.9%",
      "popover": "0 0% 100%",
      "popover-foreground": "0 0% 3.9%",
      "primary": "0 0% 9%",
      "primary-foreground": "0 0% 98%",
      "secondary": "0 0% 96.1%",
      "secondary-foreground": "0 0% 9%",
      "muted": "0 0% 96.1%",
      "muted-foreground": "0 0% 45.1%",
      "accent": "0 0% 96.1%",
      "accent-foreground": "0 0% 9%",
      "destructive": "0 84.2% 60.2%",
      "destructive-foreground": "0 0% 98%",
      "border": "0 0% 89.8%",
      "input": "0 0% 89.8%",
      "ring": "0 0% 89.8%",
      "radius": "0.5rem",
    },
    dark: {
      "background": "0 0% 3.9%",
      "foreground": "0 0% 98%",
      "card": "0 0% 3.9%",
      "card-foreground": "0 0% 98%",
      "popover": "0 0% 3.9%",
      "popover-foreground": "0 0% 98%",
      "primary": "0 0% 98%",
      "primary-foreground": "0 0% 9%",
      "secondary": "0 0% 14.9%",
      "secondary-foreground": "0 0% 98%",
      "muted": "0 0% 14.9%",
      "muted-foreground": "0 0% 63.9%",
      "accent": "0 0% 14.9%",
      "accent-foreground": "0 0% 98%",
      "destructive": "0 62.8% 30.6%",
      "destructive-foreground": "0 0% 98%",
      "border": "0 0% 14.9%",
      "input": "0 0% 14.9%",
      "ring": "0 0% 14.9%",
      "radius": "0.5rem",
    },
  });
  const [currentTheme, setCurrentTheme] = useState<"light" | "dark">("light");
  const [theme, setTheme] = useState<{
    light: z.input<typeof Schema_Theme>;
    dark: z.input<typeof Schema_Theme>;
  }>(initialTheme);

  const [dialog, setDialog] = useState<boolean>(false);
  const [cssLoading, setCssLoading] = useState<boolean>(false);

  function onThemeChange(
    theme: "light" | "dark",
    key: ThemeKeys,
    value: string,
  ) {
    setTheme((prev) => ({
      ...prev,
      [theme]: {
        ...prev[theme],
        [key]: value,
      },
    }));
  }

  function onSelectedThemeReset(theme: "light" | "dark", key: ThemeKeys) {
    setTheme((prev) => ({
      ...prev,
      [theme]: {
        ...prev[theme],
        [key]: initialTheme[theme][key],
      },
    }));
  }
  function onThemeReset() {
    setTheme(initialTheme);
  }
  function isChanged(t: "light" | "dark", key: ThemeKeys): boolean {
    return t === "light"
      ? theme.light[key] !== initialTheme.light[key]
      : theme.dark[key] !== initialTheme.dark[key];
  }

  return (
    <Card>
      <CardHeader className='pb-0'>
        <div className='flex flex-col gap-3 tablet:flex-row tablet:items-center tablet:justify-between'>
          <CardTitle
            className='text-3xl'
            id='theme'
          >
            Customize Theme
          </CardTitle>

          <div className='flex w-full items-center gap-3 tablet:w-fit'>
            <Button
              size='sm'
              variant={"outline"}
              onClick={(e) => {
                e.preventDefault();

                try {
                  const fileInput = document.createElement("input");
                  fileInput.type = "file";
                  fileInput.accept = ".css";
                  fileInput.onchange = async (fileEvent) => {
                    const file = (fileEvent.target as HTMLInputElement)
                      .files?.[0];
                    if (!file) return toast.error("No file selected");
                    const fileName = file.name;
                    if (fileName !== "globals.css")
                      return toast.error("Please select globals.css file");

                    const reader = new FileReader();
                    reader.onload = async (read) => {
                      const result = read.target?.result as string;
                      if (!result) return toast.error("Failed to read file");
                      const themeRegex =
                        /\/\* Shadcn\/ui theme \*\/.*?\:root \{(.*?)\}.*?.dark \{(.*?) \}/gm;
                      const themeMatch = themeRegex.exec(
                        result.replace(/\r\n/g, ""),
                      );
                      if (!themeMatch)
                        return toast.error(
                          "Can't find theme, are you sure it's the right file?",
                        );
                      const lightTheme = themeMatch[1]
                        .replace(/\s{2,4}/g, "\n")
                        .split("\n")
                        .map((v) => v.trim())
                        .filter(
                          (v) =>
                            v.length &&
                            (v.startsWith("/*") && v.endsWith("*/")
                              ? false
                              : true),
                        );
                      const darkTheme = themeMatch[2]
                        .replace(/\s{2,4}/g, "\n")
                        .split("\n")
                        .map((v) => v.trim())
                        .filter(
                          (v) =>
                            v.length &&
                            (v.startsWith("/*") && v.endsWith("*/")
                              ? false
                              : true),
                        );

                      // Loop through the theme and set it
                      for (const key in lightTheme) {
                        const [k, v] = lightTheme[key]
                          .split(":")
                          .map((v) => v.replace("--", "").trim());
                        const hslRegex = /\d\s\d.*?\%\s\d.*?\%;/g;
                        if (hslRegex.test(v)) {
                          const color = parseThemeValue(v);
                          onThemeChange(
                            "light",
                            k as ThemeKeys,
                            `${color.h} ${color.s}% ${color.l}%`,
                          );
                        } else {
                          onThemeChange("light", k as ThemeKeys, v);
                        }
                      }
                      for (const key in darkTheme) {
                        const [k, v] = darkTheme[key]
                          .split(":")
                          .map((v) => v.replace("--", "").trim());
                        const hslRegex = /\d\s\d.*?\%\s\d.*?\%;/g;
                        if (hslRegex.test(v)) {
                          const color = parseThemeValue(v);
                          onThemeChange(
                            "dark",
                            k as ThemeKeys,
                            `${color.h} ${color.s}% ${color.l}%`,
                          );
                        } else {
                          onThemeChange("dark", k as ThemeKeys, v);
                        }
                      }

                      fileInput.value = "";
                      toast.success("Theme loaded successfully");
                    };
                    reader.readAsText(file);
                  };
                  fileInput.click();
                } catch (error) {
                  const e = error as Error;
                  console.error(e);
                  toast.error(e.message);
                }
              }}
            >
              Load CSS
            </Button>
            <Dialog
              open={dialog}
              onOpenChange={setDialog}
            >
              <DialogTrigger>
                <Button
                  size='sm'
                  variant={"outline"}
                >
                  Paste Code
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Paste Theme</DialogTitle>
                  <DialogDescription>
                    Paste the CSS code from your theme file
                    <br />
                    <Link
                      href={"https://ui.shadcn.com/themes"}
                      target='_blank'
                      className='text-blue-600 opacity-80 transition-all duration-300 hover:opacity-100 dark:text-blue-400'
                    >
                      Get themes from shadcn/ui
                    </Link>
                  </DialogDescription>
                </DialogHeader>
                <form
                  className='space-y-3'
                  onSubmit={(e) => {
                    e.preventDefault();
                    setCssLoading(true);

                    try {
                      const formData = new FormData(
                        e.target as HTMLFormElement,
                      );
                      const css = formData.get("css-paste") as string;
                      if (!css) throw new Error("No CSS code provided");

                      const flatten = css.trim().replace(/\n/g, "");
                      const themeRegex =
                        /\@layer base.*?\:root \{(.*?)\}.*?.dark \{(.*?) \}/gm;
                      const themeMatch = themeRegex.exec(
                        flatten.replace(/\r\n/g, ""),
                      );
                      if (!themeMatch)
                        throw new Error(
                          "Unknown format, please refer to shadcn/ui theme",
                        );

                      const lightTheme = themeMatch[1]
                        .replace(/\s{2,4}/g, "\n")
                        .split("\n")
                        .map((v) => v.trim())
                        .filter(
                          (v) =>
                            v.length &&
                            (v.startsWith("/*") && v.endsWith("*/")
                              ? false
                              : true),
                        );
                      const darkTheme = themeMatch[2]
                        .replace(/\s{2,4}/g, "\n")
                        .split("\n")
                        .map((v) => v.trim())
                        .filter(
                          (v) =>
                            v.length &&
                            (v.startsWith("/*") && v.endsWith("*/")
                              ? false
                              : true),
                        );

                      for (const key in lightTheme) {
                        const [k, v] = lightTheme[key]
                          .split(":")
                          .map((v) => v.replace("--", "").trim());
                        const color = parseThemeValue(v);
                        const hslRegex = /\d\s\d.*?\%\s\d.*?\%;/g;
                        if (hslRegex.test(v)) {
                          const color = parseThemeValue(v);
                          onThemeChange(
                            "light",
                            k as ThemeKeys,
                            `${color.h} ${color.s}% ${color.l}%`,
                          );
                        } else {
                          onThemeChange("light", k as ThemeKeys, v);
                        }
                      }
                      for (const key in darkTheme) {
                        const [k, v] = darkTheme[key]
                          .split(":")
                          .map((v) => v.replace("--", "").trim());
                        const color = parseThemeValue(v);
                        const hslRegex = /\d\s\d.*?\%\s\d.*?\%;/g;
                        if (hslRegex.test(v)) {
                          const color = parseThemeValue(v);
                          onThemeChange(
                            "dark",
                            k as ThemeKeys,
                            `${color.h} ${color.s}% ${color.l}%`,
                          );
                        } else {
                          onThemeChange("dark", k as ThemeKeys, v);
                        }
                      }

                      toast.success("Theme loaded successfully");
                      setDialog(false);
                    } catch (error) {
                      const e = error as Error;
                      console.error(e);
                      toast.error(e.message);
                    } finally {
                      setCssLoading(false);
                    }
                  }}
                >
                  <Textarea
                    id='css-paste'
                    name='css-paste'
                    className='w-full'
                    rows={10}
                    placeholder='Please refer to shadcn/ui theme for the theme code'
                  />
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button
                        size={"sm"}
                        variant={"destructive"}
                        type='reset'
                      >
                        Cancel
                      </Button>
                    </DialogClose>
                    <Button
                      size={"sm"}
                      disabled={cssLoading}
                      type='submit'
                    >
                      <div className='relative flex w-full items-center justify-center'>
                        <span className='relative transition-all duration-300 ease-in-out'>
                          Load Theme
                        </span>
                        <Icon
                          name='LoaderCircle'
                          className={cn(
                            "animate-spin transition-all",
                            cssLoading
                              ? "ml-1.5 size-4 opacity-100"
                              : "ml-0 size-0 opacity-0",
                          )}
                        />
                      </div>
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            <Button
              size='sm'
              variant={"destructive"}
              onClick={onThemeReset}
            >
              Reset All
            </Button>
          </div>
        </div>
        <Separator />
      </CardHeader>
      <CardContent>
        <div className='grid grid-cols-1 gap-6 py-3 tablet:grid-cols-2'>
          <div className='col-span-full flex w-full items-center'>
            <Button
              size='sm'
              variant={currentTheme === "light" ? "default" : "outline"}
              onClick={() => setCurrentTheme("light")}
              className='w-full rounded-r-none'
            >
              Light Theme
            </Button>
            <Button
              size='sm'
              variant={currentTheme === "dark" ? "default" : "outline"}
              onClick={() => setCurrentTheme("dark")}
              className='w-full rounded-l-none'
            >
              Dark Theme
            </Button>
          </div>
          <div className='flex flex-col gap-3'>
            <ThemeForm
              currentTheme={currentTheme}
              state={{
                get: theme,
                set: onThemeChange,
              }}
            />
            <Button
              size={"sm"}
              variant={"secondary"}
              onClick={(e) => {
                e.preventDefault();
                const otherTheme = currentTheme === "light" ? "dark" : "light";
                setTheme((prev) => ({
                  ...prev,
                  [otherTheme]: {
                    ...prev[currentTheme],
                    radius: "0.5rem",
                  },
                }));
                toast.success(
                  `${currentTheme
                    .slice(0, 1)
                    .toUpperCase()}${currentTheme.slice(
                    1,
                  )} theme copied to ${otherTheme} theme`,
                );
              }}
            >
              Copy to {currentTheme === "light" ? "Dark" : "Light"} Theme
            </Button>
          </div>

          <ThemePreview
            theme={currentTheme === "light" ? theme.light : theme.dark}
          />

          <Separator className='col-span-full' />

          <div className='col-span-full flex w-full flex-col items-end justify-center gap-1.5'>
            <div className='flex items-center gap-3'>
              <Button
                variant={"outline"}
                size={"sm"}
                onClick={async (e) => {
                  try {
                    const style = `@layer base {
  :root {
  ${Object.entries(theme.light)
    .map(([key, value]) => `  --${key}: ${value};`.replace(";;", ";"))
    .join("\n")}
  }

  .dark {
  ${Object.entries(theme.dark)
    .map(([key, value]) => `    --${key}: ${value};`.replace(";;", ";"))
    .join("\n")}
  }
}`;

                    await navigator.clipboard.writeText(style);
                    toast.success("CSS code copied to clipboard");
                  } catch (error) {
                    const e = error as Error;
                    console.error(e);
                    toast.error(e.message);
                  }
                }}
              >
                Copy CSS Code
              </Button>
              <Button
                size={"sm"}
                onClick={(e) => {
                  e.preventDefault();
                  toast.loading("Creating CSS file...", {
                    id: "download-css",
                  });
                  try {
                    const css = `@tailwind base;
@tailwind components;
@tailwind utilities;

/* Shadcn/ui theme */
@layer base {
  :root {
  ${Object.entries(theme.light)
    .map(([key, value]) => `  --${key}: ${value};`.replace(";;", ";"))
    .join("\n")}
  }

  .dark {
  ${Object.entries(theme.dark)
    .map(([key, value]) => `    --${key}: ${value};`.replace(";;", ";"))
    .join("\n")}
  }
}

html,
body {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
@layer base {
  :root {
    /* @apply text-[14px] tablet:text-[16px]; */
    @apply text-[100%];
  }
  * {
    @apply border-border;
    /* @apply outline outline-1 outline-red-500; */
  }
  body {
    @apply bg-background text-foreground;
  }

  ::-webkit-scrollbar {
    @apply h-1.5 w-1.5;
  }
  ::-webkit-scrollbar-track {
    @apply bg-primary/5;
  }
  ::-webkit-scrollbar-thumb {
    @apply rounded-full bg-primary/25 hover:bg-primary/50;
  }

  /* Typography */
  h1 {
    @apply scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl;
  }
  h2 {
    @apply scroll-m-20 text-3xl font-semibold tracking-tight first:mt-0;
  }
  h3 {
    @apply scroll-m-20 text-2xl font-semibold tracking-tight;
  }
  h4 {
    @apply scroll-m-20 text-xl font-semibold tracking-tight;
  }
  .paragraph {
    @apply leading-7 [&:not(:first-child)]:mt-6;
  }
  blockquote {
    @apply mt-6 border-l-2 pl-6 italic;
  }
  ul {
    @apply my-6 ml-6 list-disc [&>li]:mt-2;
  }
  .lead {
    @apply text-xl text-muted-foreground;
  }
  .large {
    @apply text-lg font-semibold;
  }
  .muted {
    @apply text-sm text-muted-foreground;
  }
  small {
    @apply text-sm font-medium leading-none;
  }
}`;
                    const blob = new Blob([css], { type: "text/css" });
                    downloadBlob(blob, "globals.css");
                    toast.success("CSS downloaded successfully", {
                      id: "download-css",
                    });
                  } catch (error) {
                    const e = error as Error;
                    console.error(e);
                    toast.error(e.message, {
                      id: "download-css",
                    });
                  }
                }}
              >
                Download CSS
              </Button>
            </div>
            <span className='text-sm text-muted-foreground'>
              It is recommended to use &apos;Copy CSS Code&apos; button to copy
              the CSS code
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
