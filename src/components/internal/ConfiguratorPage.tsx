"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { type PropsWithChildren, useState } from "react";
import { type FieldPath, type UseFormReturn, useForm } from "react-hook-form";
import { toast } from "sonner";
import { type z } from "zod";

import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button, LoadingButton } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Form } from "~/components/ui/form";
import { Separator } from "~/components/ui/separator";

import { type PickFileResponse, initialConfiguration, pickFile, versionExpectMap } from "~/lib/configurationHelper";

import { type ConfigurationCategory, Schema_App_Configuration } from "~/types/schema";

import { GenerateConfiguration, ProcessConfiguration, ProcessEnvironmentConfig } from "~/actions/configuration";

import {
  APIConfigurator as ApiForm,
  EnvironmentConfigurator as EnvironmentForm,
  SiteConfigurator as SiteForm,
} from ".";

export default function ConfiguratorPage() {
  const [isLoadingEnv, setIsLoadingEnv] = useState<boolean>(false);
  const [isLoadingConfig, setIsLoadingConfig] = useState<boolean>(false);
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
    toast.success("Form reverted to initial state");
  }
  async function onFormSubmit(values: z.infer<typeof Schema_App_Configuration>) {
    const id = `download-${Date.now()}`;
    toast.loading("Generating configuration...", {
      id,
      duration: 0,
    });

    const data = await GenerateConfiguration(values);
    if (!data.success) {
      toast.error(data.message, {
        id,
        description: data.error,
      });
      return;
    }

    const url = URL.createObjectURL(data.data.zip);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${Date.now()}-gIndex.config.zip`;
    a.click();

    URL.revokeObjectURL(url);
    a.remove();

    toast.success("Configuration generated", {
      id,
    });
  }

  async function onLoadEnv(response: PickFileResponse) {
    const id = `env-latest-${Date.now()}`;
    toast.loading("Waiting for file...", {
      id,
      duration: 0,
    });
    if (!response.success) {
      toast.error(response.message, {
        id,
        description: response.details.length ? (
          <pre className='w-full overflow-auto whitespace-pre-wrap font-mono text-xs'>
            {response.details.join("\n")}
          </pre>
        ) : undefined,
      });
      setIsLoadingEnv(false);

      return;
    }

    toast.loading("Processing environment file...", {
      id,
      duration: 0,
    });
    const data = await ProcessEnvironmentConfig(response.data);
    if (!data.success) {
      toast.error(data.message, {
        id,
        description: <pre className='w-full overflow-auto whitespace-pre-wrap font-mono text-xs'>{data.error}</pre>,
      });
      setIsLoadingEnv(false);
      return;
    }

    form.setValue("environment", data.data);

    toast.success(data.message, {
      id,
    });
    setIsLoadingEnv(false);
  }
  async function onLoadConfig(response: PickFileResponse) {
    const id = `config-${Date.now()}`;
    toast.loading("Waiting for file...", {
      id,
      duration: 0,
    });
    if (!response.success) {
      toast.error(response.message, {
        id,
        description: response.details.length ? (
          <pre className='w-full overflow-auto whitespace-pre-wrap font-mono text-xs'>
            {response.details.join("\n")}
          </pre>
        ) : undefined,
      });
      setIsLoadingConfig(false);

      return;
    }

    const loadedVersion = /version:\s*["']?(\d+\.\d+\.\d+)["']?/.exec(response.data)?.[1];
    if (!loadedVersion) {
      toast.error("Version not found in configuration file", {
        id,
      });
      setIsLoadingConfig(false);
      return;
    }

    const versionGroup = Object.entries(versionExpectMap).find(([_, v]) => v.includes(loadedVersion))?.[0];
    if (!versionGroup) {
      toast.error("Version not recognized", {
        id,
        description: (
          <pre className='w-full overflow-auto whitespace-pre-wrap font-mono text-xs'>
            {`Loaded version: ${loadedVersion}, not matching any known version`}
          </pre>
        ),
      });
      setIsLoadingConfig(false);
      return;
    }

    toast.loading(`Version ${loadedVersion} detected, processing...`, {
      id,
      duration: 0,
    });
    const data = await ProcessConfiguration(response.data, versionGroup as "v1" | "v2" | "latest");
    if (!data.success) {
      toast.error(data.message, {
        id,
        description: <pre className='w-full overflow-auto whitespace-pre-wrap font-mono text-xs'>{data.error}</pre>,
      });
      setIsLoadingConfig(false);
      return;
    }

    form.setValue("api", data.data.api);
    form.setValue("site", data.data.site);
    form.setValue("site.navbarItems", data.data.site.navbarItems);
    form.setValue("site.supports", data.data.site.supports);
    form.setValue("site.footer", data.data.site.footer);

    toast.success(data.message, {
      id,
    });
    setIsLoadingConfig(false);
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
            className='text-balance text-sm font-medium text-blue-600 opacity-80 transition-all duration-300 hover:opacity-100 dark:text-blue-400'
          >
            themes.fkaya.dev
          </Link>
          ,{" "}
          <Link
            href={"https://themeshadcn.com/"}
            target='_blank'
            rel='noopener noreferrer'
            className='text-balance text-sm font-medium text-blue-600 opacity-80 transition-all duration-300 hover:opacity-100 dark:text-blue-400'
          >
            themeshadcn.com
          </Link>{" "}
          or{" "}
          <Link
            href={"https://ui.jln.dev/"}
            target='_blank'
            rel='noopener noreferrer'
            className='text-balance text-sm font-medium text-blue-600 opacity-80 transition-all duration-300 hover:opacity-100 dark:text-blue-400'
          >
            ui.jln.dev
          </Link>{" "}
          to generate theme configuration.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader className='flex w-full flex-col gap-4 tablet:flex-row tablet:items-center tablet:justify-between'>
          <div className='flex grow flex-col space-y-1.5'>
            <CardTitle>Configurator</CardTitle>
            <CardDescription>Generate configurator for your index.</CardDescription>
          </div>
          <div className='flex flex-col items-center gap-2 tablet:flex-row-reverse'>
            <LoadingButton
              loading={isLoadingConfig}
              className='w-full tablet:w-fit'
              onClick={() => {
                setIsLoadingConfig(true);

                pickFile({
                  accept: ".ts",
                  async onLoad(response) {
                    await onLoadConfig(response);
                  },
                });
              }}
            >
              Load Config
            </LoadingButton>
            <LoadingButton
              loading={isLoadingEnv}
              className='w-full tablet:w-fit'
              onClick={() => {
                setIsLoadingEnv(true);

                pickFile({
                  accept: ".env",
                  async onLoad(response) {
                    await onLoadEnv(response);
                  },
                });
              }}
            >
              Load Env
            </LoadingButton>
            <Button
              className='w-full tablet:w-fit'
              variant={"destructive"}
              onClick={() => onReset("all")}
            >
              Reset All
            </Button>
          </div>
        </CardHeader>
        <Separator className='mb-6' />
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onFormSubmit)}
            className='grid grid-cols-1'
          >
            <CardContent className='grid grid-cols-1 gap-8'>
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
            </CardContent>
            <CardFooter>
              <LoadingButton
                size={"lg"}
                loading={form.formState.isSubmitting}
                disabled={!form.formState.isValid || !form.formState.isDirty}
                type='submit'
                className='w-full'
              >
                Generate Configuration
              </LoadingButton>
            </CardFooter>
          </form>
        </Form>
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
