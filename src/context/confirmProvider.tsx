"use client";

import * as React from "react";
import { toast } from "sonner";

import { Button, LoadingButton } from "~/components/ui/button";
import {
  ResponsiveDialog,
  ResponsiveDialogBody,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from "~/components/ui/dialog.responsive";
import { type IconName } from "~/components/ui/icon";

export type UseConfirmOptions = {
  title: React.ReactNode;
  description?: React.ReactNode;
  content?: React.ReactNode;
  confirmText?: React.ReactNode;
  cancelText?: React.ReactNode;
  icon?: IconName;
  onConfirm?: () => Promise<void>;
  onCancel?: () => void;
  confirmProps?: React.ComponentPropsWithRef<typeof Button>;
  cancelProps?: React.ComponentPropsWithRef<typeof Button>;
  hideCancelButton?: boolean;
};
const baseOptions: Readonly<UseConfirmOptions> = {
  title: "",
  description: "",
  content: "",
  confirmText: "Confirm",
  cancelText: "Cancel",
  icon: undefined,
  async onConfirm() {
    void 0;
  },
  onCancel() {
    void 0;
  },
  confirmProps: {},
  cancelProps: {},
  hideCancelButton: false,
} as const;

type UseConfirmDialogContextProps = {
  confirm: (options: UseConfirmOptions) => Promise<boolean>;
};
const UseConfirmDialogContext = React.createContext<UseConfirmDialogContextProps>({
  confirm: async () => false,
});

type UseConfirmDialogComponentProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config: UseConfirmOptions;
  onConfirm: () => void;
  onCancel: () => void;
};
const UseConfirmDialogComponent = (props: UseConfirmDialogComponentProps) => {
  const [isLoading, setLoading] = React.useState<boolean>(false);

  React.useEffect(() => {
    return () => {
      setLoading(false);
    };
  }, []);

  return (
    <ResponsiveDialog
      open={props.open}
      onOpenChange={(open) => {
        if (isLoading) {
          toast.info("Please wait for the current action to complete.");
          return;
        }
        props.onOpenChange(open);
      }}
    >
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>{props.config.title}</ResponsiveDialogTitle>
          {props.config.description && (
            <ResponsiveDialogDescription>{props.config.description}</ResponsiveDialogDescription>
          )}
        </ResponsiveDialogHeader>

        {props.config.content && <ResponsiveDialogBody>{props.config.content}</ResponsiveDialogBody>}

        <ResponsiveDialogFooter className='flex-col-reverse md:flex-row'>
          {!props.config.hideCancelButton && (
            <Button
              disabled={isLoading}
              variant={"ghost"}
              {...props.config.cancelProps}
              onClick={() => {
                props.config.onCancel?.();
                props.onCancel();
              }}
            >
              {props.config.cancelText}
            </Button>
          )}
          <LoadingButton
            loading={isLoading}
            {...props.config.confirmProps}
            onClick={async () => {
              setLoading(true);
              try {
                await props.config.onConfirm?.();
                props.onConfirm();
              } catch (error) {
                void error;
              } finally {
                setLoading(false);
              }
            }}
          >
            {props.config.confirmText}
          </LoadingButton>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
};

type UseConfirmDialogProviderProps = {
  defaultOptions?: UseConfirmOptions;
};
export default function UseConfirmDialogProvider({
  children,
  defaultOptions,
}: React.PropsWithChildren<UseConfirmDialogProviderProps>) {
  const [isOpen, setOpen] = React.useState<boolean>(false);
  const [options, setOptions] = React.useState<UseConfirmOptions>(baseOptions);
  const resolver = React.useRef<(value: boolean) => void>();

  const resolvedOptions = React.useMemo<UseConfirmOptions>(() => {
    return { ...baseOptions, ...defaultOptions };
  }, [defaultOptions]);

  const confirmCallback = React.useCallback(
    (options: UseConfirmOptions) => {
      setOptions({ ...resolvedOptions, ...options });
      setOpen(true);
      return new Promise<boolean>((resolve) => {
        resolver.current = resolve;
      });
    },
    [resolvedOptions],
  );

  const handleConfirm = React.useCallback(() => {
    if (resolver.current) resolver.current(true);
    setOpen(false);
  }, []);
  const handleCancel = React.useCallback(() => {
    setOpen(false);
    if (resolver.current) resolver.current(false);
  }, []);

  const contextValue = React.useMemo<UseConfirmDialogContextProps>(
    () => ({
      confirm: confirmCallback,
    }),
    [confirmCallback],
  );

  return (
    <UseConfirmDialogContext.Provider value={contextValue}>
      {children}
      <UseConfirmDialogComponent
        open={isOpen}
        onOpenChange={setOpen}
        config={options}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </UseConfirmDialogContext.Provider>
  );
}

export const useConfirmDialog = (): ((options: UseConfirmOptions) => Promise<boolean>) => {
  const context = React.useContext(UseConfirmDialogContext);
  if (!context) {
    throw new Error("useConfirmDialog must be used within a UseConfirmDialogProvider");
  }
  return context.confirm;
};
