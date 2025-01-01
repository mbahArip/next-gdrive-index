import { FormEvent } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { type ConfigInputs, ConfigurationHeader, ConfigurationInput } from "~/components/Guide/Configuration";
import { Icon } from "~/components/global";
import { Separator } from "~/components/ui/separator";

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
    get: Partial<Record<ConfigurationKeys<"site">, string>>;
    set: <T extends ConfigurationKeys<"site">>(key: T, value: string) => void;
  };
  onReset: (category: ConfigurationCategory | "all") => void;
};

export default function ConfigSite({ state: { get, set }, error, onReset }: Props) {
  const metadataInputs: ConfigInputs<"site", ConfigurationKeys<"site">>[] = [
    {
      type: "text",
      inputKey: "siteName",
      title: "Site Name",
      required: true,
      value: get.site.siteName,
      onValueChange: (key, value) => set("site", key, value),
      error: error.get.siteName,
      onError: (err) => error.set("siteName", err),
    },
    {
      type: "text",
      inputKey: "siteNameTemplate",
      title: "Site Name Template",
      description: `The template used to generate the site name

Available variables:
%s - Page title
%t - Site name`,
      required: true,
      value: get.site.siteNameTemplate,
      onValueChange: (key, value) => set("site", key, value),
      error: error.get.siteNameTemplate,
      onError: (err) => error.set("siteNameTemplate", err),
    },
    {
      type: "text",
      inputKey: "siteDescription",
      title: "Site Description",
      required: true,
      value: get.site.siteDescription,
      onValueChange: (key, value) => set("site", key, value),
      error: error.get.siteDescription,
      onError: (err) => error.set("siteDescription", err),
    },
    {
      type: "group",
      inputKey: "author",
      columns: 2,
      children: [
        {
          type: "text",
          inputKey: "siteAuthor",
          title: "Site Author",
          description: `Will be used for metadata, also affect the footer variable`,
          value: get.site.siteAuthor,
          onValueChange: (key, value) => set("site", key, value),
          error: error.get.siteAuthor,
          onError: (err) => error.set("siteAuthor", err),
          placeholder: "Your username here",
        },
        {
          type: "text",
          inputKey: "twitterHandle",
          title: "Twitter Handle",
          description: `Will be used for metadata, also affect the footer variable`,
          value: get.site.twitterHandle,
          onValueChange: (key, value) => set("site", key, value),
          error: error.get.twitterHandle,
          onError: (err) => error.set("twitterHandle", err),
          placeholder: "e.g. @__mbaharip__",
        },
      ],
    },
  ];
  const inputs: ConfigInputs<"site", ConfigurationKeys<"site">>[] = [
    {
      type: "select",
      inputKey: "privateIndex",
      title: "Private Index",
      description: `Lock the whole site behind a password
Will use the Site Password in the Environment section`,
      required: true,
      value: get.site.privateIndex,
      onValueChange: (key, value) => set("site", key, value),
      error: error.get.privateIndex,
      onError: (err) => error.set("privateIndex", err),
    },
    {
      type: "select",
      inputKey: "showFileExtension",
      title: "Show File Extension",
      description: `Show file extension in file explorer

e.g. "file.mp4" instead of "file"`,
      required: true,
      value: get.site.showFileExtension,
      onValueChange: (key, value) => set("site", key, value),
      error: error.get.showFileExtension,
      onError: (err) => error.set("showFileExtension", err),
    },
    {
      type: "text",
      inputKey: "favIcon",
      title: "Favicon",
      description: `The favicon of the site`,
      required: true,
      value: get.site.favIcon,
      onValueChange: (key, value) => set("site", key, value),
      error: error.get.favIcon,
      onError: (err) => error.set("favIcon", err),
    },
  ];

  function onFormReset(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    onReset("site");
    toast.success("Site section has been reset to default values.");
  }

  return (
    <form
      className='flex w-full flex-col gap-4 py-3'
      onReset={onFormReset}
    >
      <ConfigurationHeader title='Site Configuration' />
      <Separator />

      <div
        slot='inputs'
        className='flex flex-col gap-4'
      >
        <div className='grid grid-cols-3 gap-4'>
          <div className='col-span-2 flex flex-col gap-4'>
            {metadataInputs.map((props, index) => (
              <ConfigurationInput<"site", ConfigurationKeys<"site">>
                key={String(props.inputKey)}
                {...props}
              />
            ))}
          </div>
          <div className='flex flex-col gap-4'>
            <div className='flex flex-col'>
              <div className='flex flex-col items-start gap-2 pt-3'>
                <div className='flex select-none items-center gap-2 rounded-t-lg border border-border px-3 py-1.5'>
                  <img
                    src={get.site.favIcon}
                    className='size-4'
                    alt='favicon'
                  />
                  <span className='text-sm'>{get.site.siteName}</span>
                  <Icon
                    name='X'
                    size={"0.75rem"}
                    className='text-muted-foreground'
                  />
                </div>

                <div className='flex select-none items-center gap-2 rounded-t-lg border border-border px-3 py-1.5'>
                  <img
                    src={get.site.favIcon}
                    className='size-4'
                    alt='favicon'
                  />
                  <span className='text-sm'>
                    {get.site.siteNameTemplate!.replace("%s", "Page Title").replace("%t", get.site.siteName)}
                  </span>
                  <Icon
                    name='X'
                    size={"0.75rem"}
                    className='text-muted-foreground'
                  />
                </div>
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
                  {(get.site.siteNameTemplate || "%s").replace("%s", "Page Title").replace("%t", get.site.siteName)}
                </span>
                <span className='text-xs text-muted-foreground'>
                  {get.environment.NEXT_PUBLIC_DOMAIN || "http://localhost:3000"}
                </span>
                <span className='line-clamp-2 text-sm text-muted-foreground'>{get.site.siteDescription}</span>
              </div>
            </div>
          </div>
        </div>

        {inputs.map((props, index) => (
          <ConfigurationInput<"site", ConfigurationKeys<"site">>
            key={String(props.inputKey)}
            {...props}
          />
        ))}
      </div>
    </form>
  );
}
