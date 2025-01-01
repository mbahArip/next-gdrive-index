"use client";

import { icons } from "lucide-react";
import { useMemo } from "react";
import { getting_started, migration, new_user, shared_drive } from "~/data/docs";

import { ConfigurationForm } from "~/components/Guide/Configuration";
import { ThemeForm } from "~/components/Guide/Theme";
import { Icon, Markdown } from "~/components/global";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

import { cn } from "~/lib/utils";

const Sections = ["start", "new-user", "shared-drive", "migrating", "config", "theme"] as const;
type Section = (typeof Sections)[number];
type SectionItem = {
  id: Section;
  title: string;
  icon: keyof typeof icons;
};

export default function DeployGuidePage() {
  const sectionMenu = useMemo<SectionItem[]>(
    () => [
      {
        id: "new-user",
        title: "New User Guide",
        icon: "UserPlus",
      },
      {
        id: "migrating",
        title: "Migrating from v1",
        icon: "GitBranch",
      },
      {
        id: "shared-drive",
        title: "Shared Drive Guide",
        icon: "Database",
      },
    ],
    [],
  );

  return (
    <div className={cn("relative mx-auto w-full max-w-screen-desktop", "gap-4 p-3", "flex-grow-0", "flex flex-col")}>
      <Alert className='bg-blue-50 text-blue-600 dark:bg-blue-950/25 dark:text-blue-500'>
        <div className='flex items-start gap-4'>
          <Icon
            name='Info'
            className='size-5'
          />
          <div className='flex flex-col'>
            <AlertTitle>About this guide</AlertTitle>
            <AlertDescription>
              <p className='w-full whitespace-pre-wrap text-pretty'>{`If you can see this guide on your deployment.
Please set the \`showDeployGuide\` to false on the config files. Since it will take up the \`deploy\` route.`}</p>
            </AlertDescription>
          </div>
        </div>
      </Alert>

      <Card>
        <CardHeader className='pb-0'>
          <CardTitle className='text-3xl'>Deployment Guide</CardTitle>
          <Separator />
        </CardHeader>
        <CardContent>
          <Markdown
            content={getting_started}
            className='px-0'
          />
        </CardContent>
      </Card>

      <Tabs defaultValue='new-user'>
        <TabsList>
          {sectionMenu.map((item) => (
            <TabsTrigger
              key={item.id}
              id={item.id}
              value={item.id}
              className='scroll-m-24'
            >
              {item.title}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value='new-user'>
          <Card>
            <CardHeader className='pb-0'>
              <CardTitle className='text-3xl'>New User Guide</CardTitle>
              <Separator />
            </CardHeader>
            <CardContent>
              <Markdown
                content={new_user}
                className='px-0'
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value='shared-drive'>
          <Card>
            <CardHeader className='pb-0'>
              <CardTitle className='text-3xl'>Shared Drive Guide</CardTitle>
              <Separator />
            </CardHeader>
            <CardContent>
              <Markdown
                content={shared_drive}
                view='markdown'
                className='px-0'
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value='migrating'>
          <Card>
            <CardHeader className='pb-0'>
              <CardTitle className='text-3xl'>Migrating from v1</CardTitle>
              <Separator />
            </CardHeader>
            <CardContent>
              <Markdown
                content={migration}
                className='px-0'
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Separator />

      <Alert className='bg-yellow-50 text-yellow-600 dark:bg-yellow-950 dark:text-yellow-500'>
        <div className='flex items-start gap-4'>
          <Icon
            name='TriangleAlert'
            className='size-5'
          />
          <div className='flex flex-col'>
            <AlertTitle>Heads up!</AlertTitle>
            <AlertDescription>The value of the form will be reset when you switch tabs.</AlertDescription>
          </div>
        </div>
      </Alert>

      <Tabs defaultValue='config'>
        <TabsList>
          <TabsTrigger
            value='config'
            id='config'
            className='scroll-m-24'
          >
            Configuration
          </TabsTrigger>
          <TabsTrigger
            value='theme'
            id='theme'
            className='scroll-m-24'
          >
            Theme Customization
          </TabsTrigger>
        </TabsList>

        <TabsContent value='config'>
          <ConfigurationForm />
        </TabsContent>
        <TabsContent value='theme'>
          <ThemeForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}
