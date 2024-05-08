"use client";

import toast from "react-hot-toast";
import { z } from "zod";
import {
  ConfigurationCategory,
  ConfigurationKeys,
  ConfigurationValue,
  Schema_App_Configuration,
} from "~/schema";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Separator } from "~/components/ui/separator";

import { decryptData } from "~/utils/encryptionHelper/hash";
import { parseConfigFile } from "~/utils/parseConfigFile";

import ConfigInput from "./@form.input";

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
  onReset: (category: ConfigurationCategory) => void;
};
export default function ApiConfig({
  state: { get, set },
  error,
  onReset,
}: Props) {
  return (
    <form
      className='flex w-full flex-col gap-3 py-3'
      onReset={(e) => {
        e.preventDefault();
        onReset("api");
      }}
    >
      <div
        slot='header'
        className='flex flex-col gap-3 tablet:flex-row tablet:items-center tablet:justify-between'
      >
        <h4>API</h4>
        <div className='flex w-full items-center gap-3 tablet:w-fit'>
          <Button
            variant={"outline"}
            size={"sm"}
            onClick={(e) => {
              e.preventDefault();

              try {
                const fileInput = document.createElement("input");
                fileInput.type = "file";
                fileInput.accept = ".config.ts";
                fileInput.onchange = async (fileEvent) => {
                  const file = (fileEvent.target as HTMLInputElement)
                    .files?.[0];
                  if (!file) return toast.error("No file selected");
                  const fileName = file.name;
                  if (fileName.toLowerCase() !== "gindex.config.ts")
                    return toast.error("Please select a config file");

                  const reader = new FileReader();
                  reader.onload = async (read) => {
                    const result = read.target?.result as string;
                    if (!result) return toast.error("Failed to read file");

                    const config = parseConfigFile(result);
                    if ("success" in config) return toast.error(config.message);

                    if (get.environment.ENCRYPTION_KEY) {
                      try {
                        const root = config.api.rootFolder;
                        const shared = config.api.sharedDrive || null;
                        if (root && typeof root === "string") {
                          const decrypted = await decryptData(
                            root,
                            get.environment.ENCRYPTION_KEY,
                          );
                          if (decrypted) {
                            set("api", "rootFolder", decrypted);
                          }
                        }
                        if (shared && typeof shared === "string") {
                          const decrypted = await decryptData(
                            shared,
                            get.environment.ENCRYPTION_KEY,
                          );
                          if (decrypted) {
                            set("api", "sharedDrive", decrypted);
                          }
                        }
                      } catch (error) {
                        const e = error as Error;
                        console.error(e);
                        toast.error(
                          "Skipping Root Folder / Shared Drive ID, can't decrypt with current Encryption Key",
                        );
                      }
                    } else {
                      toast.error(
                        "Can't decrypt Root Folder / Shared Drive ID without Encryption Key",
                      );
                    }
                    set("api", "isTeamDrive", config.api.isTeamDrive || false);
                    set("api", "itemsPerPage", config.api.itemsPerPage || 50);
                    set("api", "searchResult", config.api.searchResult || 5);
                    set(
                      "api",
                      "proxyThumbnail",
                      config.api.proxyThumbnail || true,
                    );
                    set(
                      "api",
                      "allowDownloadProtectedFile",
                      config.api.allowDownloadProtectedFile || false,
                    );
                    set(
                      "api",
                      "temporaryTokenDuration",
                      config.api.temporaryTokenDuration || 6,
                    );
                    set(
                      "api",
                      "maxFileSize",
                      config.api.maxFileSize || 4 * 1024 * 1024,
                    );
                    set(
                      "api",
                      "streamMaxSize",
                      config.api.streamMaxSize || 100 * 1024 * 1024,
                    );

                    fileInput.value = "";
                    toast.success("Config loaded from file");
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
            Load from file
          </Button>
          <Button
            type='reset'
            variant={"destructive"}
            size={"sm"}
          >
            Reset
          </Button>
        </div>
      </div>

      <Separator />

      <div
        slot='inputs'
        className='flex flex-col gap-3'
      >
        <ConfigInput<ConfigurationKeys<"api">>
          key='rootFolder'
          title='Root Folder ID'
          description={`Starting point of the drive, will be used as the root folder to display files and folders.
This ID will be encrypted in the config file.`}
          error={error.get.rootFolder}
          required
        >
          <Input
            id='rootFolder'
            name='rootFolder'
            value={get.api.rootFolder}
            onChange={(e) => {
              if (error.get.rootFolder) {
                error.set("rootFolder", "");
              }
              set("api", "rootFolder", e.target.value);
            }}
            onBlur={async () => {
              try {
                const value = get.api.rootFolder;
                error.set("rootFolder", "");

                if (!value) throw new Error("Root Folder ID is required");
              } catch (err) {
                const e = err as Error;
                error.set("rootFolder", e.message);
              }
            }}
          />
        </ConfigInput>

        <ConfigInput<ConfigurationKeys<"api">>
          key='isTeamDrive'
          title='Use Team Drive'
          description={`If you are using Shared Drive, you NEED to enable this option.`}
          error={error.get.isTeamDrive}
          required
        >
          <Select
            value={get.api.isTeamDrive.toString()}
            onValueChange={(value) => {
              set("api", "isTeamDrive", value === "true");
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder={"Select an option"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={"true"}>Enable</SelectItem>
              <SelectItem value={"false"}>Disable</SelectItem>
            </SelectContent>
          </Select>
        </ConfigInput>

        {get.api.isTeamDrive && (
          <ConfigInput<ConfigurationKeys<"api">>
            key='sharedDrive'
            title='Shared Drive ID'
            description={`The Drive ID of the Shared Drive.
This ID will be encrypted in the config file`}
            error={error.get.sharedDrive}
            required={get.api.isTeamDrive}
          >
            <Input
              id='sharedDrive'
              name='sharedDrive'
              value={get.api.sharedDrive}
              onChange={(e) => {
                if (error.get.sharedDrive) {
                  error.set("sharedDrive", "");
                }
                set("api", "sharedDrive", e.target.value);
              }}
              onBlur={async () => {
                try {
                  const value = get.api.sharedDrive;
                  const isTeamDrive = get.api.isTeamDrive;
                  error.set("sharedDrive", "");

                  if (!isTeamDrive) return;
                  if (!value)
                    throw new Error(
                      "Shared Drive ID is required if using Team Drive",
                    );
                } catch (err) {
                  const e = err as Error;
                  error.set("sharedDrive", e.message);
                }
              }}
            />
          </ConfigInput>
        )}

        <div className='grid grid-cols-1 gap-3 tablet:grid-cols-2'>
          <ConfigInput<ConfigurationKeys<"api">>
            key='itemsPerPage'
            title='Items Per Page'
            description={`Set how many items to display per page in the file list.          
It's recommended to set this to a reasonable number, since it will affect the load time of the page.

Default is 50.`}
            error={error.get.itemsPerPage}
            required
          >
            <Input
              id='itemsPerPage'
              name='itemsPerPage'
              type='number'
              value={get.api.itemsPerPage}
              min={1}
              onChange={(e) => {
                if (error.get.itemsPerPage) {
                  error.set("itemsPerPage", "");
                }
                set("api", "itemsPerPage", parseInt(e.target.value));
              }}
              onBlur={async () => {
                try {
                  const value = get.api.itemsPerPage;
                  error.set("itemsPerPage", "");

                  if (value <= 0)
                    throw new Error("Items Per Page must be more than 0");
                } catch (err) {
                  const e = err as Error;
                  error.set("itemsPerPage", e.message);
                }
              }}
            />
          </ConfigInput>

          <ConfigInput<ConfigurationKeys<"api">>
            key='searchResult'
            title='Search Result'
            description={`Set how many items to display in the search result.
It's recommended to set this to a small number, since it will affect the load time of the page.

Default is 5.`}
            error={error.get.searchResult}
            required
          >
            <Input
              id='searchResult'
              name='searchResult'
              type='number'
              value={get.api.searchResult}
              min={1}
              onChange={(e) => {
                if (error.get.searchResult) {
                  error.set("searchResult", "");
                }
                set("api", "searchResult", parseInt(e.target.value));
              }}
              onBlur={async () => {
                try {
                  const value = get.api.searchResult;
                  error.set("searchResult", "");

                  if (value <= 0)
                    throw new Error("Search Result must be more than 0");
                } catch (err) {
                  const e = err as Error;
                  error.set("searchResult", e.message);
                }
              }}
            />
          </ConfigInput>
        </div>

        <ConfigInput<ConfigurationKeys<"api">>
          key='proxyThumbnail'
          title='Proxy Thumbnail'
          description={`Proxy the thumbnail image via API route.

If your files thumbnail are not accessible, you can set this to true.
This will fetch the thumbnail image via API route, but it will increase the load on your server.`}
          error={error.get.proxyThumbnail}
          required
        >
          <Select
            value={get.api.proxyThumbnail.toString()}
            onValueChange={(value) => {
              set("api", "proxyThumbnail", value === "true");
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder={"Select an option"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={"true"}>Enable</SelectItem>
              <SelectItem value={"false"}>Disable</SelectItem>
            </SelectContent>
          </Select>
        </ConfigInput>

        <ConfigInput<ConfigurationKeys<"api">>
          key='allowDownloadProtectedFile'
          title='Allow Download Protected File'
          description={`Allow users to download password protected files.

If set to true, users will be able to download the file without entering password as long as they have the link
If set to false, the download link will have a temporary token attached to it, the token will expire after certain duration (default is 6 hours)`}
          error={error.get.allowDownloadProtectedFile}
          required
        >
          <Select
            value={get.api.allowDownloadProtectedFile.toString()}
            onValueChange={(value) => {
              set("api", "allowDownloadProtectedFile", value === "true");
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder={"Select an option"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={"true"}>Enable</SelectItem>
              <SelectItem value={"false"}>Disable</SelectItem>
            </SelectContent>
          </Select>
        </ConfigInput>

        <ConfigInput<ConfigurationKeys<"api">>
          key='temporaryTokenDuration'
          title='Temporary Token Duration (in hours)'
          description={`Duration of the temporary token used for protected files download link.`}
          error={error.get.temporaryTokenDuration}
          required
        >
          <Input
            id='temporaryTokenDuration'
            name='temporaryTokenDuration'
            type='number'
            value={get.api.temporaryTokenDuration}
            min={1}
            max={24 * 7}
            onChange={(e) => {
              if (error.get.temporaryTokenDuration) {
                error.set("temporaryTokenDuration", "");
              }
              set("api", "temporaryTokenDuration", parseInt(e.target.value));
            }}
            onBlur={async () => {
              try {
                const value = get.api.temporaryTokenDuration;
                error.set("temporaryTokenDuration", "");

                if (value <= 0)
                  throw new Error(
                    "Temporary Token Duration must be more than 0",
                  );
              } catch (err) {
                const e = err as Error;
                error.set("temporaryTokenDuration", e.message);
              }
            }}
          />
        </ConfigInput>

        <ConfigInput<ConfigurationKeys<"api">>
          key='maxFileSize'
          title='Max Direct Download Size (in MB)'
          description={`Max file size that can be downloaded directly from the server, instead of download link from Google Drive.
Please refer to your deploy platform for the maximum response size limit.
If you are using Vercel, the maximum response size is around 4 - 4.5MB.

Set to 0 to disable the limit.`}
          error={error.get.maxFileSize}
          required
        >
          <Input
            id='maxFileSize'
            name='maxFileSize'
            type='number'
            value={get.api.maxFileSize / 1024 / 1024}
            min={0}
            onChange={(e) => {
              if (error.get.maxFileSize) {
                error.set("maxFileSize", "");
              }
              set("api", "maxFileSize", parseInt(e.target.value) * 1024 * 1024);
            }}
            onBlur={async () => {
              try {
                const value = get.api.maxFileSize;
                error.set("maxFileSize", "");

                if (value < 0)
                  throw new Error(
                    "Max file size must be more than or equal to 0",
                  );
              } catch (err) {
                const e = err as Error;
                error.set("maxFileSize", e.message);
              }
            }}
          />
        </ConfigInput>

        <ConfigInput<ConfigurationKeys<"api">>
          key='streamMaxSize'
          title='Max Stream Size (in MB)'
          description={`For previewing large files, the file will be streamed in chunks.
There are response limit in some deploy platform like Vercel, also Google Drive will return 403 error if we tried using fetch to download large file on client.

Make sure it's within reasonable size, since it will count towards your server bandwidth usage.
This will also affect the maximum file size that can be previewed. Especially for media files like video, audio, and images.
(Manga preview will automatically limited to the first 5MB)

Default is 100MB, set to 0 to disable the limit.`}
          error={error.get.streamMaxSize}
          required
        >
          <Input
            id='streamMaxSize'
            name='streamMaxSize'
            type='number'
            value={get.api.streamMaxSize / 1024 / 1024}
            min={0}
            onChange={(e) => {
              if (error.get.maxFileSize) {
                error.set("streamMaxSize", "");
              }
              set(
                "api",
                "streamMaxSize",
                parseInt(e.target.value) * 1024 * 1024,
              );
            }}
            onBlur={async () => {
              try {
                const value = get.api.streamMaxSize;
                error.set("streamMaxSize", "");

                if (value < 0)
                  throw new Error(
                    "Max stream size must be more than or equal to 0",
                  );
              } catch (err) {
                const e = err as Error;
                error.set("streamMaxSize", e.message);
              }
            }}
          />
        </ConfigInput>
      </div>
    </form>
  );
}
