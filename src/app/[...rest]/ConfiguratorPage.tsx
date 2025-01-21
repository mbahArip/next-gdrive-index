"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { type PropsWithChildren, useState } from "react";
import { FieldPath, type UseFormReturn, useForm } from "react-hook-form";
import { toast } from "sonner";
import { type z } from "zod";

import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import {
  ResponsiveDropdownMenu,
  ResponsiveDropdownMenuContent,
  ResponsiveDropdownMenuItem,
  ResponsiveDropdownMenuTrigger,
} from "~/components/ui/dropdown-menu.responsive";
import { Form } from "~/components/ui/form";
import Icon from "~/components/ui/icon";
import { Separator } from "~/components/ui/separator";

import { useResponsive } from "~/context/responsiveContext";

import { type ConfigurationCategory, Schema_App_Configuration } from "~/types/schema";

import ApiForm from "./ConfigurationPage.Api";
import SiteForm from "./ConfigurationPage.Site";
import EnvironmentForm from "./ConfiguratorPage.Environment";

const initialConfiguration: z.input<typeof Schema_App_Configuration> = {
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

export default function ConfiguratorPage() {
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const form = useForm<z.infer<typeof Schema_App_Configuration>>({
    resolver: zodResolver(Schema_App_Configuration),
    defaultValues: initialConfiguration,
  });

  function onReset(category: ConfigurationCategory | "all") {
    if (category === "all") {
      form.reset(initialConfiguration);
    } else {
      form.resetField(category);
    }
  }
  function onFormSubmit(values: z.infer<typeof Schema_App_Configuration>) {
    toast.info("Form submitted", {
      description: <pre className='w-full overflow-auto'>{JSON.stringify(values, null, 2)}</pre>,
    });
  }

  return (
    <>
      <Alert variant={"primary"}>
        <AlertTitle>Theme customization is removed from the configurator.</AlertTitle>
        <AlertDescription>
          You can use website like{" "}
          <Link
            href={"https://themes.fkaya.dev/"}
            target='_blank'
            rel='noopener noreferrer'
            className='text-balance text-sm text-blue-600 opacity-80 transition-all duration-300 hover:opacity-100 dark:text-blue-400'
          >
            themes.fkaya.dev
          </Link>
          ,{" "}
          <Link
            href={"https://themeshadcn.com/"}
            target='_blank'
            rel='noopener noreferrer'
            className='text-balance text-sm text-blue-600 opacity-80 transition-all duration-300 hover:opacity-100 dark:text-blue-400'
          >
            themeshadcn.com
          </Link>{" "}
          or{" "}
          <Link
            href={"https://ui.jln.dev/"}
            target='_blank'
            rel='noopener noreferrer'
            className='text-balance text-sm text-blue-600 opacity-80 transition-all duration-300 hover:opacity-100 dark:text-blue-400'
          >
            ui.jln.dev
          </Link>{" "}
          to generate theme configuration.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Configurator</CardTitle>
          <CardDescription>Generate configurator for your index.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex w-full flex-col items-center gap-2 pb-4 tablet:flex-row-reverse'>
            <ResponsiveDropdownMenu>
              <ResponsiveDropdownMenuTrigger asChild>
                <Button className='w-full tablet:w-fit'>
                  Load Config
                  <Icon name='ChevronsUpDown' />
                </Button>
              </ResponsiveDropdownMenuTrigger>
              <ResponsiveDropdownMenuContent
                header={{
                  title: "Load Config",
                  description: "Load configuration from existing file",
                }}
              >
                <ResponsiveDropdownMenuItem closeOnSelect>v2.4 / latest</ResponsiveDropdownMenuItem>
                <ResponsiveDropdownMenuItem closeOnSelect>v2.3 / below</ResponsiveDropdownMenuItem>
                <ResponsiveDropdownMenuItem closeOnSelect>v1.x / legacy</ResponsiveDropdownMenuItem>
              </ResponsiveDropdownMenuContent>
            </ResponsiveDropdownMenu>
            <ResponsiveDropdownMenu>
              <ResponsiveDropdownMenuTrigger asChild>
                <Button className='w-full tablet:w-fit'>
                  Load Env
                  <Icon name='ChevronsUpDown' />
                </Button>
              </ResponsiveDropdownMenuTrigger>
              <ResponsiveDropdownMenuContent
                header={{
                  title: "Load Env",
                  description: "Load environment variables from existing file",
                }}
              >
                <ResponsiveDropdownMenuItem closeOnSelect>v2.x / latest</ResponsiveDropdownMenuItem>
                <ResponsiveDropdownMenuItem closeOnSelect>v1.x / legacy</ResponsiveDropdownMenuItem>
              </ResponsiveDropdownMenuContent>
            </ResponsiveDropdownMenu>
            <Button
              className='w-full tablet:w-fit'
              variant={"destructive"}
              onClick={() => onReset("all")}
            >
              Reset All
            </Button>
          </div>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onFormSubmit)}
              className='grid grid-cols-1 gap-8 tablet:px-2'
            >
              <EnvironmentForm
                form={form}
                onResetField={(field) => form.resetField(field)}
              />

              <Separator />

              <ApiForm
                form={form}
                onResetField={(field) => form.resetField(field)}
              />

              <Separator />

              <SiteForm
                form={form}
                onResetField={(field) => form.resetField(field)}
              />
            </form>
          </Form>
        </CardContent>
      </Card>
    </>
  );
}

type FormColumnProps = {
  column?: number;
};
export function FormColumn({ column = 2, children }: PropsWithChildren<FormColumnProps>) {
  return (
    <>
      <div
        className='grid grid-cols-1 gap-x-4 gap-y-4 md:grid-cols-[--form-column]'
        style={
          {
            "--form-column": `repeat(${column}, minmax(0, 1fr))`,
          } as React.CSSProperties
        }
      >
        {children}
      </div>
    </>
  );
}

type FormSectionProps = {
  title: string;
  description: string;
};
export function FormSection({ title, description, children }: PropsWithChildren<FormSectionProps>) {
  const { isDesktop } = useResponsive();

  return (
    <div
      id={title
        .toLowerCase()
        .replace(/\s/g, "-")
        .replace(/[^a-z0-9-]/g, "")
        .replace(/-+/g, "-")}
      className='group grid grid-cols-1 gap-4'
    >
      <div className='flex flex-col gap-1.5'>
        <h2 className='text-lg font-semibold'>{title}</h2>
        <p className='text-sm text-muted-foreground'>{description}</p>
      </div>

      {children}
    </div>
  );
}

export type FormProps = {
  form: UseFormReturn<z.infer<typeof Schema_App_Configuration>>;
  onResetField?: (field: FieldPath<z.infer<typeof Schema_App_Configuration>>) => void;
} & Omit<FormSectionProps, "title" | "description">;
