"use client";

import { AsyncZippable, strToU8, zip } from "fflate";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { generateConfig } from "~/data/template";

import { ConfigAPI, ConfigEnvironment, ConfigSite } from "~/components/Guide/Configuration";
import { Icon, Markdown } from "~/components/global";
import { PageLoader as Loader } from "~/components/layout";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button, LoadingButton } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

import useLoading from "~/hooks/useLoading";
import { downloadBlob } from "~/utils/downloadBlob";

import { ConfigurationCategory, ConfigurationKeys, ConfigurationValue, Schema_App_Configuration } from "~/types/schema";

import config from "config";

export default function ConfigurationForm() {
  const loading = useLoading();
  const initialConfiguration = useMemo<z.input<typeof Schema_App_Configuration>>(() => {
    return {
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
        footer: ["{{ siteName }} *v{{ version }}* @ {{ repository }}", "{{ year }} - Made with ❤️ by **{{ author }}**"],

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
  }, []);
  const [configuration, setConfiguration] = useState<z.input<typeof Schema_App_Configuration>>(initialConfiguration);
  const [error, setError] = useState<Schema_App_Configuration_Error>({
    environment: {},
    api: {},
    site: {},
  });

  const [isDownloading, setDownloading] = useState<boolean>(false);

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
  function onErrorChange<
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

  function onReset(category: ConfigurationCategory | "all") {
    if (category === "all") {
      setConfiguration(initialConfiguration);
      setError({
        environment: {},
        api: {},
        site: {},
      });
    } else {
      setConfiguration((prev) => ({
        ...prev,
        [category]: initialConfiguration[category],
      }));
      setError((prev) => ({
        ...prev,
        [category]: {},
      }));
    }
  }
  async function onDownload(e: React.MouseEvent) {
    e.preventDefault();
    setDownloading(true);
    toast.loading("Generating configuration file...", {
      id: "generate-config",
    });

    try {
      // Check required fields
      const requiredEmpty = [
        !configuration.environment.ENCRYPTION_KEY.length, // Encryption Key are required
        !configuration.environment.GD_SERVICE_B64.length, // Service Account are required
        !configuration.api.rootFolder.length, // Root Folder are required
        configuration.api.isTeamDrive && !configuration.api.sharedDrive?.length, // If isTeamDrive, sharedDrive are required
        !configuration.site.siteName.length, // Site Name are required
        !configuration.site.siteDescription.length, // Site Description are required
        configuration.site.privateIndex && !configuration.environment.SITE_PASSWORD?.length, // If privateIndex, SITE_PASSWORD are required
      ];
      if (requiredEmpty.filter((v) => v).length) {
        throw new Error("Looks like you missed some required fields.");
      }

      const errors = [];
      for (const err of Object.values(error.environment)) {
        if (err) errors.push(err);
      }
      for (const err of Object.values(error.api)) {
        if (err) errors.push(err);
      }
      for (const err of Object.values(error.site)) {
        if (err) errors.push(err);
      }
      if (errors.length) {
        throw new Error("Errors found in the configuration form. Please fix them first");
      }

      // Create string content
      const envContent = Object.entries(configuration.environment)
        .map(([key, value]) => `${key}=${value}`)
        .join("\n");
      const configContent = await generateConfig(configuration);

      // Create zip structure
      const structure: AsyncZippable = {
        ".env": [
          strToU8(envContent),
          {
            level: 6,
          },
        ],
        "gIndex.config.ts": [
          strToU8(configContent),
          {
            level: 6,
          },
        ],
      };

      zip(structure, {}, (err, data) => {
        if (err) throw err;

        const zipBlob = new Blob([data], { type: "application/zip" });
        downloadBlob(zipBlob, `${Date.now()}__gIndex-config.zip`);
        toast.success("Configuration file generated successfully", {
          id: "generate-config",
        });
      });
    } catch (error) {
      const e = error as Error;
      console.error(e);
      toast.error(e.message, {
        id: "generate-config",
      });
    } finally {
      setDownloading(false);
    }
  }

  if (loading)
    return (
      <Card>
        <CardContent>
          <Loader message='Loading configuration...' />
        </CardContent>
      </Card>
    );

  return (
    <Card>
      <CardHeader className='pb-0'>
        <div className='flex items-end justify-between gap-4'>
          <CardTitle id='config'>App Configuration</CardTitle>
          <small className='text-muted-foreground'>v{config.version}</small>
        </div>
      </CardHeader>

      <CardContent className='space-y-3 py-3'>
        <Markdown
          content={`This configuration only covering the most basic things you need to get started.
You can check the configuration file itself to see all the available configuration. _(Each configuration has a description to help you understand it)_
If you're migrating from previous version, you can load your old environment and config file to update the configuration.

> If you found any bugs or issues with this configuration, please report it to the [issue tracker](https://github.com/mbahArip/next-gdrive-index/issues)
> I'll try to fix it as soon as possible`}
        />

        <ConfigEnvironment
          state={{
            get: configuration,
            set: onConfigurationChange,
          }}
          error={{
            get: error.environment,
            set: (key, value) => onErrorChange("environment", key, value),
          }}
          onReset={onReset}
        />

        <ConfigAPI
          state={{
            get: configuration,
            set: onConfigurationChange,
          }}
          error={{
            get: error.api,
            set: (key, value) => onErrorChange("api", key, value),
          }}
          onReset={onReset}
        />

        <ConfigSite
          state={{
            get: configuration,
            set: onConfigurationChange,
          }}
          error={{
            get: error.site,
            set: (key, value) => onErrorChange("site", key, value),
          }}
          onReset={onReset}
        />

        <Alert
          variant={"destructive"}
          className='bg-destructive text-destructive-foreground'
        >
          <AlertTitle>
            <h4>Configuration Issue</h4>
          </AlertTitle>
          <AlertDescription className='flex flex-col gap-2'>
            <p className='w-full whitespace-pre-wrap text-pretty py-1.5'>{`After some report, it seems that the config will generate incorrect encrypted ID, and somehow it only happen on deployment.
I'm sorry for the inconvenience, but you need to re-encrypt the id using the encryption endpoint.
I'll try to fix this issue as soon as possible`}</p>
            <code className='rounded-[var(--radius)] bg-muted px-2 py-1 text-sm text-muted-foreground'>{`https://drive-demo.mbaharip.com/api/internal/encrypt?q=<ID>&key=<ENCRYPTION_KEY>`}</code>
            <code className='rounded-[var(--radius)] bg-muted px-2 py-1 text-sm text-muted-foreground'>{`https://<your-deployment-or-localhost>/api/internal/encrypt?q=<ID>&key=<ENCRYPTION_KEY>`}</code>
            <p className='w-full whitespace-pre-wrap text-pretty'>
              {`Replace <ID> with Root Folder ID and Shared Drive ID (if you use Team Drive) and <ENCRYPTION_KEY> with your Encryption Key from the Environment Configuration section.`}
            </p>
          </AlertDescription>
        </Alert>

        <div className='flex w-full flex-col gap-4 tablet:flex-row tablet:items-center tablet:justify-end'>
          <Button
            variant={"destructive"}
            size={"sm"}
            onClick={(e) => {
              e.preventDefault();
              onReset("all");
            }}
          >
            Reset All
          </Button>
          <LoadingButton
            loading={isDownloading}
            size={"sm"}
            onClick={onDownload}
          >
            <Icon name='Save' />
            Download Config
          </LoadingButton>
        </div>
      </CardContent>
    </Card>
  );
}

type Schema_App_Configuration_Error = {
  environment: Partial<Record<ConfigurationKeys<"environment">, string>>;
  api: Partial<Record<ConfigurationKeys<"api">, string>>;
  site: Partial<Record<ConfigurationKeys<"site">, string>>;
};
