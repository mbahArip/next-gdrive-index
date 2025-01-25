"use client";

/**
 * Based from Credenza
 * https://github.com/redpangilinan/credenza
 */
import * as React from "react";

import { useResponsive } from "~/context/responsiveContext";
import useLoading from "~/hooks/useLoading";
import { cn } from "~/lib/utils";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./drawer";

interface ResponsiveDialogRootProps extends React.PropsWithChildren {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  modal?: boolean;
}
interface ResponsiveDialogProps extends React.PropsWithChildren {
  asChild?: true;
  className?: string;
}
interface ResponsiveDialogBodyProps extends React.PropsWithChildren, React.HTMLAttributes<HTMLDivElement> {
  asChild?: true;
}

const ResponsiveDialog = (props: ResponsiveDialogRootProps) => {
  const { ...rest } = props;
  const { isDesktop } = useResponsive();
  const Component = React.useMemo(() => (isDesktop ? Dialog : Drawer), [isDesktop]);
  return <Component {...rest} />;
};

const ResponsiveDialogTrigger = (props: ResponsiveDialogProps) => {
  const { ...rest } = props;
  const { isDesktop } = useResponsive();
  const Component = React.useMemo(() => (isDesktop ? DialogTrigger : DrawerTrigger), [isDesktop]);

  return <Component {...rest} />;
};

const ResponsiveDialogClose = (props: ResponsiveDialogProps) => {
  const { ...rest } = props;
  const { isDesktop } = useResponsive();
  const loading = useLoading();
  const Component = React.useMemo(() => (isDesktop ? DialogClose : DrawerClose), [isDesktop]);

  if (loading) return null;
  return <Component {...rest} />;
};

const ResponsiveDialogContent = (props: ResponsiveDialogBodyProps) => {
  const { ...rest } = props;
  const { isDesktop } = useResponsive();
  const Component = React.useMemo(() => (isDesktop ? DialogContent : DrawerContent), [isDesktop]);

  return (
    <Component
      aria-describedby={undefined}
      {...rest}
    />
  );
};

const ResponsiveDialogHeader = (
  props: ResponsiveDialogProps & {
    align?: "start" | "center" | "end";
  },
) => {
  const { align = "start", className, ...rest } = props;
  const { isDesktop } = useResponsive();
  const Component = React.useMemo(() => (isDesktop ? DialogHeader : DrawerHeader), [isDesktop]);

  return (
    <Component
      className={cn(
        align === "center" && "text-center",
        align === "start" && "text-start",
        align === "end" && "text-end",
        className,
      )}
      {...rest}
    />
  );
};

const ResponsiveDialogTitle = (props: ResponsiveDialogProps) => {
  const { ...rest } = props;
  const { isDesktop } = useResponsive();
  const Component = React.useMemo(() => (isDesktop ? DialogTitle : DrawerTitle), [isDesktop]);

  return <Component {...rest} />;
};

const ResponsiveDialogDescription = (props: ResponsiveDialogProps) => {
  const { ...rest } = props;
  const { isDesktop } = useResponsive();
  const loading = useLoading();
  const Component = React.useMemo(() => (isDesktop ? DialogDescription : DrawerDescription), [isDesktop]);

  if (loading) return null;
  return <Component {...rest} />;
};

const ResponsiveDialogBody = (props: ResponsiveDialogBodyProps) => {
  const { className, ...rest } = props;

  return (
    <div
      className={cn("px-4 md:px-0", className)}
      {...rest}
    />
  );
};

const ResponsiveDialogFooter = (props: ResponsiveDialogProps) => {
  const { ...rest } = props;
  const { isDesktop } = useResponsive();
  const loading = useLoading();
  const Component = React.useMemo(() => (isDesktop ? DialogFooter : DrawerFooter), [isDesktop]);

  if (loading) return null;
  return <Component {...rest} />;
};

export {
  ResponsiveDialog,
  ResponsiveDialogBody,
  ResponsiveDialogClose,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogTrigger,
};
