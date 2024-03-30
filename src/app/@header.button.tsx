"use client";

import { PropsWithChildren, useContext } from "react";
import Icon from "~/components/Icon";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Skeleton } from "~/components/ui/skeleton";
import { LayoutContext, TLayout } from "~/context/layoutContext";
import { cn } from "~/utils";

export default function HeaderButton({
  children,
  loading,
}: PropsWithChildren<{ loading?: boolean }>) {
  const { layout, setLayout } = useContext(LayoutContext);

  if (loading) {
    return (
      <div className={cn("w-full", "flex items-center justify-end gap-1.5")}>
        <Skeleton className='my-0.5 h-8 w-16 tablet:w-24' />{" "}
        <Skeleton className='my-0.5 h-8 w-8' />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "mx-auto max-w-screen-desktop flex-grow",
        "flex items-center justify-end gap-1.5",
      )}
    >
      <Select
        value={layout}
        onValueChange={(value) => setLayout(value as TLayout)}
      >
        <SelectTrigger className='w-16 tablet:w-24'>
          <SelectValue placeholder={"Layout"}>
            <div className='flex items-center gap-1.5'>
              <Icon
                name={layout === "grid" ? "LayoutGrid" : "LayoutList"}
                size={16}
              />
              <span className={cn("hidden", "tablet:block")}>
                {layout === "grid" ? "Grid" : "List"}
              </span>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent align='end'>
          <SelectItem value='grid'>Grid</SelectItem>
          <SelectItem value='list'>List</SelectItem>
        </SelectContent>
      </Select>
      <Dialog>
        <DialogTrigger asChild>
          <Button
            size={"icon"}
            variant={"outline"}
            className='flex items-center'
          >
            <Icon
              name='Search'
              size={16}
            />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Search</DialogTitle>
            <DialogDescription>
              Search for files in your drive
            </DialogDescription>
          </DialogHeader>
          <div className='flex flex-col'>
            <Input placeholder='Input your query...' />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
