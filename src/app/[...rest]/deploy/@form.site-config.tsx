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

import { parseConfigFile } from "~/utils/parseConfigFile";

import config from "~/config/gIndex.config";

import ConfigInput from "./@form.input-config";

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
    get: Partial<Record<ConfigurationKeys<"site">, string>>;
    set: <T extends ConfigurationKeys<"site">>(key: T, value: string) => void;
  };
  onReset: (category: ConfigurationCategory) => void;
};
export default function SiteConfig({
  state: { get, set },
  error,
  onReset,
}: Props) {
  return (
    <form
      className='flex w-full flex-col gap-3 py-3'
      onReset={(e) => {
        e.preventDefault();
        onReset("site");
      }}
    >
      <div
        slot='header'
        className='flex flex-col gap-3 tablet:flex-row tablet:items-center tablet:justify-between'
      >
        <h4>Site</h4>
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

                    set(
                      "site",
                      "siteName",
                      config.site.siteName || get.site.siteName,
                    );
                    set(
                      "site",
                      "siteNameTemplate",
                      config.site.siteNameTemplate ||
                        (get.site.siteNameTemplate as string),
                    );
                    set(
                      "site",
                      "siteDescription",
                      config.site.siteDescription || get.site.siteDescription,
                    );
                    set(
                      "site",
                      "siteAuthor",
                      config.site.siteAuthor || (get.site.siteAuthor as string),
                    );
                    set(
                      "site",
                      "twitterHandle",
                      config.site.twitterHandle ||
                        (get.site.twitterHandle as string),
                    );

                    set(
                      "site",
                      "showFileExtension",
                      config.site.showFileExtension ||
                        (get.site.showFileExtension as boolean),
                    );

                    set(
                      "site",
                      "privateIndex",
                      config.site.privateIndex ||
                        (get.site.privateIndex as boolean),
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
        <div className='flex flex-col'>
          <div className='flex items-center gap-1.5 px-1.5 pt-3'>
            <div className='flex select-none items-center gap-1.5 rounded-t-lg border border-b-0 border-border px-3 py-1.5'>
              <img
                src={config.siteConfig.favIcon}
                className='size-4'
                alt='favicon'
              />
              <span className='text-sm'>{get.site.siteName}</span>
            </div>

            <div className='flex select-none items-center gap-1.5 rounded-t-lg border border-b-0 border-border px-3 py-1.5'>
              <img
                src={config.siteConfig.favIcon}
                className='size-4'
                alt='favicon'
              />
              <span className='text-sm'>
                {get.site
                  .siteNameTemplate!.replace("%s", "Page Title")
                  .replace("%t", get.site.siteName)}
              </span>
            </div>
          </div>
          <Separator className='mt-0' />
        </div>

        <div className='grid grid-cols-3 gap-6'>
          <div className='col-span-2 flex flex-col gap-3'>
            <ConfigInput<ConfigurationKeys<"site">>
              key='siteName'
              title='Index Site Name'
              error={error.get.siteName}
              required
            >
              <Input
                id='siteName'
                name='siteName'
                value={get.site.siteName}
                onChange={(e) => {
                  if (error.get.siteName) {
                    error.set("siteName", "");
                  }
                  set("site", "siteName", e.target.value);
                }}
                onBlur={async () => {
                  try {
                    const value = get.site.siteName;
                    error.set("siteName", "");

                    if (!value) throw new Error("Site name is required");
                  } catch (err) {
                    const e = err as Error;
                    error.set("siteName", e.message);
                  }
                }}
              />
            </ConfigInput>

            <ConfigInput<ConfigurationKeys<"site">>
              key='siteNameTemplate'
              title='Site Name Template'
              description={`The template for the site name.

Usable variables:
%s - Page Title
%t - Site Name`}
              error={error.get.siteNameTemplate}
            >
              <Input
                id='siteNameTemplate'
                name='siteNameTemplate'
                value={get.site.siteNameTemplate}
                onChange={(e) => {
                  if (error.get.siteNameTemplate) {
                    error.set("siteNameTemplate", "");
                  }
                  set("site", "siteNameTemplate", e.target.value);
                }}
                onBlur={async () => {
                  try {
                    const value = get.site.siteNameTemplate;
                    error.set("siteNameTemplate", "");
                  } catch (err) {
                    const e = err as Error;
                    error.set("siteNameTemplate", e.message);
                  }
                }}
              />
            </ConfigInput>

            <ConfigInput<ConfigurationKeys<"site">>
              key='siteDescription'
              title='Site Description'
              error={error.get.siteDescription}
              required
            >
              <Input
                id='siteDescription'
                name='siteDescription'
                value={get.site.siteDescription}
                onChange={(e) => {
                  if (error.get.siteDescription) {
                    error.set("siteDescription", "");
                  }
                  set("site", "siteDescription", e.target.value);
                }}
                onBlur={async () => {
                  try {
                    const value = get.site.siteDescription;
                    error.set("siteDescription", "");

                    if (!value) throw new Error("Site description is required");
                  } catch (err) {
                    const e = err as Error;
                    error.set("siteDescription", e.message);
                  }
                }}
              />
            </ConfigInput>

            <div className='grid grid-cols-2 gap-3'>
              <ConfigInput<ConfigurationKeys<"site">>
                key='siteAuthor'
                title='Site Author'
                error={error.get.siteAuthor}
                description={`Will be used for metadata, and also affect the footer variable`}
              >
                <Input
                  id='siteAuthor'
                  name='siteAuthor'
                  value={get.site.siteAuthor}
                  onChange={(e) => {
                    if (error.get.siteAuthor) {
                      error.set("siteAuthor", "");
                    }
                    set("site", "siteAuthor", e.target.value);
                  }}
                  onBlur={async () => {
                    try {
                      const value = get.site.siteAuthor;
                      error.set("siteAuthor", "");
                    } catch (err) {
                      const e = err as Error;
                      error.set("siteAuthor", e.message);
                    }
                  }}
                />
              </ConfigInput>

              <ConfigInput<ConfigurationKeys<"site">>
                key='twitterHandle'
                title='Twitter Handle'
                error={error.get.twitterHandle}
                description={`Will be used for metadata, and also affect the footer variable`}
              >
                <Input
                  id='twitterHandle'
                  name='twitterHandle'
                  value={get.site.twitterHandle}
                  onChange={(e) => {
                    if (error.get.twitterHandle) {
                      error.set("twitterHandle", "");
                    }
                    set("site", "twitterHandle", e.target.value);
                  }}
                  onBlur={async () => {
                    try {
                      const value = get.site.twitterHandle;
                      error.set("twitterHandle", "");
                    } catch (err) {
                      const e = err as Error;
                      error.set("twitterHandle", e.message);
                    }
                  }}
                />
              </ConfigInput>
            </div>
          </div>

          <div className='h-fit select-none overflow-hidden rounded-md border bg-popover p-0 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2'>
            <img
              src={"/og.png"}
              alt='Opengraph Preview'
              className='w-full'
            />
            <div className='flex flex-col px-3 py-1.5'>
              <span className='line-clamp-1 w-full text-lg font-medium'>
                {(get.site.siteNameTemplate || "%s")
                  .replace("%s", "Page Title")
                  .replace("%t", get.site.siteName)}
              </span>
              <span className='text-xs text-muted-foreground'>
                {get.environment.NEXT_PUBLIC_DOMAIN || "http://localhost:3000"}
              </span>
              <span className='line-clamp-2 text-sm text-muted-foreground'>
                {get.site.siteDescription}
              </span>
            </div>
          </div>
        </div>

        <Separator />

        <ConfigInput<ConfigurationKeys<"site">>
          key='privateIndex'
          title='Private Index'
          description={`Lock the whole site behind a password
Will use the site password set in the "Environment" category`}
          error={error.get.privateIndex}
          required
        >
          <Select
            value={(get.site.privateIndex || false).toString()}
            onValueChange={(value) => {
              set("site", "privateIndex", value === "true");
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

        <ConfigInput<ConfigurationKeys<"site">>
          key='showFileExtension'
          title='Show File Extension'
          description={`Show file extension in file explorer
          
e.g. "file.mp4" instead of "file"`}
          error={error.get.showFileExtension}
          required
        >
          <Select
            value={(get.site.showFileExtension || false).toString()}
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
      </div>
    </form>
  );
}
