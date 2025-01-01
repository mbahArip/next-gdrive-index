import { icons } from "lucide-react";
import { HTMLProps } from "react";

import { Icon } from "~/components/global";
import { Button } from "~/components/ui/button";
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
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Separator } from "~/components/ui/separator";

import useMediaQuery from "~/hooks/useMediaQuery";

type DropdownItem =
  | {
      type: "label";
      key: string;
      title: React.ReactNode;
      className?: string;
    }
  | {
      type: "separator";
      key: string;
      className?: string;
    }
  | {
      type: "item";
      key: string;
      title: React.ReactNode;
      onClick: (e: React.MouseEvent) => void;
      disabled?: boolean;
      icon?: keyof typeof icons;
      className?: string;
    }
  | {
      type: "checkbox";
      key: string;
      title: React.ReactNode;
      checked: boolean;
      onCheckedChange: (checked: boolean) => void;
      disabled?: boolean;
      className?: string;
    }
  | {
      type: "radio";
      key: string;
      value: string;
      onValueChange: (value: string) => void;
      items: {
        key: string;
        value: string;
        title: string;
        className?: string;
      }[];
    };
type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: React.ReactNode;
  mobile: {
    title?: React.ReactNode;
    description?: React.ReactNode;
    content: React.ReactNode;
    closeOnFooter?: boolean;
    footer?: React.ReactNode;
  };
  desktop: {
    align?: "start" | "center" | "end";
    alignOffset?: number;
    placement?: "top" | "right" | "bottom" | "left";
    placementOffset?: number;
    items: DropdownItem[];
  };
} & HTMLProps<HTMLDivElement>;
export default function ResponsiveDropdown({ open, onOpenChange, trigger, mobile, desktop, ...rest }: Props) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  return (
    <div
      slot='responsive-menu'
      {...rest}
    >
      {isDesktop ? (
        <DropdownMenu
          open={open}
          onOpenChange={onOpenChange}
        >
          <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
          <DropdownMenuContent
            align={desktop.align}
            alignOffset={desktop.alignOffset}
            side={desktop.placement}
            sideOffset={desktop.placementOffset}
          >
            {desktop.items.map((item, index) => {
              switch (item.type) {
                case "label":
                  return (
                    <DropdownMenuLabel
                      key={item.key}
                      className={item.className}
                    >
                      {item.title}
                    </DropdownMenuLabel>
                  );
                case "separator":
                  return (
                    <DropdownMenuSeparator
                      key={item.key}
                      className={item.className}
                    />
                  );
                case "checkbox":
                  return (
                    <DropdownMenuCheckboxItem
                      key={item.key}
                      checked={item.checked}
                      onCheckedChange={item.onCheckedChange}
                      disabled={item.disabled}
                      className={item.className}
                    >
                      {item.title}
                    </DropdownMenuCheckboxItem>
                  );
                case "radio":
                  return (
                    <DropdownMenuRadioGroup
                      value={item.value}
                      onValueChange={item.onValueChange}
                    >
                      {item.items.map((radio) => (
                        <DropdownMenuRadioItem
                          key={radio.key}
                          value={radio.value}
                          className={radio.className}
                        >
                          {radio.title}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  );
                default:
                  return (
                    <DropdownMenuItem
                      key={item.key}
                      disabled={item.disabled}
                      onClick={item.onClick}
                      className={item.className}
                    >
                      {item.icon && (
                        <Icon
                          name={item.icon}
                          size={"1rem"}
                          className='mr-2'
                        />
                      )}
                      {item.title}
                    </DropdownMenuItem>
                  );
              }
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Drawer
          open={open}
          onOpenChange={onOpenChange}
          shouldScaleBackground
        >
          <DrawerTrigger asChild>{trigger}</DrawerTrigger>
          <DrawerContent>
            {(mobile.title || mobile.description) && (
              <DrawerHeader className='text-start'>
                {mobile.title && <DrawerTitle>{mobile.title}</DrawerTitle>}
                {mobile.description && <DrawerDescription>{mobile.description}</DrawerDescription>}
              </DrawerHeader>
            )}

            <div className='grid gap-2 px-4'>{mobile.content}</div>

            {(mobile.footer || mobile.closeOnFooter) && (
              <DrawerFooter>
                <Separator />
                {mobile.footer}

                {mobile.closeOnFooter && (
                  <DrawerClose asChild>
                    <Button
                      size={"sm"}
                      variant='secondary'
                    >
                      Close
                    </Button>
                  </DrawerClose>
                )}
              </DrawerFooter>
            )}
          </DrawerContent>
        </Drawer>
      )}
    </div>
  );
}
