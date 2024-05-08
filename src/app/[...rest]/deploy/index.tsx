"use client";

import { icons } from "lucide-react";
import { useMemo, useState } from "react";
import { z } from "zod";
import { cn } from "~/utils";

import Markdown from "~/app/@markdown";
import Icon from "~/components/Icon";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Separator } from "~/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

import useMediaQuery from "~/hooks/useMediaQuery";

import {
  Configuration,
  CustomizeTheme,
  getting_started,
  migration_guide,
  new_user_guide,
  shared_drive_guide,
} from "./docs";

// type Section =
//   | "start"
//   | "new-user"
//   | "shared-drive"
//   | "migrating"
//   | "config"
//   | "theme";
const SchemaSection = z.enum([
  "start",
  "new-user",
  "shared-drive",
  "migrating",
  "config",
  "theme",
]);
type Section = z.infer<typeof SchemaSection>;
type SectionItem = {
  id: Section;
  title: string;
  icon: keyof typeof icons;
};
export default function DeployGuidePage() {
  const sectionMenu = useMemo<SectionItem[]>(
    () => [
      // {
      //   id: "start",
      //   title: "Getting Started",
      //   icon: "NotebookText",
      // },
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
      // {
      //   id: "config",
      //   title: "App Configuration",
      //   icon: "Settings",
      // },
      // {
      //   id: "theme",
      //   title: "Theme Customization",
      //   icon: "PaintRoller",
      // },
    ],
    [],
  );
  const [sectionOpen, setSectionOpen] = useState<boolean>(false);

  const isDesktop = useMediaQuery("(min-width: 768px)");

  return (
    <div
      className={cn(
        "relative mx-auto w-full max-w-screen-desktop",
        "gap-3 p-3",
        "flex-grow-0",
        "flex flex-col",
      )}
    >
      <div className='fixed bottom-6 right-6 z-10'>
        <Button
          size='icon'
          variant='outline'
          onClick={() => {
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          <Icon
            name='ChevronUp'
            size='1.25rem'
          />
        </Button>
      </div>
      <div
        id='fab'
        className={cn("bottom-6 right-6 z-10 hidden")}
      >
        <DropdownMenu
          open={sectionOpen}
          onOpenChange={setSectionOpen}
        >
          <DropdownMenuTrigger asChild>
            <Button
              size={"icon"}
              variant={"outline"}
            >
              <Icon
                name='SquareMenu'
                size={"1.25rem"}
              />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align='end'
            side='left'
          >
            {sectionMenu.map((item) => (
              <DropdownMenuItem
                key={item.id}
                asChild
              >
                <div
                  // href={`#${item.id}`}
                  className='flex w-full items-center justify-between gap-6'
                  onClick={() => {
                    const target = document.getElementById(item.id);
                    if (target) {
                      target.scrollIntoView({ behavior: "smooth" });
                    }
                  }}
                >
                  {item.title}
                  <Icon
                    name={item.icon}
                    size={"1rem"}
                  />
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Card>
        <CardHeader className='pb-0'>
          <CardTitle className='text-3xl'>Deployment Guide</CardTitle>
          <Separator />
        </CardHeader>
        <CardContent>
          <Markdown
            content={getting_started}
            view='markdown'
            className='px-0'
          />

          <Alert className='bg-blue-50 text-blue-600 dark:bg-blue-950/25 dark:text-blue-500'>
            <div className='flex items-start gap-3'>
              <Icon
                name='Info'
                className='size-5'
              />
              <div className='flex flex-col'>
                <AlertTitle>About this guide</AlertTitle>
                <AlertDescription>
                  <p className='w-full whitespace-pre-wrap text-pretty'>{`If you're from previous version, your deployment might have this deployment guide.
You can disable it from the config files, there a new setting called 'showDeployGuide' you need to set to false.`}</p>
                </AlertDescription>
              </div>
            </div>
          </Alert>
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
        {/* <TabsContent value='start'>
          <Card>
            <CardHeader className='pb-0'>
              <CardTitle className='text-3xl'>Deployment Guide</CardTitle>
              <Separator />
            </CardHeader>
            <CardContent>
              <Markdown
                content={getting_started}
                view='markdown'
                className='px-0'
              />
            </CardContent>
          </Card>
        </TabsContent> */}
        <TabsContent value='new-user'>
          <Card>
            <CardHeader className='pb-0'>
              <CardTitle className='text-3xl'>New User Guide</CardTitle>
              <Separator />
            </CardHeader>
            <CardContent>
              <Markdown
                content={new_user_guide}
                view='markdown'
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
                content={shared_drive_guide}
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
                content={migration_guide}
                view='markdown'
                className='px-0'
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Separator />

      <Alert className='bg-yellow-50 text-yellow-600 dark:bg-yellow-950 dark:text-yellow-500'>
        <div className='flex items-start gap-3'>
          <Icon
            name='TriangleAlert'
            className='size-5'
          />
          <div className='flex flex-col'>
            <AlertTitle>Heads up!</AlertTitle>
            <AlertDescription>
              The value of the form will be reset when you switch tabs.
            </AlertDescription>
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
          <Configuration />
        </TabsContent>
        <TabsContent value='theme'>
          <CustomizeTheme />
        </TabsContent>
      </Tabs>
    </div>
  );
}
