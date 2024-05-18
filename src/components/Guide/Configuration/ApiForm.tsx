import { FormEvent } from "react";
import toast from "react-hot-toast";
import { z } from "zod";

import { type ConfigInputs, ConfigurationHeader, ConfigurationInput } from "~/components/Guide/Configuration";
import { Separator } from "~/components/ui/separator";

import { decryptData } from "~/utils/encryptionHelper";
import { fileLoadHelper } from "~/utils/fileLoadHelper";
import { parseConfigFile } from "~/utils/parseConfigFile";

import { ConfigurationCategory, ConfigurationKeys, ConfigurationValue, Schema_App_Configuration } from "~/types/schema";

type Props = {
  state: {
    get: z.input<typeof Schema_App_Configuration>;
    set: <
      T extends ConfigurationCategory = ConfigurationCategory,
      K extends ConfigurationKeys<T> = ConfigurationKeys<T>,
    >(
      category: T,
      key: K,
      value: ConfigurationValue<T, K>,
    ) => void;
  };
  error: {
    get: Partial<Record<ConfigurationKeys<"api">, string>>;
    set: <T extends ConfigurationKeys<"api">>(key: T, value: string) => void;
  };
  onReset: (category: ConfigurationCategory | "all") => void;
};

export default function ConfigApi({ state: { get, set }, error, onReset }: Props) {
  const inputs: ConfigInputs<"api", ConfigurationKeys<"api">>[] = [
    {
      type: "text",
      inputKey: "rootFolder",
      title: "Root Folder ID",
      description: `starting point of the drive, will be used as the root folder for the explorer
This ID will be encrypted in the config file`,
      required: true,
      value: get.api.rootFolder,
      onValueChange: (key, value) => set("api", key, value),
      error: error.get.rootFolder,
      onError: (err) => error.set("rootFolder", err),
      placeholder: "Starting point of the drive",
    },
    {
      type: "group",
      inputKey: "sharedGroup",
      columns: 3,
      children: [
        {
          type: "select",
          inputKey: "isTeamDrive",
          title: "Use Team Drive",
          description: "Enable this option if you are using a Team Drive instead of a personal drive",
          required: true,
          value: get.api.isTeamDrive,
          onValueChange: (key, value) => {
            set("api", key, value);
            if (value === false) {
              set("api", "sharedDrive", "");
              error.set("sharedDrive", "");
            }
          },
          error: error.get.isTeamDrive,
          onError: (err) => error.set("isTeamDrive", err),
        },
        {
          type: "text",
          inputKey: "sharedDrive",
          title: "Shared Drive ID",
          description: `The ID of the Shared Drive
This ID will be encrypted in the config file`,
          required: true,
          value: get.api.sharedDrive,
          onValueChange: (key, value) => set("api", key, value),
          error: error.get.sharedDrive,
          onError: (err) => error.set("sharedDrive", err),
          disabled: !get.api.isTeamDrive,
          placeholder: get.api.isTeamDrive ? "Make sure to copy the Drive ID" : "You need to enable Team Drive first",
          columnSpan: 2,
        },
      ],
    },
    {
      type: "group",
      inputKey: "pagination",
      columns: 2,
      children: [
        {
          type: "number",
          inputKey: "itemsPerPage",
          title: "Items per page",
          description: `Set how many items to display per page in the file explorer
It's recommended to keep this value to a reasonable number, since it will affect the load time of the page

Default: 50`,
          required: true,
          value: get.api.itemsPerPage,
          onValueChange: (key, value) => set("api", key, value),
          error: error.get.itemsPerPage,
          onError: (err) => error.set("itemsPerPage", err),
          minMax: { min: 1 },
          validation: async (value) => {
            const num = Number(value);
            if (isNaN(num)) return { success: false, message: "Value must be a number" };
            if (num < 1) return { success: false, message: "Items per page must be greater than 0" };
            return { success: true, message: "" };
          },
        },
        {
          type: "number",
          inputKey: "searchResult",
          title: "Search Results",
          description: `Set how many search results to display
It's recommended to set this to a small number, since it will affect search performance

Default: 5`,
          required: true,
          value: get.api.searchResult,
          onValueChange: (key, value) => set("api", key, value),
          error: error.get.searchResult,
          onError: (err) => error.set("searchResult", err),
          minMax: { min: 1 },
          validation: async (value) => {
            const num = Number(value);
            if (isNaN(num)) return { success: false, message: "Value must be a number" };
            if (num < 1) return { success: false, message: "Search result must be greater than 0" };
            return { success: true, message: "" };
          },
        },
      ],
    },
    {
      type: "select",
      inputKey: "proxyThumbnail",
      title: "Allow Proxy Thumbnail",
      description: `Use API route instead of Google Drive thumbnail link
      
If your files thumbnail are not accessible, you can enable this option
This will fetch the thumbnail image via API route`,
      required: true,
      value: get.api.proxyThumbnail,
      onValueChange: (key, value) => set("api", key, value),
      error: error.get.proxyThumbnail,
      onError: (err) => error.set("proxyThumbnail", err),
    },
    {
      type: "group",
      inputKey: "protectedFile",
      columns: 2,
      children: [
        {
          type: "select",
          inputKey: "allowDownloadProtectedFile",
          title: "Allow Download Protected File",
          description: `Allow users to download files inside the protected folder
    
    If set to true, users will be able to download the file without entering the password as long as they have the direct link
    If set to false, users will need to enter the password before downloading the file, even if they have the direct link`,
          required: true,
          value: get.api.allowDownloadProtectedFile,
          onValueChange: (key, value) => set("api", key, value),
          error: error.get.allowDownloadProtectedFile,
          onError: (err) => error.set("allowDownloadProtectedFile", err),
        },
        {
          type: "number",
          inputKey: "temporaryTokenDuration",
          title: "Temporary Token Duration (in hours)",
          description: `Set how long the download token will be valid
If the token is expired, users will need to re-open the file page to get a new token`,
          required: true,
          value: get.api.temporaryTokenDuration,
          onValueChange: (key, value) => set("api", key, value),
          error: error.get.temporaryTokenDuration,
          minMax: { min: 1, max: 24 * 30 },
          validation: async (value) => {
            const num = Number(value);
            if (isNaN(num)) return { success: false, message: "Value must be a number" };
            if (num < 1) return { success: false, message: "Token duration must be greater than 0" };
            if (num > 24 * 30)
              return { success: false, message: "Token duration can't be more than 720 hours (30 days)" };
            return { success: true, message: "" };
          },
        },
      ],
    },
    {
      type: "group",
      inputKey: "fileSize",
      columns: 2,
      children: [
        {
          type: "number",
          inputKey: "maxFileSize",
          title: "Max Direct Download Size (in MB)",
          description: `Max file size that can be downloaded directly from the server
Please check your deploy platform for the maximum response size limit
If you're using Vercel, the maximum size is around 4 - 4.5MB, any file larger than this size will return an error

Set to 0 to disable the limit`,
          required: true,
          value: get.api.maxFileSize / 1024 / 1024,
          onValueChange: (key, value) => set("api", key, value * 1024 * 1024),
          error: error.get.maxFileSize,
          minMax: { min: 0 },
          validation: async (value) => {
            const num = Number(value);
            if (isNaN(num)) return { success: false, message: "Value must be a number" };
            if (num < 0) return { success: false, message: "Size must be greater than or equal to 0" };
            return { success: true, message: "" };
          },
        },
        {
          type: "number",
          inputKey: "streamMaxSize",
          title: "Max Stream Size (in MB)",
          description: `For previewing large files, the file will be streamed in chunks
Make sure to set this value to a reasonable number, since it will count towards your server bandwidth usage

This will also affect the maximum file size that can be previewed. Especially for media files like video, audio, and images
(Manga preview will automatically limited to the first 5MB)

Set to 0 to disable the limit
Default: 100`,
          required: true,
          value: get.api.streamMaxSize / 1024 / 1024,
          onValueChange: (key, value) => set("api", key, value * 1024 * 1024),
          error: error.get.streamMaxSize,
          minMax: { min: 0 },
          validation: async (value) => {
            const num = Number(value);
            if (isNaN(num)) return { success: false, message: "Value must be a number" };
            if (num < 0) return { success: false, message: "Size must be greater than or equal to 0" };
            return { success: true, message: "" };
          },
        },
      ],
    },
  ];

  function onFileLoad() {
    fileLoadHelper({
      accept: ".config.ts",
      fileName: "gindex.config.ts",
      async onLoad(result) {
        const config = parseConfigFile(result);
        if ("success" in config) return toast.error(config.message);

        if (get.environment.ENCRYPTION_KEY) {
          try {
            const root = config.api.rootFolder;
            const shared = config.api.sharedDrive || null;
            if (root) {
              const decrypted = await decryptData(root, get.environment.ENCRYPTION_KEY);
              if (decrypted) set("api", "rootFolder", decrypted);
            }
            if (shared) {
              const decrypted = await decryptData(shared, get.environment.ENCRYPTION_KEY);
              if (decrypted) set("api", "sharedDrive", decrypted);
            }
          } catch (error) {
            const e = error as Error;
            console.error(e.message);
            toast.error("Skipping decryption of folder ID, please check your Encryption Key and try again.");
          }
        } else {
          toast.error("Can't decrypt folder ID without Encryption Key");
        }
        config.api.isTeamDrive && set("api", "isTeamDrive", config.api.isTeamDrive);
        config.api.itemsPerPage && set("api", "itemsPerPage", config.api.itemsPerPage);
        config.api.searchResult && set("api", "searchResult", config.api.searchResult);
        config.api.proxyThumbnail && set("api", "proxyThumbnail", config.api.proxyThumbnail);
        config.api.allowDownloadProtectedFile &&
          set("api", "allowDownloadProtectedFile", config.api.allowDownloadProtectedFile);
        config.api.temporaryTokenDuration && set("api", "temporaryTokenDuration", config.api.temporaryTokenDuration);
        config.api.maxFileSize && set("api", "maxFileSize", config.api.maxFileSize);
        config.api.streamMaxSize && set("api", "streamMaxSize", config.api.streamMaxSize);

        // Other config
        config.api.defaultQuery && set("api", "defaultQuery", config.api.defaultQuery);
        config.api.defaultField && set("api", "defaultField", config.api.defaultField);
        config.api.defaultOrder && set("api", "defaultOrder", config.api.defaultOrder);
        config.api.specialFile && set("api", "specialFile", config.api.specialFile);
        config.api.hiddenFiles && set("api", "hiddenFiles", config.api.hiddenFiles);

        // Site config
        config.site.siteName && set("site", "siteName", config.site.siteName);
        config.site.siteNameTemplate && set("site", "siteNameTemplate", config.site.siteNameTemplate);
        config.site.siteDescription && set("site", "siteDescription", config.site.siteDescription);
        config.site.siteIcon && set("site", "siteIcon", config.site.siteIcon);
        config.site.favIcon && set("site", "favIcon", config.site.favIcon);
        config.site.siteAuthor && set("site", "siteAuthor", config.site.siteAuthor);
        config.site.twitterHandle && set("site", "twitterHandle", config.site.twitterHandle);
        config.site.robots && set("site", "robots", config.site.robots);

        config.site.showFileExtension && set("site", "showFileExtension", config.site.showFileExtension);
        config.site.footer && set("site", "footer", config.site.footer);
        config.site.privateIndex && set("site", "privateIndex", config.site.privateIndex);
        config.site.breadcrumbMax && set("site", "breadcrumbMax", config.site.breadcrumbMax);
        config.site.toaster && set("site", "toaster", config.site.toaster);
        config.site.navbarItems && set("site", "navbarItems", config.site.navbarItems);
        config.site.supports && set("site", "supports", config.site.supports);

        toast.success("API configuration has been loaded.");
      },
    });
  }
  function onFormReset(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    onReset("api");
    toast.success("API section has been reset to default values.");
  }

  return (
    <form
      className='flex w-full flex-col gap-3 py-3'
      onReset={onFormReset}
    >
      <ConfigurationHeader
        title='API Configuration'
        onLoad={onFileLoad}
      />
      <Separator />

      <div
        slot='inputs'
        className='flex flex-col gap-3'
      >
        {inputs.map((props, index) => (
          <ConfigurationInput<"api", ConfigurationKeys<"api">>
            key={String(props.inputKey)}
            {...props}
          />
        ))}
      </div>
    </form>
  );
}
