"use client";

import { ChangeEvent, useMemo, useRef, useState } from "react";
import { HslColor, HslColorPicker } from "react-colorful";
import toast from "react-hot-toast";
import { z } from "zod";
import { Schema_Config } from "~/schema";
import { cn } from "~/utils";

import { GenerateAESKey, VerifyAESKey } from "~/app/actions";
import Icon from "~/components/Icon";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";

import config from "~/config/gIndex.config";

export const getting_started = `Welcome to the deployment guide! This guide will help you to deploy the application to Vercel or similar services.

If you are new to this project, you can follow along from the beginning.
But if you've already deployed the app before and want to upgrade from v1, you can skip to the [Migrating from v1](#migrating) section.  
You can also use this guide to [configure the app](#config) and [customize the theme](#theme).  

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

type Environment =
  | "GD_SERVICE_B64"
  | "ENCRYPTION_KEY"
  | "SITE_PASSWORD"
  | "NEXT_PUBLIC_DOMAIN";
type EnvironmentInput = {
  key: Environment;
  title: string;
  description?: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  validation?: (value: string) => void;
  action?: {
    label: string;
    onClick: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  };
};
export function Configuration() {
  const [configuration, setConfiguration] =
    useState<z.input<typeof Schema_Config>>(config);
  const [environment, setEnvironment] = useState<Record<Environment, string>>({
    GD_SERVICE_B64: "",
    ENCRYPTION_KEY: "",
    SITE_PASSWORD: "",
    NEXT_PUBLIC_DOMAIN: "",
  });
  const [btnState, setBtnState] = useState<
    Record<string, "idle" | "loading" | "success">
  >({
    ENCRYPTION_KEY: "idle",
  });
  const [error, setError] = useState<Record<string, string>>({});
  const fileConfigRef = useRef<HTMLInputElement>(null);
  const fileEnvRef = useRef<HTMLInputElement>(null);

  const envInputs = useMemo<EnvironmentInput[]>(
    () => [
      {
        key: "ENCRYPTION_KEY",
        title: "Encryption Key",
        description:
          "The encryption key used to encrypt all the sensitive data, must be 16 characters",
        value: environment.ENCRYPTION_KEY,
        onChange: (e) => {
          setEnvironment((prev) => ({
            ...prev,
            ENCRYPTION_KEY: e.target.value,
          }));
        },
        validation(value) {
          if (!value) return;
          if (value.length !== 16)
            throw new Error("Encryption key must be 16 characters");
        },
        action: {
          label: "Generate",
          onClick: generateEncryption,
        },
      },
    ],
    [environment],
  );

  async function generateEncryption(
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) {
    e.preventDefault();
    setBtnState((prev) => ({ ...prev, ENCRYPTION_KEY: "loading" }));

    try {
      const keyStr = await GenerateAESKey();
      setEnvironment((prev) => ({
        ...prev,
        ENCRYPTION_KEY: keyStr,
      }));
      const valid = await VerifyAESKey("This is a test", keyStr);
      setError((prev) => ({
        ...prev,
        encryption: valid ? "" : "Invalid encryption key",
      }));
    } catch (error) {
      const e = error as Error;
      console.error(error);
      toast.error(e.message);
    } finally {
      setBtnState((prev) => ({ ...prev, ENCRYPTION_KEY: "idle" }));
    }
  }

  return (
    <Card>
      <CardHeader className='pb-0'>
        <div className='flex w-full items-center justify-between gap-3'>
          <CardTitle
            className='text-3xl'
            id='config'
          >
            App Configuration
          </CardTitle>
          <input
            ref={fileConfigRef}
            type='file'
            hidden
            accept='.ts'
            onChange={(e) => {
              const selectedFile = e.target.files?.[0];
              const expectedFileName = "gindex.config.ts";
              if (selectedFile?.name !== expectedFileName) {
                toast.error(
                  `Invalid file, expected ${expectedFileName} but got ${selectedFile?.name}`,
                );
                e.target.value = "";
                return;
              }
            }}
          />
          <input
            ref={fileEnvRef}
            type='file'
            hidden
            accept='.env, .env.local, .env.development, .env.production'
            onChange={(e) => {
              const selectedFile = e.target.files?.[0];
            }}
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size={"sm"}
                variant={"outline"}
              >
                Load Config
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem asChild>
                <div
                  className='flex w-full items-center justify-between gap-6'
                  onClick={() => fileConfigRef.current?.click()}
                >
                  Load config file
                  <Icon
                    name={"Upload"}
                    size={"1rem"}
                  />
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <div
                  className='flex w-full items-center justify-between gap-6'
                  onClick={() => fileEnvRef.current?.click()}
                >
                  Load environment file
                  <Icon
                    name={"Upload"}
                    size={"1rem"}
                  />
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Separator />
      </CardHeader>
      <CardContent>
        <form className='flex w-full flex-col gap-3 py-3'>
          <h4>Environment Config</h4>
          <Separator />
          <div
            slot='Inputs'
            className='flex flex-col gap-3'
          >
            {envInputs.map((input) => (
              <div
                key={`input-${input}`}
                className='flex flex-col gap-1.5'
              >
                <div
                  slot='input-label'
                  className='flex h-fit items-center gap-1.5'
                >
                  <Label htmlFor={input.key}>{input.title}</Label>
                  {input.description && (
                    <Tooltip>
                      <TooltipTrigger>
                        <Icon
                          name={"Info"}
                          size={"1rem"}
                          className='text-muted-foreground'
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{input.description}</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
                <div
                  slot='input-value'
                  className='col-span-3 flex w-full flex-col gap-1.5'
                >
                  <div className='flex w-full gap-1.5'>
                    <Input
                      id={input.key}
                      name={input.key}
                      value={input.value}
                      onChange={(e) => {
                        input.validation?.(e.target.value);
                        input.onChange(e);
                      }}
                      onBlur={async () => {
                        try {
                          setError((prev) => ({
                            ...prev,
                            [input.key]: "",
                          }));
                          if (!input.value) return;
                          input.validation?.(input.value);
                        } catch (error) {
                          const e = error as Error;
                          setError((prev) => ({
                            ...prev,
                            [input.key]: e.message,
                          }));
                        }
                      }}
                    />
                    {input.action && (
                      <Button
                        variant={"secondary"}
                        onClick={input.action.onClick}
                        disabled={btnState[input.key] === "loading"}
                      >
                        <div className='relative flex w-full items-center'>
                          <span
                            className={cn(
                              "relative transition-all duration-300 ease-in-out",
                            )}
                          >
                            {input.action.label}
                          </span>
                          <Icon
                            name={"LoaderCircle"}
                            className={cn(
                              "animate-spin transition-all",
                              btnState[input.key] === "loading"
                                ? "ml-1.5 size-4 opacity-100"
                                : "ml-0 size-0 opacity-0",
                            )}
                          />
                        </div>
                      </Button>
                    )}
                  </div>
                  <span
                    className={cn(
                      "block text-sm text-destructive",
                      error[input.key]
                        ? "opacity-100"
                        : "select-none opacity-0",
                    )}
                  >
                    {error[input.key]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export function CustomizeTheme() {
  const ColorLabel = ({
    label,
    value,
    onChange,
  }: {
    label: string;
    value: HslColor;
    onChange: (newColor: HslColor) => void;
  }) => {
    return (
      <div className='flex items-center gap-3'>
        <span>{label}:</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className='cursor-pointer rounded-sm border border-border bg-foreground p-0.5'>
              <div
                className={`size-4`}
                style={{
                  backgroundColor: `hsl(${value.h}, ${value.s}%, ${value.l}%)`,
                }}
              />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <HslColorPicker
              color={value}
              onChange={onChange}
            />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  };

  const [colors, setColors] = useState({
    primary: { h: 200, s: 50, l: 50 },
    secondary: { h: 200, s: 50, l: 50 },
  });

  return (
    <Card>
      <CardHeader className='pb-0'>
        <CardTitle
          className='text-3xl'
          id='theme'
        >
          Customize Theme
        </CardTitle>
        <Separator />
      </CardHeader>
      <CardContent>
        <Button>Not Preview</Button>
        <div className='preview select-none'>
          <Button>Button</Button>
        </div>
        <ColorLabel
          label='Primary'
          value={{ h: 200, s: 50, l: 50 }}
          onChange={(e) => {
            setColors((prev) => ({ ...prev, primary: e }));
          }}
        />
      </CardContent>
    </Card>
  );
}
