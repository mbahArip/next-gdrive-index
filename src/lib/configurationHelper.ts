import { type z } from "zod";

import {
  Schema_App_Configuration,
  Schema_App_Configuration_Env,
  Schema_Config,
  Schema_v1_Config,
  Schema_v2_3_Config,
} from "~/types/schema";

import config from "~/config/gIndex.config";

export const versionExpectMap: Record<"v1" | "v2" | "latest", string[]> = {
  v1: ["1.0.0", "1.0.1", "1.0.2", "1.0.3"],
  v2: ["2.0.0", "2.0.1", "2.0.2", "2.0.3"],
  latest: ["2.0.4", "2.4.0", "2.4.1", "2.4.2"],
};
export type PickFileResponse =
  | {
      success: true;
      data: string;
    }
  | {
      success: false;
      message: string;
      details: string[];
    };
type PickFileProps = {
  accept: string;
  onLoad: (response: PickFileResponse) => void | Promise<void>;
  onCancel?: () => void | Promise<void>;
  fileName?: string;
};
export function pickFile({ accept, fileName, onLoad }: PickFileProps): void {
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = accept;
  fileInput.oncancel = async () => {
    await onLoad({
      success: false,
      message: "File picker canceled",
      details: [],
    });
  };
  fileInput.onchange = async (fileEvent) => {
    const file = (fileEvent.target as HTMLInputElement).files?.[0];
    if (!file) {
      await onLoad({
        success: false,
        message: "No file selected",
        details: [],
      });
      return;
    }

    if (fileName) {
      const { name } = file;
      if (name.toLowerCase() !== fileName.toLowerCase()) {
        await onLoad({
          success: false,
          message: `Invalid file name`,
          details: [`Expected: ${fileName}`, `Received: ${name}`],
        });
        return;
      }
    }

    const reader = new FileReader();
    reader.onload = async (readerEvent) => {
      const result = readerEvent.target?.result as string;
      if (!result) {
        await onLoad({
          success: false,
          message: "Failed to read file",
          details: [],
        });
        return;
      }
      fileInput.value = "";

      await onLoad({
        success: true,
        data: result,
      });
    };
    reader.onloadend = () => {
      fileInput.remove();
    };
    reader.readAsText(file);
  };
  fileInput.click();
  fileInput.remove();
}

export const initialConfiguration: z.input<typeof Schema_App_Configuration> = {
  version: config.version,
  environment: {
    ENCRYPTION_KEY: "",
    SITE_PASSWORD: "",
    GD_SERVICE_B64: "",
    NEXT_PUBLIC_DOMAIN: "",
  },

  api: {
    cache: {
      public: true,
      maxAge: 60,
      sMaxAge: 60,
      staleWhileRevalidate: true,
    },
    rootFolder: "",
    isTeamDrive: false,
    sharedDrive: "",
    defaultQuery: ["trashed = false", "(not mimeType contains 'google-apps' or mimeType contains 'folder')"],
    defaultField:
      "id, name, mimeType, thumbnailLink, fileExtension, modifiedTime, size, imageMediaMetadata, videoMediaMetadata, webContentLink, trashed",
    defaultOrder: "folder, name asc, modifiedTime desc",
    itemsPerPage: 50,
    searchResult: 5,
    proxyThumbnail: true,
    streamMaxSize: 100 * 1024 * 1024,
    specialFile: {
      password: ".password",
      readme: ".readme.md",
      banner: ".banner",
    },
    hiddenFiles: [".password", ".readme.md", ".banner", ".banner.jpg", ".banner.png", ".banner.webp"],
    allowDownloadProtectedFile: false,
    temporaryTokenDuration: 6,
    maxFileSize: 4 * 1024 * 1024,
  },

  site: {
    guideButton: false,

    siteName: "next-gdrive-index",
    siteNameTemplate: "%s - %t",
    siteDescription: "A simple file browser for Google Drive",
    siteIcon: "/logo.svg",
    siteAuthor: "mbaharip",
    favIcon: "/favicon.png",

    robots: "noindex, nofollow",
    twitterHandle: "@mbaharip_",
    showFileExtension: true,
    footer: [
      { value: "{{ poweredBy }}" },
      { value: "Made with ❤️ by [**{{ author }}**](https://github.com/mbaharip)" },
    ],
    experimental_pageLoadTime: false,
    privateIndex: false,
    breadcrumbMax: 3,
    toaster: {
      position: "bottom-right",
      duration: 3000,
    },
    navbarItems: [],
    supports: [],
    previewSettings: {
      manga: {
        maxSize: 15 * 1024 * 1024,
        maxItem: 10,
      },
    },
  },
};

export const configurationTemplate = `import { type z } from "zod";
import { BASE_URL, IS_DEV } from "~/constant";

import { type Schema_Config } from "~/types/schema";

const config: z.input<typeof Schema_Config> = {
  /**
   * If possible, please don't change this value
   * Even if you're creating a PR, just let me change it myself
   */
  version: "{{ version }}",
  /**
   * Base path of the app, used for generating links
   *
   * If you're using another port for development, you can set it here
   *
   * @default process.env.NEXT_PUBLIC_DOMAIN
   * @fallback process.env.NEXT_PUBLIC_VERCEL_URL
   */
  basePath: IS_DEV ? "http://localhost:3000" : \`https://\${BASE_URL}\`,

  /**
   * Show deploy guide dropdown on navbar
   * that contains the deploy guide and configurator
   *
   * Set this to false on final deployment, except you want to show it
   *
   * @default false
   */
  showGuideButton: {{ showGuideButton }},

  /**
   * How long the cache will be stored in the browser
   * Used for all pages and api routes
   *
   * @default "public, max-age=60, s-maxage=60, stale-while-revalidate"
   */
  cacheControl: "{{ cacheControl }}",

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
      "{{ api.rootFolder }}",

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
    isTeamDrive: {{ api.isTeamDrive }},
    sharedDrive: "{{ api.sharedDrive }}",

    defaultQuery: ["trashed = false", "(not mimeType contains 'google-apps' or mimeType contains 'folder')"],
    defaultField:
      "id, name, mimeType, thumbnailLink, fileExtension, modifiedTime, size, imageMediaMetadata, videoMediaMetadata, webContentLink, trashed",
    defaultOrder: "folder, name asc, modifiedTime desc",
    itemsPerPage: {{ api.itemsPerPage }},
    searchResult: {{ api.searchResult }},

    /**
     * Special file name that will be used for certain purposes
     * These files will be ignored when searching for files
     * and will be hidden from the files list by default
     */
    specialFile: {
      password: "{{ api.specialFile.password }}",
      readme: "{{ api.specialFile.readme }}",
      /**
       * Banner will be used for opengraph image for folder
       * By default, all folder will use default og image
       */
      banner: "{{ api.specialFile.banner }}",
    },
    /**
     * Reason why banner has multiple extensions:
     * - If I use contains query, it will also match the file or folder that contains the word.
     *   (e.g: File / folder with the name of "Test Password" will be matched)
     * - If I use = query, it will only match the exact name, hence the multiple extensions
     *
     * You can add more extensions if you want
     */
    hiddenFiles: {{ api.hiddenFiles }},

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
    proxyThumbnail: {{ api.proxyThumbnail }},

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
    streamMaxSize: {{ api.streamMaxSize }},

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
    maxFileSize: {{ api.maxFileSize }},

    /**
     * Allow user to download protected file without password.
     * If this set to false, download link will have temporary token attached to it
     * If this set to true, user can download the file without password as long as they have the link
     *
     * Default: false
     */
    allowDownloadProtectedFile: {{ api.allowDownloadProtectedFile }},

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
    temporaryTokenDuration: {{ api.temporaryTokenDuration }},
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
    siteName: "{{ site.siteName }}",
    siteNameTemplate: "{{ site.siteNameTemplate }}",
    siteDescription: "{{ site.siteDescription }}",
    siteIcon: "/logo.svg",
    siteAuthor: "{{ site.siteAuthor }}",
    favIcon: "/favicon.png",
    /**
     * Next.js Metadata robots object
     *
     * ref: https://nextjs.org/docs/app/api-reference/functions/generate-metadata#robots
     */
    robots: "{{ site.robots }}",
    twitterHandle: "{{ site.twitterHandle }}",

    /**
     * Show file extension on the file name
     * Example:
     *    true       |   false
     *    file.txt   |   file
     *    100KB      |   txt / 100KB
     *
     * Default: false
     */
    showFileExtension: {{ site.showFileExtension }},

    /**
     * Site wide password protection
     * If this is set, all files and folders will be protected by this password
     *
     * The site password are set from Environment Variable (NEXT_GDRIVE_INDEX_PASSWORD)
     * It's because I don't want to store sensitive data in the code
     */
    privateIndex: {{ site.privateIndex }},

    /**
     * Maximum breadcrumb length
     * If the breadcrumb is longer than this, it will be shortened
     */
    breadcrumbMax: {{ site.breadcrumbMax }},

    /**
     * Toast notification configuration
     *
     * position: Self-explanatory
     * duration: duration before the toast disappear in milliseconds
     */
    toaster: {
      position: "{{ site.toaster.position }}",
      duration: {{ site.toaster.duration }},
    },

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

    /**
     * Example item:
     * {
     *  icon: string, // icon name from lucide icons (https://lucide.dev/icons/)
     *  name: string,
     *  href: string,
     *  external?: boolean
     * }
     */
    navbarItems: {{ site.navbarItems }},

    /**
     * Add support / donation links on the navbar
     * Example item:
     * {
     *  name: string,
     *  currency: string,
     *  href: string,
     * }
     */
    supports: {{ site.supports }},

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
    footer: {{ site.footer }},
    /**
     * Add page load time on the footer
     * If you don't want to use it, you can set it to false
     */
    experimental_pageLoadTime: false,
  },
};

export default config;
`;
export const environmentTemplate = `# Base64 Encoded Service Account JSON
GD_SERVICE_B64={{ serviceAccount }}
# Secret Key for Encryption
ENCRYPTION_KEY={{ key }}
# Index password, used when private mode is enabled
SITE_PASSWORD={{ password }}

# [Optional] Only domain, without protocol (ex: mbaharip.com)
# Needed if you're not using Vercel
NEXT_PUBLIC_DOMAIN={{ domain }}`;

const version1Schema = Schema_v1_Config;
const version2Schema = Schema_v2_3_Config;
const newVersion2Schema = Schema_Config;
const formSchema = Schema_App_Configuration.omit({ environment: true });
const latestEnvironmentSchema = Schema_App_Configuration_Env;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ConfigurationResponse<T extends z.ZodObject<any>> =
  | z.infer<T>
  | {
      message: string;
      details: string[];
    };

export function parseVersion1Config(configuration: string) {
  const config = (configuration.split(/const config:\s.*?=\s/g)[1]?.split("export default config;")[0] ?? "")

    .replace(/\\/g, "") // Remove all escape backslashes
    .replace(/\/\*[\s\S]*?\*\//g, "") // Remove all multi-line comments
    .replace(/,\s\/\/\s.*/g, ",") // Remove comments after values
    .replace(/[^,]\/\/\s.*?,/g, "") // Remove single line comments

    .replace(/\r\n/g, "")
    .replace(/\n/g, "")
    .replace(/\t/g, "") // Remove line breaks and tabs

    .replace(/basePath:(.*?),/g, 'basePath: "placeholder-domain",') // Replace basePath variable with placeholder
    .replace(/maxFileSize:(.*?),/g, (str) => {
      if (!str) return "maxFileSize: 4194304,"; // Set maxFileSize to 4MB
      const value = str?.split(":")[1]?.split(",")[0]?.trim() ?? "";
      const numbers = value.split("*").map((v) => Number(v ?? "1"));
      return `maxFileSize: ${numbers.reduce((a, b) => a * b, 1)}`;
    })

    .replace(/([a-zA-Z]*?):\s/g, '"$1": ') // Add double quotes to keys
    .replace(/\s{2,4}|/g, "") // Replace all double+ spaces with single space
    .replace(/,(?=[^,]*$)/, "") // Remove trailing comma
    .replace(/(,\])/g, "]") // Remove trailing comma before closing bracket
    .replace(/(,\})/g, "}") // Remove trailing comma before closing brace
    .slice(0, -1);

  const json = JSON.parse(config) as object;
  const parsedJson = version1Schema.safeParse(json);
  if (!parsedJson.success) {
    return {
      message: "Failed to match the version 1 schema",
      details: parsedJson.error.errors.map((error) => `[${error.path.join(".")}] ${error.message}`),
    };
  }

  const { data } = parsedJson;

  const migratedData: z.input<typeof formSchema> = {
    version: data.version,
    api: {
      ...initialConfiguration.api,
      cache: {
        public: data.cacheControl.includes("public"),
        maxAge: Number(/max-age=(\d+)/.exec(data.cacheControl)?.[1] ?? 60),
        sMaxAge: Number(/s-maxage=(\d+)/.exec(data.cacheControl)?.[1] ?? 60),
        staleWhileRevalidate: data.cacheControl.includes("stale-while-revalidate"),
      },
      rootFolder: data.apiConfig.rootFolder,
      isTeamDrive: false,
      sharedDrive: "",
      itemsPerPage: data.apiConfig.itemsPerPage,
      searchResult: data.apiConfig.searchResult,
      specialFile: {
        password: data.apiConfig.specialFile.password,
        readme: data.apiConfig.specialFile.readme,
        banner: data.apiConfig.specialFile.banner,
      },
      hiddenFiles: data.apiConfig.hiddenFiles,
      allowDownloadProtectedFile: data.apiConfig.allowDownloadProtectedFile,
      temporaryTokenDuration: data.apiConfig.temporaryTokenDuration,
      maxFileSize: data.apiConfig.maxFileSize,
    },
    site: {
      ...initialConfiguration.site,
      guideButton: false,
      siteName: data.siteConfig.siteName,
      siteDescription: data.siteConfig.siteDescription,
      twitterHandle: data.siteConfig.twitterHandle ?? initialConfiguration.site.twitterHandle ?? "@__mbaharip__",
      privateIndex: data.siteConfig.privateIndex,
      navbarItems: data.siteConfig.navbarItems.map((item) => ({
        icon: "File",
        name: item.name,
        href: item.href,
        external: item.external ?? false,
      })),
    },
  };

  const parsedData = formSchema.safeParse(migratedData);
  if (!parsedData.success) {
    return {
      message: "Failed to migrate the old configuration to the new schema",
      details: parsedData.error.errors.map((error) => `[${error.path.join(".")}] ${error.message}`),
    };
  }

  return parsedData.data;
}

export function parseVersion2Config(configuration: string) {
  const isLatest = configuration.includes('version: "2.0.4"');
  const config = (configuration.split(/const config:\s.*?=\s/g)[1]?.split("export default config;")[0] ?? "")

    .replace(/\\/g, "") // Remove all escape backslashes
    .replace(/\/\*[\s\S]*?\*\//g, "") // Remove all multi-line comments
    .replace(/,\s\/\/\s.*/g, ",") // Remove comments after values
    .replace(/[^,]\/\/\s.*?,/g, "") // Remove single line comments

    .replace(/\r\n/g, "")
    .replace(/\n/g, "")
    .replace(/\t/g, "") // Remove line breaks and tabs

    .replace(/basePath:(.*?),/g, 'basePath: "placeholder-domain",') // Replace basePath variable with placeholder
    .replace(/streamMaxSize:(.*?),/g, (str) => {
      if (!str) return "streamMaxSize: 104857600,"; // Set streamMaxSize to 100MB
      const value = str?.split(":")[1]?.split(",")[0]?.trim() ?? "";
      const numbers = value.split("*").map((v) => Number(v ?? "1"));
      return `streamMaxSize: ${numbers.reduce((a, b) => a * b, 1)},`;
    })
    .replace(/temporaryTokenDuration:(.*?),/g, (str) => {
      if (!str) return "temporaryTokenDuration: 6,"; // Set temporaryTokenDuration to 6 hours
      const value = str?.split(":")[1]?.split(",")[0]?.trim() ?? "";
      if (value.includes("/")) {
        const numbers = value.split("/").map((v) => Number(v ?? "1"));
        return `temporaryTokenDuration: ${numbers.reduce((a, b) => a / b, 1)},`;
      } else {
        return `temporaryTokenDuration: ${value},`;
      }
    })
    .replace(/maxFileSize:(.*?),/g, (str) => {
      if (!str) return "maxFileSize: 4194304,"; // Set maxFileSize to 4MB
      const value = str?.split(":")[1]?.split(",")[0]?.trim() ?? "";
      const numbers = value.split("*").map((v) => Number(v ?? "1"));
      return `maxFileSize: ${numbers.reduce((a, b) => a * b, 1)},`;
    })
    .replace(/maxSize:(.*?),/g, (str) => {
      if (!str) return "maxSize: 15728640,"; // Set maxSize to 15MB
      const value = str?.split(":")[1]?.split(",")[0]?.trim() ?? "";
      const numbers = value.split("*").map((v) => Number(v ?? "1"));
      return `maxSize: ${numbers.reduce((a, b) => a * b, 1)},`;
    })

    .replace(/([a-zA-Z_]*?):\s/g, '"$1": ') // Add double quotes to keys
    .replace(/\s{2,4}|/g, "") // Replace all double+ spaces with single space
    .replace(/,(?=[^,]*$)/, "") // Remove trailing comma
    .replace(/(,\])/g, "]") // Remove trailing comma before closing bracket
    .replace(/(,\})/g, "}") // Remove trailing comma before closing brace
    .replace(/\"{3,}/g, '"') // Remove multiple double quotes
    .slice(0, -1);

  const json = JSON.parse(config) as object;
  if (isLatest) {
    const parsedJson = newVersion2Schema.safeParse(json);
    if (!parsedJson.success) {
      return {
        message: `Failed to match the schema for ${isLatest ? "latest" : "version 2.3 / below"} configuration`,
        details: parsedJson.error.errors.map((error) => `[${error.path.join(".")}] ${error.message}`),
      };
    }

    const { data } = parsedJson;

    const migratedData: z.input<typeof formSchema> = {
      version: data.version,
      api: {
        ...initialConfiguration.api,
        ...data.apiConfig,
        rootFolder: "",
        isTeamDrive: false,
        sharedDrive: "",
        cache: {
          public: data.cacheControl.includes("public"),
          maxAge: Number(/max-age=(\d+)/.exec(data.cacheControl)?.[1] ?? 60),
          sMaxAge: Number(/s-maxage=(\d+)/.exec(data.cacheControl)?.[1] ?? 60),
          staleWhileRevalidate: data.cacheControl.includes("stale-while-revalidate"),
        },
      },
      site: {
        ...initialConfiguration.site,
        ...data.siteConfig,
        guideButton: false,
      },
    };

    const parsedData = formSchema.safeParse(migratedData);
    if (!parsedData.success) {
      return {
        message: "Failed to migrate the old configuration to the new schema",
        details: parsedData.error.errors.map((error) => `[${error.path.join(".")}] ${error.message}`),
      };
    }

    return parsedData.data;
  } else {
    const parsedJson = version2Schema.safeParse(json);
    if (!parsedJson.success) {
      return {
        message: `Failed to match the schema for ${isLatest ? "latest" : "version 2.3 / below"} configuration`,
        details: parsedJson.error.errors.map((error) => `[${error.path.join(".")}] ${error.message}`),
      };
    }

    const { data } = parsedJson;

    const migratedData: z.input<typeof formSchema> = {
      version: data.version,
      api: {
        ...initialConfiguration.api,
        rootFolder: "",
        isTeamDrive: false,
        sharedDrive: "",
        cache: {
          public: data.cacheControl.includes("public"),
          maxAge: Number(/max-age=(\d+)/.exec(data.cacheControl)?.[1] ?? 60),
          sMaxAge: Number(/s-maxage=(\d+)/.exec(data.cacheControl)?.[1] ?? 60),
          staleWhileRevalidate: data.cacheControl.includes("stale-while-revalidate"),
        },
      },
      site: {
        ...initialConfiguration.site,
        ...data.siteConfig,
        footer: (data.siteConfig.footer ?? []).map((item) => ({ value: item })),
        guideButton: false,
      },
    };

    const parsedData = formSchema.safeParse(migratedData);
    if (!parsedData.success) {
      return {
        message: "Failed to migrate the old configuration to the new schema",
        details: parsedData.error.errors.map((error) => `[${error.path.join(".")}] ${error.message}`),
      };
    }

    return parsedData.data;
  }
}

export function parseEnvironment(configuration: string): ConfigurationResponse<typeof latestEnvironmentSchema> {
  const lines = configuration.split("\n");
  const result: Record<string, string> = {};
  const availableKeys = [
    "GD_SERVICE_B64",
    "ENCRYPTION_KEY",
    "SITE_PASSWORD",
    "NEXT_PUBLIC_DOMAIN",
    "NEXT_PUBLIC_VERCEL_URL",
    "NEXT_PUBLIC_ENCRYPTION_KEY",
    "NEXT_PUBLIC_SITE_PASSWORD",
  ];
  for (const line of lines) {
    if (!availableKeys.some((key) => line.startsWith(key))) {
      continue;
    }

    const [key, value] = line.split("=");
    if (!key || !value) continue;
    const formattedValue = value.replace(/"/g, "").trim();
    const formattedKey = ["NEXT_PUBLIC_ENCRYPTION_KEY", "NEXT_PUBLIC_SITE_PASSWORD"].includes(key)
      ? key.replace("NEXT_PUBLIC_", "")
      : key;
    result[formattedKey] = formattedValue;
  }
  const validated = latestEnvironmentSchema.safeParse(result);
  if (!validated.success)
    return {
      message: "Failed to match the latest environment schema",
      details: validated.error.errors.map((error) => `[${error.path.join(".")}] ${error.message}`),
    };

  return validated.data;
}
