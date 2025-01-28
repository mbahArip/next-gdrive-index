"use client";

import "@vidstack/react/player/styles/base.css";
import "@vidstack/react/player/styles/default/layouts/audio.css";
import "@vidstack/react/player/styles/default/layouts/video.css";
import "@vidstack/react/player/styles/default/theme.css";
import Link from "next/link";
import { Fragment, useState } from "react";
import { type SpecialComponents } from "react-markdown/lib/ast-to-react";
import { type NormalComponents } from "react-markdown/lib/complex-types";

import { Markdown } from "~/components/global";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "~/components/ui/drawer";
import Icon from "~/components/ui/icon";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Separator } from "~/components/ui/separator";

import { useResponsive } from "~/context/responsiveContext";
import { cn } from "~/lib/utils";

export const dynamic = "force-static";

type TocItem = {
  id: string;
  title: string;
  level: number;
};
type GuideSection = "gettingStarted" | "newUser" | "migration" | "sharedDrive";

function generateToc(content: string): TocItem[] {
  const headings = content.match(/#{1,6}.+/g) ?? [];
  const tocItems = headings
    .map((heading) => {
      const match = /(#+)\s(.+)/.exec(heading);
      if (!match) return null;
      if (!match[1] || !match[2]) return null;
      const level = match[1].length;
      const title = match[2] ?? "";
      const id = title.toLowerCase().replace(/[^\w]+/g, "-");
      return { id, title, level };
    })
    .filter((item): item is TocItem => item !== null);

  return tocItems;
}
const content: Readonly<Record<GuideSection, string>> = {
  gettingStarted: `Welcome to the deployment guide! This guide will assist you in deploying the project to Vercel or similar services.

If you are new, you can follow along from the beginning. However, if you have previously deployed the project and wish to upgrade from v1 or v2.x, you can proceed directly to the [Migration Guide](#migration) section.

You can also utilize the [next-gdrive-index configurator](/ngdi-internal/configurator) to generate configuration for your deployment!

This guide assumes that you have a fundamental understanding of how to deploy a Next.js application on Vercel or other platforms.`,
  newUser: `For new user, this guide will provide step-by-step instructions on deploying the project to Vercel or similar services.
Before you begin, you'll need to have the following:

- A Github account
- A Google Cloud Platform account
- A Vercel (or similar service) account
- ~Basic understanding of Next.js and common sense~

---

### Fork and clone the repository

As a first step, you'll need to fork and clone the repository to your GitHub account.

**Forking the repository**
- Click the **Fork** button or [click here](https://github.com/mbaharip/next-gdrive-index/fork)
- Fill in the repository name, and description as you like

**Cloning the repository**
- Click the **Code** button, and copy the repository URL
- Open your terminal, and run the following command:
\`\`\`bash
git clone <repository_url>
\`\`\`

> **Note**
> You can also use **GitHub Codespaces** to edit the project if you prefer not to clone the repository.

---

### Creating Google Cloud Platform project

Before accessing files from Google Drive, you'll need to create a project in **Google Cloud Platform** and enable the **Google Drive API** (covered in the next step).
You can use your Google account to login to Google Cloud Platform.

1. Go to [Google Cloud Platform](https://console.cloud.google.com/) (if it's your first time, you need to accept the terms and conditions before you can proceed)
2. In the center of the page, click on **Create or select project**
3. In the top right corner, click the **New Project** button
4. Enter a desired name for your project, and click the **Create** button
5. A notification confirming project creation will appear, click on the **Select project** button

Congratulations! You've successfully created a project in Google Cloud Platform.
Next we'll enable the Google Drive API to access your Google Drive files.

---

### Enabling Google Drive API

To allow the project to access files stored in your Google Drive, you need to enable the Google Drive API within your Google Cloud Platform project.
You can access your Google Cloud Platform project by selecting the project on the top left corner of the page. Or clicking **Select Project** button on notification after creating the project.

To enable the Google Drive API, follow these steps:

1. Go to **APIs & Services** product, and then select the **Enabled APIs & services** menu
2. Click on the **+ Enable APIs and Services** button at the top of the page
3. Search for "Google Drive API" on the search bar, and select the first result (It should be named **Google Drive API**)
4. Click the **Enable** button and wait for the process to complete

Now that the Google Drive API is enabled, we need to create a service account to obtain the necessary credentials for accessing the API.

---

### Creating service account

Go to the **Credentials** page on the Google Cloud Platform to create a service account (tt can be found on the left sidebar), and follow these steps to create a service account:

1. Click on **Create Credentials** button, and choose **Service account**.
2. Fill the service account name and description as you like, and then click the **Create and continue** button.
3. You can skip both the **Grant this service account access to project** and **Grant users access to this service account** by clicking the **Done** button.
4. You should see the service account you just created on the **Service Account** table, click on the service account name to open the details.
5. Go to the **Keys** tab, and then click the **Add Key** button, choose the **Create new key**, and then pick the key type as **JSON**.
6. A download prompt will appear, save the JSON file on easy-to-find location, and **keep it safe**. We will use it later on the configuration.

> **Note**
> The JSON file contains sensitive information, don't share it with anyone.

---

### Preparing root folder in Google Drive

Since the service account can't access your Root folder, you need to create a new folder as the root folder for the index.
You can either set the folder to public or share it with the service account.

1. Open your [Google Drive](https://drive.google.com/)
2. Click the **New** button, and choose **Folder** to create a new folder, you can name it anything you want
3. Right-click the folder you just created, and choose **Share**
4. Enter the email address of the service account you just created (you can find it on the JSON file, or on the service account details page)
5. To allow download files larger than deployment limit, you need to enable **Link sharing** and set it to **Anyone with the link** (read note below)
6. Copy the folder ID from the URL, it's the part after **/folders/** in the URL (e.g: \`https://drive.google.com/drive/u/0/folders/<folder_id>\`)

Save the folder ID on notepad or somewhere safe, we will use it on the configuration.

> **Note**
> People can't download files larger than the download limit (more information on [configuring section](#configuring-the-project)) if the folder is not set to public.
> I'm still looking for a workaround for this.

---

### Configuring the project

There are 2 ways to configure the project, you can either use configurator or manually edit the configuration file (\`/src/config/gIndex.config.ts\`).
While the configurator is easier, you can only configure the basic settings, so I recommend you to manually edit the configuration file.

#### Using the configurator

1. Open the configurator page [here](/ngdi-internal/configurator)
2. Fill the form with the required information
3. Click the **Generate Config** button to download the configuration file
4. Replace the existing configuration file (\`/src/config/gIndex.config.ts\`) with the downloaded file
5. Save the environment file (\`.env.local\`) to be used on the deployment

> **Important Note**
> Make sure you don't push / upload the environment file to the repository, or share it with anyone.
> Since it contains sensitive information, it should be kept secret.

#### Manually editing the configuration file

First, we need create a environment file to store the sensitive information.
You can either store it temporarily on notepad, or create a new file named \`.env.local\` on the root of the project.
The environment file should contain the following information:

- \`GD_SERVICE_B64\` - Base64 encoded service account JSON file, you can encode it using [base64encode.org](https://www.base64encode.org/)
- \`ENCRYPTION_KEY\` - A secret key to encrypt sensitive information, make sure it's a long random string
- \`SITE_PASSWORD\` - Will be used as the index password if you set **private index** to \`true\` on the configuration file
- \`NEXT_PUBLIC_DOMAIN\` (optional) - Domain without protocol and trailing slash, e.g: \`example.com\`, default to your Vercel deployment domain / url (**If you're not using Vercel, you need to set this**)

> **Important Note**
> Make sure to keep the environment file safe, and don't share it with anyone.
> Since it contains sensitive information, it should be kept secret.

After creating the environment file, you can edit the configuration file (\`/src/config/gIndex.config.ts\`) to configure the project.
Before changing the configuration, you need to replace the \`apiConfig.rootFolder\` with the encrypted value of the folder ID you just copied.
To encrypt the value, you can use the following command:

1. Copy this command to your terminal
\`curl "https://drive-demo.mbaharip.com/api/encrypt?key=<ENCRYPTION_KEY>&data=<FOLDER_ID>"\`
2. Replace the \`<ENCRYPTION_KEY>\` with your encryption key from above, and the \`<FOLDER_ID>\` with the folder ID you copied.
3. Run the command, if it's successful, you should get the \`encryptedValue\` and other information on the response.
4. Make sure \`decryptedValue\` is the same as the folder ID you copied, and \`key\` is the same as the encryption key you used. If it's not, you need to recheck the encryption key and folder ID.
5. Replace the \`apiConfig.rootFolder\` with the \`encryptedValue\` you got from the response.

If you're using **Shared Drive**, please follow the [Shared Drive Guide](#using-shared-drive) before deploying the project.
Now you can change the other configuration as you like, each configuration has a description to help you understand the purpose of the configuration.
Then save the configuration file, and you're ready to deploy the project.

---

### Deploying the project

Before deploying the project, you need to make sure these things:

- No environment file is pushed to the repository
- Root folder ID and Shared Drive ID (if you're using Shared Drive) is encrypted
- \`StreamMaxSize\` is set to the maximum file size you want to stream (To avoid excessive bandwidth usage)
- \`maxFileSize\` is set to your deployment limit (Especially if you're using other platforms than Vercel)

After making sure everything is set, you can follow these steps to deploy the project:
(Note: I'm using Vercel as the deployment platform, but other platforms should be similar)

- Go to your deployment platform dashboard (e.g: [Vercel](https://vercel.com/))
- Click on the **Add** button, then select your \`next-gdrive-index\` repository
- Wait for the build process to finish
- Go to the project settings, and search for the **Environment Variables** section
- Add each environment variable from the environment file to the key fields, and the value to the value fields
- Redeploy the project, and wait for the deployment to finish

For other platforms, it's better to check their documentation on how to deploy Next.js project.
It should be similar to Vercel. (New Project > Select Repository > Wait for build > Add Environment Variables > Redeploy)

---

### Done! 🎉

Congratulations! You've successfully deployed your own instance of **next-gdrive-index**`,
  migration: `If you've deployed the project before and want to upgrade to the latest version, you can follow this guide to migrate the project.

For v1, you need to refork the repository to get the latest changes.
If you're using v2.3 or below, you can click on **Sync fork** to get the latest changes.
But don't forget to backup the configuration file before syncing the repository.

### Migrating from v1

Here are the things you need to change to migrate from v1 to the latest version.

#### Environment file (v1.x)

- \`NEXT_PUBLIC_ENCRYPTION_KEY\` - Change to \`ENCRYPTION_KEY\`
- \`NEXT_PUBLIC_SITE_PASSWORD\` - Change to \`SITE_PASSWORD\`
- \`NEXT_PUBLIC_VERCEL_URL\` - Change to \`NEXT_PUBLIC_DOMAIN\`

#### Configuration file (v1.x)

- \`masterKey\` - Deprecated, please remove this configuration
- \`apiConfig.rootFolder\` - Need to be encrypted, you can read [this section](#manually-editing-the-configuration-file) to encrypt the folder ID
- \`siteConfig.navbarItems\` - You need to change the Icon value, since now the icon using [Lucide Icons](https://lucide.dev)

The other configuration are new, you might want to read each description to understand the purpose of the configuration before changing it.

---

### Migrating from v2.3 or below

For faster migration, you can use [the configurator](/ngdi-internal/configurator) to load your \`.env.local\` and \`gIndex.config.ts\` file, and generate the new configuration file.
It will automatically set the new configuration based on your old configuration.

But if you want to manually change the configuration, you can follow the steps below

#### Environment file (v2.3 or below)

There are no changes on the environment file, you can use the old environment file without any changes.
But if you want, you can change your \`ENCRYPTION_KEY\` to the new one. There are no limitations like the old version.

#### Configuration file (v2.3 or below)

- \`showGuideButton\` - Previously named as \`showDeployGuide\`
- \`apiConfig.rootFolder\` - Need to be encrypted, you can read [this section](#manually-editing-the-configuration-file) to encrypt the folder ID
- \`apiConfig.sharedDrive\` - Need to be encrypted, you can read [this section](#manually-editing-the-configuration-file) to encrypt the shared drive ID
- \`siteConfig.footer\` - Format changed, it is now an array of object with \`value\` instead of array of string. Also add \`{{  poweredBy }}\` template
- \`siteConfig.experimental_pageLoadTime\` - Currently WIP. you need to add this, but it's not used yet
- \`siteConfig.previewSettings.manga\` - Currently only manga preview is available, you can set the max item / size to load on the preview

---

That's it! You've successfully migrated the project to the latest version.`,
  sharedDrive: `It's actually pretty simple to use Shared Drive, here are the steps:

- Open your [Google Drive](https://drive.google.com/)
- On the left sidebar, select **Shared drives**, and then pick the Shared Drive you want to use
- Copy the Shared Drive folder ID from the URL, it's the part after \`/drive/u/0/folders/\` in the URL (e.g: \`https://drive.google.com/drive/u/0/folders/<folder_id>\`) and save it somewhere easy to access (e.g notepad)
- Create a new folder inside the Shared Drive, and share it with the service account email address (you can find it on the JSON file, or on the service account details page)
- Share the folder with **Anyone with the link** to allow download files larger than deployment limit
- Copy the folder ID from the URL, it's the part after \`/folders/\` in the URL (e.g: \`https://drive.google.com/drive/u/0/folders/<folder_id>\` ), and save it somewhere easy to access (e.g notepad)

Now we need to encrypt both the Root folder ID and Shared Drive ID before we can use it on the configuration file.
To encrypt the value, you can use the following command:

1. Copy this command to your terminal
\`curl "https://drive-demo.mbaharip.com/api/encrypt?key=<ENCRYPTION_KEY>&data=<ID>"\`
2. Replace the \`<ENCRYPTION_KEY>\` with your encryption key from above, and the \`<ID>\` with the ID you copied.
3. Run the command, if it's successful, you should get the \`encryptedValue\` and other information on the response.
4. Make sure \`decryptedValue\` is the same as the ID you copied, and \`key\` is the same as the encryption key you used. If it's not, you need to recheck the encryption key and ID.

Do this for both the Root folder ID and Shared Drive ID, and replace the configuration file with the new encrypted value.
And make sure to set \`apiConfig.isTeamDrive\` to \`true\` to use Shared Drive.`,
} as const;

const guide: Readonly<
  Record<
    GuideSection,
    {
      id: string;
      title: string;
      content: string;
      toc: TocItem[];
    }
  >
> = {
  gettingStarted: {
    id: "getting-started",
    title: "Getting started",
    content: content.gettingStarted,
    toc: generateToc(content.gettingStarted),
  },
  newUser: {
    id: "new-user",
    title: "New deployment guide",
    content: content.newUser,
    toc: generateToc(content.newUser),
  },
  migration: {
    id: "migration",
    title: "Migration guide",
    content: content.migration,
    toc: generateToc(content.migration),
  },
  sharedDrive: {
    id: "using-shared-drive",
    title: "Using shared drive",
    content: content.sharedDrive,
    toc: generateToc(content.sharedDrive),
  },
} as const;

const customComponents: Partial<Omit<NormalComponents, keyof SpecialComponents> & SpecialComponents> = {
  h1: ({ className, id, children, ...props }) => (
    <Link
      href={`#${id}`}
      className='group block w-fit !text-card-foreground !opacity-100'
    >
      <h1
        id={id}
        className={cn("inline-flex items-center gap-2 !border-0", className)}
        {...props}
      >
        {children}
        <Icon
          name='Hash'
          className='size-4 stroke-muted-foreground opacity-0 transition group-hover:opacity-100'
        />
      </h1>
    </Link>
  ),
  h2: ({ className, id, children, ...props }) => (
    <Link
      href={`#${id}`}
      className='group block w-fit !text-card-foreground !opacity-100'
    >
      <h2
        id={id}
        className={cn("inline-flex items-center gap-2 !border-0", className)}
        {...props}
      >
        {children}
        <Icon
          name='Hash'
          className='size-4 stroke-muted-foreground opacity-0 transition group-hover:opacity-100'
        />
      </h2>
    </Link>
  ),
  h3: ({ className, id, children, ...props }) => (
    <Link
      href={`#${id}`}
      className='group block w-fit !text-card-foreground !opacity-100'
    >
      <h3
        id={id}
        className={cn("inline-flex items-center gap-2 !border-0", className)}
        {...props}
      >
        {children}
        <Icon
          name='Hash'
          className='size-4 stroke-muted-foreground opacity-0 transition group-hover:opacity-100'
        />
      </h3>
    </Link>
  ),
  h4: ({ className, id, children, ...props }) => (
    <Link
      href={`#${id}`}
      className='group block w-fit !text-card-foreground !opacity-100'
    >
      <h4
        id={id}
        className={cn("inline-flex items-center gap-2 !border-0", className)}
        {...props}
      >
        {children}
        <Icon
          name='Hash'
          className='size-4 stroke-muted-foreground opacity-0 transition group-hover:opacity-100'
        />
      </h4>
    </Link>
  ),
  h5: ({ className, id, children, ...props }) => (
    <Link
      href={`#${id}`}
      className='group block w-fit !text-card-foreground !opacity-100'
    >
      <h5
        id={id}
        className={cn("inline-flex items-center gap-2 !border-0", className)}
        {...props}
      >
        {children}
        <Icon
          name='Hash'
          className='size-4 stroke-muted-foreground opacity-0 transition group-hover:opacity-100'
        />
      </h5>
    </Link>
  ),
  h6: ({ className, id, children, ...props }) => (
    <Link
      href={`#${id}`}
      className='group block w-fit !text-card-foreground !opacity-100'
    >
      <h6
        id={id}
        className={cn("inline-flex items-center gap-2 !border-0", className)}
        {...props}
      >
        {children}
        <Icon
          name='Hash'
          className='size-4 stroke-muted-foreground opacity-0 transition group-hover:opacity-100'
        />
      </h6>
    </Link>
  ),
};

export default function DeployPage() {
  return (
    <>
      <Alert variant={"warning"}>
        <AlertTitle>Heads up!</AlertTitle>
        <AlertDescription>It is recommended to use desktop / laptop to follow along the guide.</AlertDescription>
      </Alert>

      <TableOfContents guide={guide} />

      <Card>
        <CardHeader>
          <Link
            href={`#${guide.gettingStarted.id}`}
            className='group'
          >
            <CardTitle
              id={guide.gettingStarted.id}
              className='inline-flex scroll-m-20 items-center gap-2 text-3xl font-semibold tracking-tight'
            >
              {guide.gettingStarted.title}
              <Icon
                name='Hash'
                className='stroke size-4 stroke-muted-foreground opacity-0 transition group-hover:opacity-100'
              />
            </CardTitle>
          </Link>
        </CardHeader>
        <CardContent className='flex w-full flex-col items-center justify-center gap-2'>
          <Markdown
            className='w-full'
            customComponents={customComponents}
            content={guide.gettingStarted.content}
          />
          {/* <iframe
            src='https://www.youtube-nocookie.com/embed/Wt-w5zWyOlk?si=z6j1Htb_YsaLswGW'
            title='next-gdrive-index deployment guide'
            allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
            referrerPolicy='strict-origin-when-cross-origin'
            className='aspect-video h-full w-full max-w-[640px] rounded-lg'
            allowFullScreen
          ></iframe> */}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Link
            href={`#${guide.newUser.id}`}
            className='group'
          >
            <CardTitle
              id={guide.newUser.id}
              className='inline-flex scroll-m-20 items-center gap-2 text-3xl font-semibold tracking-tight'
            >
              {guide.newUser.title}
              <Icon
                name='Hash'
                className='stroke size-4 stroke-muted-foreground opacity-0 transition group-hover:opacity-100'
              />
            </CardTitle>
          </Link>
        </CardHeader>
        <CardContent className='flex w-full flex-col items-center justify-center gap-2'>
          <Markdown
            className='w-full'
            customComponents={customComponents}
            content={guide.newUser.content}
          />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Link
            href={`#${guide.migration.id}`}
            className='group'
          >
            <CardTitle
              id={guide.migration.id}
              className='inline-flex scroll-m-20 items-center gap-2 text-3xl font-semibold tracking-tight'
            >
              {guide.migration.title}
              <Icon
                name='Hash'
                className='stroke size-4 stroke-muted-foreground opacity-0 transition group-hover:opacity-100'
              />
            </CardTitle>
          </Link>
        </CardHeader>
        <CardContent className='flex w-full flex-col items-center justify-center gap-2'>
          <Markdown
            className='w-full'
            customComponents={customComponents}
            content={guide.migration.content}
          />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Link
            href={`#${guide.sharedDrive.id}`}
            className='group'
          >
            <CardTitle
              id={guide.sharedDrive.id}
              className='inline-flex scroll-m-20 items-center gap-2 text-3xl font-semibold tracking-tight'
            >
              {guide.sharedDrive.title}
              <Icon
                name='Hash'
                className='stroke size-4 stroke-muted-foreground opacity-0 transition group-hover:opacity-100'
              />
            </CardTitle>
          </Link>
        </CardHeader>
        <CardContent className='flex w-full flex-col items-center justify-center gap-2'>
          <Markdown
            className='w-full'
            customComponents={customComponents}
            content={guide.sharedDrive.content}
          />
        </CardContent>
      </Card>
    </>
  );
}

type TableOfContentsProps = {
  guide: Record<GuideSection, { id: string; title: string; content: string; toc: TocItem[] }>;
};
function TableOfContents({ guide }: TableOfContentsProps) {
  const { isDesktop } = useResponsive();
  const [tocShow, setTocShow] = useState<boolean>(false);

  return (
    <>
      {isDesktop ? (
        <div
          className={cn(
            "fixed top-24 z-50 flex items-stretch gap-6 rounded-lg border bg-card p-4 text-card-foreground opacity-100 shadow-md transition-all duration-500 ease-in-out",
            tocShow ? "right-3" : "-right-72",
          )}
        >
          <div
            className='group flex cursor-pointer flex-col items-center gap-4'
            onClick={() => {
              setTocShow((prev) => !prev);
            }}
          >
            <Icon
              name='ChevronsLeft'
              hideWrapper
              className={cn(
                "size-5 transition-all duration-500 ease-in-out group-hover:scale-110",
                tocShow ? "rotate-180" : "rotate-0",
              )}
            />
            <span
              className='font-semibold tracking-wider'
              style={{
                writingMode: "vertical-lr",
              }}
            >
              Table of Contents
            </span>
          </div>
          <ScrollArea className='h-full max-w-64 pr-4'>
            <div className='h-fit max-h-[50dvh] space-y-2'>
              {Object.entries(guide).map(([k, v], index, self) => (
                <Fragment key={k}>
                  <div className='flex flex-col gap-1'>
                    <Link
                      href={`#${v.id}`}
                      className='my-0.5 text-lg text-blue-600 opacity-80 transition-all duration-300 hover:opacity-100 dark:text-blue-400'
                    >
                      {v.title}
                    </Link>
                    {!!v.toc.length && (
                      <div className='flex flex-col gap-1'>
                        {v.toc.map((menu) => (
                          <Link
                            key={menu.id}
                            href={`#${menu.id}`}
                            className='my-0.5 text-blue-600 opacity-80 transition-all duration-300 hover:opacity-100 dark:text-blue-400'
                            style={{
                              marginLeft: `${(menu.level - 2) * 1}rem`,
                            }}
                          >
                            {menu.title}
                          </Link>
                        ))}
                      </div>
                    )}
                    {index !== self.length - 1 && <Separator />}
                  </div>
                </Fragment>
              ))}
            </div>
          </ScrollArea>
        </div>
      ) : (
        <Drawer>
          <DrawerTrigger asChild>
            <div className={cn("fixed bottom-16 right-6 z-50 transition")}>
              <Button
                size={"icon"}
                variant={"outline"}
                className='h-10 w-10 rounded-full p-0 shadow'
              >
                <Icon
                  name='TableOfContents'
                  className='size-6'
                />
              </Button>
            </div>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader className='text-start'>
              <DrawerTitle>Table of Contents</DrawerTitle>
              <DrawerDescription>Jump to the section you want to read</DrawerDescription>
            </DrawerHeader>
            <div className='space-y-2 p-4'>
              {Object.entries(guide).map(([k, v], index, self) => (
                <Fragment key={`mobile-${k}`}>
                  <div className='flex flex-col gap-1'>
                    <DrawerClose asChild>
                      <Link
                        href={`#${v.id}`}
                        className='my-0.5 text-lg text-blue-600 opacity-80 transition-all duration-300 hover:opacity-100 dark:text-blue-400'
                      >
                        {v.title}
                      </Link>
                    </DrawerClose>
                    {!!v.toc.length && (
                      <div className='flex flex-col gap-1'>
                        {v.toc.map((menu) => (
                          <DrawerClose
                            key={`mobile-${menu.id}`}
                            asChild
                          >
                            <Link
                              href={`#${menu.id}`}
                              className='my-0.5 text-blue-600 opacity-80 transition-all duration-300 hover:opacity-100 dark:text-blue-400'
                              style={{
                                marginLeft: `${(menu.level - 2) * 0.75}rem`,
                              }}
                            >
                              {menu.title}
                            </Link>
                          </DrawerClose>
                        ))}
                      </div>
                    )}
                    {index !== self.length - 1 && <Separator />}
                  </div>
                </Fragment>
              ))}
            </div>
            <DrawerFooter>
              <DrawerClose asChild>
                <Button variant={"secondary"}>Close</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      )}
    </>
  );
}
