"use client";

import { icons } from "lucide-react";

import { Icon } from "~/components/global";
import { LoadingButton } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Separator } from "~/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/ui/tooltip";

import { cn } from "~/lib/utils";

import { ConfigurationCategory, ConfigurationKeys, ConfigurationValue } from "~/types/schema";

export type ConfigInputs<
  T extends ConfigurationCategory = ConfigurationCategory,
  K extends ConfigurationKeys<T> = ConfigurationKeys<T>,
> = ConfigInputProps<T, K> | ConfigInputGroupProps<T, K> | ConfigInputSeparatorProps;

type ConfigInputProps<
  T extends ConfigurationCategory = ConfigurationCategory,
  K extends ConfigurationKeys<T> = ConfigurationKeys<T>,
> = {
  inputKey: K;
  title: string;
  type: "text" | "password" | "number" | "select";
  description?: string;
  required?: boolean;
  action?: {
    label: string;
    onClick: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
    loading: boolean;
    icon?: keyof typeof icons;
  };
  value: ConfigurationValue<T, K>;
  onValueChange: (key: K, value: any) => void;
  error?: string;
  onError?: (error: string) => void;
  validation?: (value: string) =>
    | { success: boolean; message: string }
    | Promise<{
        success: boolean;
        message: string;
      }>;
  readOnly?: boolean;
  minMax?: { min?: number; max?: number };
  disabled?: boolean;
  placeholder?: string;
};

type ConfigInputGroupProps<
  T extends ConfigurationCategory = ConfigurationCategory,
  K extends ConfigurationKeys<T> = ConfigurationKeys<T>,
> = {
  inputKey: string;
  type: "group";
  columns: number;
  children: (ConfigInputProps<T, K> & {
    columnSpan?: number;
  })[];
};
type ConfigInputSeparatorProps = {
  inputKey: string;
  type: "separator";
};
export default function ConfigurationInput<
  T extends ConfigurationCategory = ConfigurationCategory,
  K extends ConfigurationKeys<T> = ConfigurationKeys<T>,
>(props: ConfigInputProps<T, K> | ConfigInputGroupProps<T, K> | ConfigInputSeparatorProps) {
  const key = String(props.inputKey);
  return (
    <>
      {props.type !== "separator" && props.type !== "group" && (
        <>
          <Inputs<T, K> {...props} />
        </>
      )}

      {props.type === "separator" && <Separator />}

      {props.type === "group" && (
        <div
          slot='group'
          className='grid w-full gap-2'
          style={{
            gridTemplateColumns: `repeat(${props.columns}, 1fr)`,
          }}
        >
          {props.children.map((child, index) => (
            <Inputs<T, K>
              key={`${child.inputKey as string}@${index}`}
              columnSpan={child.columnSpan}
              {...child}
            />
          ))}
        </div>
      )}
    </>
  );
}

function Inputs<
  T extends ConfigurationCategory = ConfigurationCategory,
  K extends ConfigurationKeys<T> = ConfigurationKeys<T>,
>(
  props: ConfigInputProps<T, K> & {
    columnSpan?: number;
  },
) {
  const key = String(props.inputKey);
  return (
    <div
      id={key}
      slot={`input-${key}`}
      className='flex w-full flex-col gap-2'
      style={{
        gridColumn: `span ${props.columnSpan || 1} / span ${props.columnSpan || 1}`,
      }}
    >
      <div
        slot='label'
        className='flex items-center gap-2'
      >
        <Label
          htmlFor={key}
          aria-required={props.required}
        >
          {props.title} <span className='text-sm text-muted-foreground'>{!props.required ? "(optional)" : ""}</span>
        </Label>
        {props.description && (
          <Tooltip>
            <TooltipTrigger
              onClick={(e) => e.preventDefault()}
              className='cursor-default'
            >
              <Icon
                name='Info'
                size={"1rem"}
                className='text-muted-foreground'
              />
            </TooltipTrigger>
            <TooltipContent
              side='right'
              className='max-w-screen-sm'
            >
              <p className='max-w-screen-sm !whitespace-pre-wrap'>{props.description}</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>

      <div
        slot='input'
        className='grid w-full grid-cols-6 gap-2'
      >
        <div className={cn("w-full", props.action ? "col-span-5" : "col-span-full")}>
          {props.type === "text" || props.type === "password" || props.type === "number" ? (
            <Input
              id={key}
              name={key}
              type={props.type}
              value={props.value as string}
              readOnly={props.readOnly || false}
              min={props.minMax?.min}
              max={props.minMax?.max}
              disabled={props.disabled}
              placeholder={props.placeholder}
              onChange={(e) => {
                if (props.error) {
                  props.onError?.("");
                }
                props.onValueChange(props.inputKey, e.target.value as ConfigurationValue<T, K>);
              }}
              onBlur={async () => {
                try {
                  props.onError?.("");

                  if (props.required && !(props.value as string).trim()) {
                    throw new Error(`${props.title} is required.`);
                  }

                  if (props.validation) {
                    const result = await props.validation(props.value as string);
                    if (!result.success) throw new Error(result.message);
                  }
                } catch (error) {
                  const e = error as Error;
                  props.onError?.(e.message);
                }
              }}
            />
          ) : (
            props.type === "select" && (
              <Select
                disabled={props.disabled}
                value={String(props.value)}
                onValueChange={(value) => {
                  props.onValueChange(props.inputKey, (value as string) === "true");
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Select an option' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='true'>Enabled</SelectItem>
                  <SelectItem value='false'>Disabled</SelectItem>
                </SelectContent>
              </Select>
            )
          )}
        </div>
        {props.action && (
          <LoadingButton
            variant={"secondary"}
            onClick={props.action.onClick}
            loading={props.action.loading}
          >
            {props.action.icon && <Icon name={props.action.icon} />}
            {props.action.label}
          </LoadingButton>
        )}
      </div>

      <div slot='message'>
        <span className={cn("block text-sm text-destructive", props.error ? "opacity-100" : "select-none opacity-0")}>
          {props.error}
        </span>
      </div>
    </div>
  );
}
