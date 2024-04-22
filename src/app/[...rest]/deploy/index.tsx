"use client";

import { icons } from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "~/utils";

import Markdown from "~/app/@markdown";
import Icon from "~/components/Icon";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Separator } from "~/components/ui/separator";

import useMediaQuery from "~/hooks/useMediaQuery";

import {
  Configuration,
  CustomizeTheme,
  getting_started,
  migration_guide,
  new_user_guide,
} from "./docs";

type Section = "start" | "new-user" | "migrating" | "config" | "theme";
type SectionItem = {
  id: Section;
  title: string;
  icon: keyof typeof icons;
};
export default function DeployGuidePage() {
  const sectionMenu = useMemo<SectionItem[]>(
    () => [
      {
        id: "start",
        title: "Top of page",
        icon: "ChevronUp",
      },
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
        id: "config",
        title: "App Configuration",
        icon: "Settings",
      },
      {
        id: "theme",
        title: "Theme Customization",
        icon: "PaintRoller",
      },
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
      <div
        id='fab'
        className={cn("fixed bottom-6 right-6 z-10")}
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
        {/* {isDesktop ? (
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
                  <Button
                    variant={"ghost"}
                    asChild
                    className='w-full'
                  >
                    <Link
                      href={`#${item.id}`}
                      className='flex w-full items-center justify-between gap-6'
                    >
                      {item.title}
                      <Icon
                        name={item.icon}
                        size={"1rem"}
                      />
                    </Link>
                  </Button>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Drawer
            open={sectionOpen}
            onOpenChange={setSectionOpen}
          >
            <DrawerTrigger asChild>
              <Button
                size={"icon"}
                variant={"outline"}
              >
                <Icon
                  name='SquareMenu'
                  size={"1.25rem"}
                />
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader className='text-left'>
                <DrawerTitle>Sections</DrawerTitle>
                <DrawerDescription>Jump to a section</DrawerDescription>
              </DrawerHeader>

              <div className='grid gap-1.5 px-4'>
                {sectionMenu.map((item) => (
                  <DrawerClose
                    asChild
                    key={item.id}
                  >
                    <Button
                      variant='ghost'
                      className='w-full'
                      asChild
                    >
                      <Link
                        href={`#${item.id}`}
                        className='flex w-full items-center justify-between gap-6'
                      >
                        {item.title}
                        <Icon
                          name={item.icon}
                          size='1rem'
                        />
                      </Link>
                    </Button>
                  </DrawerClose>
                ))}
              </div>

              <DrawerFooter>
                <DrawerClose asChild>
                  <Button variant='secondary'>Close</Button>
                </DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        )} */}
      </div>

      <Card>
        <CardHeader className='pb-0'>
          <CardTitle
            className='text-3xl'
            id='start'
          >
            Deployment Guide
          </CardTitle>
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

      <Card>
        <CardHeader className='pb-0'>
          <CardTitle
            className='text-3xl'
            id='new-user'
          >
            New User Guide
          </CardTitle>
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

      <Card>
        <CardHeader className='pb-0'>
          <CardTitle
            className='text-3xl'
            id='migrating'
          >
            Migrating from v1
          </CardTitle>
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

      <Separator className='my-6' />

      <Configuration />

      <CustomizeTheme />
    </div>
  );
}
