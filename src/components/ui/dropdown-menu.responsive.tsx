"use client";

/**
 * Only supports DropdownMenuItem
 * Submenu, Radio, Checkbox not supported since not used on this project
 */
import * as React from "react";

import { useResponsive } from "~/context/responsiveContext";
import useLoading from "~/hooks/useLoading";
import { cn } from "~/lib/utils";

import { Button } from "./button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import { Separator } from "./separator";

interface ResponsiveDropdownMenuRootProps extends React.PropsWithChildren {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  modal?: boolean;
}
interface ResponsiveDropdownTriggerProps extends React.PropsWithChildren {
  asChild?: true;
  className?: string;
}
interface ResponsiveDropdownContentProps extends React.PropsWithChildren {
  asChild?: true;
  header?: {
    title: React.ReactNode;
    description?: React.ReactNode;
    titleProps?: React.ComponentPropsWithRef<typeof DrawerTitle>;
    descriptionProps?: React.ComponentPropsWithRef<typeof DrawerDescription>;
    props?: React.ComponentPropsWithRef<typeof DrawerHeader>;
  };
  bodyProps?: React.HTMLAttributes<HTMLDivElement>;
}
interface ResponsiveDropdownMenuItemProps extends React.PropsWithChildren {
  asChild?: true;
  className?: string;
  selected?: boolean;
  onSelect?: () => void;
  closeOnSelect?: boolean;
  disabled?: boolean;
}
interface ResponsiveDropdownSeparatorProps extends React.PropsWithChildren {
  asChild?: true;
  className?: string;
}

const ResponsiveDropdownMenu = (props: ResponsiveDropdownMenuRootProps) => {
  const { ...rest } = props;
  const { isDesktop } = useResponsive();
  const Component = React.useMemo(() => (isDesktop ? DropdownMenu : Drawer), [isDesktop]);

  return <Component {...rest} />;
};
const ResponsiveDropdownMenuTrigger = (props: ResponsiveDropdownTriggerProps) => {
  const { ...rest } = props;
  const { isDesktop } = useResponsive();
  const Component = React.useMemo(() => (isDesktop ? DropdownMenuTrigger : DrawerTrigger), [isDesktop]);

  return <Component {...rest} />;
};
const ResponsiveDropdownMenuContent = (props: ResponsiveDropdownContentProps) => {
  const { children, header, bodyProps, ...rest } = props;
  const { className, ...bodyRest } = bodyProps ?? {};
  const { className: headerClassName, ...headerRest } = header?.props ?? {};
  const { isDesktop } = useResponsive();
  const loading = useLoading();
  const Component = React.useMemo(
    () =>
      isDesktop ? (
        <DropdownMenuContent {...rest}>{children}</DropdownMenuContent>
      ) : (
        <DrawerContent {...rest}>
          {header && (
            <DrawerHeader
              className={cn("text-start", headerClassName)}
              {...headerRest}
            >
              <DrawerTitle {...header.titleProps}>{header.title}</DrawerTitle>
              {header.description && (
                <DrawerDescription {...header.descriptionProps}>{header.description}</DrawerDescription>
              )}
            </DrawerHeader>
          )}

          <div
            className={cn("grid gap-2 px-4 pb-8 md:px-0", className)}
            {...bodyRest}
          >
            {children}
          </div>
        </DrawerContent>
      ),
    [isDesktop, rest, children, header, headerClassName, headerRest, className, bodyRest],
  );

  if (loading) return null;
  return Component;
};
const ResponsiveDropdownMenuItem = (props: ResponsiveDropdownMenuItemProps) => {
  const { selected, onSelect, closeOnSelect, disabled, ...rest } = props;
  const { isDesktop } = useResponsive();
  const loading = useLoading();
  const Wrapper = React.useCallback<React.FC<{ children: React.ReactNode }>>(
    ({ children }) =>
      closeOnSelect ? <DrawerClose asChild>{children}</DrawerClose> : <React.Fragment>{children}</React.Fragment>,
    [closeOnSelect],
  );

  const Component = React.useMemo(
    () =>
      isDesktop ? (
        <DropdownMenuItem
          onSelect={onSelect}
          disabled={disabled}
          {...rest}
        />
      ) : (
        <Wrapper>
          <Button
            variant={selected ? "secondary" : "outline"}
            className='w-full'
            disabled={selected ?? disabled}
            onClick={onSelect}
            {...rest}
          />
        </Wrapper>
      ),
    [isDesktop, onSelect, rest, Wrapper, selected, disabled],
  );

  if (loading) return null;
  return Component;
};
const ResponsiveDropdownMenuSeparator = (props: ResponsiveDropdownSeparatorProps) => {
  const { ...rest } = props;
  const { isDesktop } = useResponsive();
  const loading = useLoading();
  const Component = React.useMemo(() => (isDesktop ? DropdownMenuSeparator : Separator), [isDesktop]);

  if (loading) return null;
  return <Component {...rest} />;
};

export {
  ResponsiveDropdownMenu,
  ResponsiveDropdownMenuContent,
  ResponsiveDropdownMenuItem,
  ResponsiveDropdownMenuSeparator,
  ResponsiveDropdownMenuTrigger,
};
