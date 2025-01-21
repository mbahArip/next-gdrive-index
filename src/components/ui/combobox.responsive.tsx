"use client";

import { useVirtualizer } from "@tanstack/react-virtual";
import * as React from "react";

import { useResponsive } from "~/context/responsiveContext";
import { cn } from "~/lib/utils";

import { Button, ButtonProps } from "./button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "./command";
import { Drawer, DrawerContent, DrawerTrigger } from "./drawer";
import Icon from "./icon";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

interface ResponsiveComboboxRootProps extends React.PropsWithChildren {
  modal?: boolean;
}
interface ResponsiveComboboxTriggerProps extends React.PropsWithChildren {
  asChild?: true;
  className?: string;
  placeholder?: string;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
}
interface ResponsiveComboboxContentProps extends React.PropsWithChildren {
  cmdk?: {
    placeholder?: string;
    emptyMessage?: React.ReactNode;
  };
}
interface ResponsiveComboboxContextProps {
  items: {
    label: React.ReactNode;
    value: string;
  }[];
  selected?: string;
  onSelect: (value: string) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}
interface ResponsiveComboboxProviderProps extends React.PropsWithChildren {
  items: {
    label: React.ReactNode;
    value: string;
  }[];
  defaultSelected?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const ResponsiveComboboxContext = React.createContext<ResponsiveComboboxContextProps>({
  items: [],
  selected: "",
  onSelect: () => {
    void 0;
  },
  open: false,
  onOpenChange: () => {
    void false;
  },
});
const ResponsiveCombobox = (
  props: React.PropsWithChildren<
    ResponsiveComboboxProviderProps & {
      comboboxProps?: ResponsiveComboboxRootProps;
    }
  >,
) => {
  const { isDesktop } = useResponsive();
  const Component = React.useMemo(() => (isDesktop ? Popover : Drawer), [isDesktop]);
  const items = React.useMemo<typeof props.items>(() => props.items, [props.items]);
  const [selected, setSelected] = React.useState<string | undefined>(props.defaultSelected ?? undefined);
  const [open, setOpen] = React.useState<boolean>(props.open ?? false);

  const onSelect = React.useCallback((value: string) => {
    setSelected(selected === value ? undefined : value);
    setOpen(false);
  }, []);
  const onOpenChange = React.useCallback((open: boolean) => {
    setOpen(open);
    props.onOpenChange?.(open);
  }, []);

  return (
    <ResponsiveComboboxContext.Provider value={{ items, selected, onSelect }}>
      <Component
        open={open}
        onOpenChange={onOpenChange}
        modal={props.comboboxProps?.modal}
      >
        {props.children}
      </Component>
    </ResponsiveComboboxContext.Provider>
  );
};
const useProvider = () => {
  const context = React.useContext(ResponsiveComboboxContext);
  if (!context) {
    throw new Error("Combobox Provider is not found.");
  }
  return context;
};

const ResponsiveComboboxTrigger = (props: ResponsiveComboboxTriggerProps) => {
  const { children: _children, className, placeholder, variant = "outline", size, ...rest } = props;
  const { selected, items, open } = useProvider();
  const { isDesktop } = useResponsive();
  const Component = React.useMemo(() => (isDesktop ? PopoverTrigger : DrawerTrigger), [isDesktop]);

  return (
    <Component asChild>
      <Button
        variant={variant}
        size={size}
        aria-expanded={open}
        className={cn("w-[200px] justify-between", className)}
        {...rest}
      >
        <div className='inline-flex items-center gap-2'>
          {selected ? items.find((item) => item.value === selected)?.label : placeholder ?? "Select item..."}
        </div>
        <Icon
          name='ChevronsUpDown'
          className='ml-2 h-4 w-4 shrink-0 opacity-50'
          hideWrapper
        />
      </Button>
    </Component>
  );
};
const ResponsiveComboboxContent = (props: ResponsiveComboboxContentProps) => {
  const { cmdk, children: _children, ...rest } = props;
  const { items, selected, onSelect } = useProvider();
  const { isDesktop } = useResponsive();
  const Component = React.useMemo(() => (isDesktop ? PopoverContent : DrawerContent), [isDesktop]);

  /**
   * https://github.com/oaarnikoivu/shadcn-virtualized-combobox
   */

  const [filteredOptions, setFilteredOptions] = React.useState<typeof items>(items);
  const [focusedIndex, setFocusedIndex] = React.useState<number>(0);
  const [isKeyboardNavActive, setIsKeyboardNavActive] = React.useState<boolean>(false);

  const parentRef = React.useRef(null);

  const virtualizer = useVirtualizer({
    count: filteredOptions.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 35,
  });
  const virtualOptions = virtualizer.getVirtualItems();

  const scrollToIndex = (index: number) => {
    virtualizer.scrollToIndex(index, {
      align: "center",
    });
  };
  const handleSearch = (search: string) => {
    setIsKeyboardNavActive(false);
    setFilteredOptions(items.filter((item) => item.value.toLowerCase().includes(search.toLowerCase() ?? [])));
  };
  const handleKeyDown = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setIsKeyboardNavActive(true);
        setFocusedIndex((prev) => {
          const newIndex = prev === -1 ? 0 : Math.min(prev + 1, filteredOptions.length - 1);
          scrollToIndex(newIndex);
          return newIndex;
        });
        break;
      case "ArrowUp":
        event.preventDefault();
        setIsKeyboardNavActive(true);
        setFocusedIndex((prev) => {
          const newIndex = prev === -1 ? 0 : Math.max(prev - 1, 0);
          scrollToIndex(newIndex);
          return newIndex;
        });
        break;
      case "Enter":
        event.preventDefault();
        if (filteredOptions[focusedIndex]) {
          onSelect(filteredOptions[focusedIndex].value);
        }
        break;
      default:
        break;
    }
  };

  React.useEffect(() => {
    if (selected) {
      const option = filteredOptions.find((item) => item.value === selected);
      if (option) {
        const index = filteredOptions.indexOf(option);
        setFocusedIndex(index);
        virtualizer.scrollToIndex(index, {
          align: "center",
        });
      }
    }
  }, [selected, filteredOptions, virtualizer]);

  return (
    <Component
      {...rest}
      className='tablet:w-fit tablet:min-w-[200px] tablet:p-0'
    >
      <div className='px-4 tablet:px-0'>
        <Command
          shouldFilter={false}
          onKeyDown={handleKeyDown}
        >
          <CommandInput
            onValueChange={handleSearch}
            placeholder={cmdk?.placeholder ?? "Search..."}
          />
          <CommandList
            ref={parentRef}
            style={{
              height: "400px",
              width: "100%",
              overflow: "auto",
            }}
            onMouseDown={() => setIsKeyboardNavActive(false)}
            onMouseMove={() => setIsKeyboardNavActive(false)}
          >
            <CommandEmpty>{cmdk?.emptyMessage ?? "No item found."}</CommandEmpty>
            <CommandGroup>
              <div
                style={{
                  height: `${virtualizer.getTotalSize()}px`,
                  width: "100%",
                  position: "relative",
                }}
              >
                {virtualOptions.map((virtualOption) => (
                  <CommandItem
                    key={filteredOptions[virtualOption.index]?.value}
                    disabled={isKeyboardNavActive}
                    className={cn(
                      "absolute left-0 top-0 w-full bg-transparent",
                      focusedIndex === virtualOption.index && "bg-accent text-accent-foreground",
                      isKeyboardNavActive &&
                        focusedIndex !== virtualOption.index &&
                        "aria-selected:bg-transparent aria-selected:text-primary",
                    )}
                    style={{
                      height: `${virtualOption.size}px`,
                      transform: `translateY(${virtualOption.start}px)`,
                    }}
                    value={filteredOptions[virtualOption.index]?.value}
                    onMouseEnter={() => !isKeyboardNavActive && setFocusedIndex(virtualOption.index)}
                    onMouseLeave={() => !isKeyboardNavActive && setFocusedIndex(-1)}
                    onSelect={onSelect}
                  >
                    <Icon
                      name='Check'
                      className={cn(
                        "mr-2 h-4 w-4",
                        selected === filteredOptions[virtualOption.index]?.value ? "opacity-100" : "opacity-0",
                      )}
                    />
                    {filteredOptions[virtualOption.index]?.label}
                  </CommandItem>
                ))}
                {/* {items.map((item) => (
                <CommandItem
                  key={item.value}
                  value={item.value}
                  onSelect={onSelect}
                >
                  <Icon
                    name='Check'
                    className={cn("mr-2 h-4 w-4", selected === item.value ? "opacity-100" : "opacity-0")}
                  />
                  {item.label}
                </CommandItem>
              ))} */}
              </div>
            </CommandGroup>
          </CommandList>
        </Command>
      </div>
    </Component>
  );
};

export { ResponsiveCombobox, ResponsiveComboboxContent, ResponsiveComboboxTrigger };
