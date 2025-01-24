import Link from "next/link";
import { useMemo, useState } from "react";
import { useFieldArray } from "react-hook-form";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import { toast } from "sonner";
import { type z } from "zod";

import { Button } from "~/components/ui/button";
import { VirtualizedCombobox } from "~/components/ui/combobox.virtualized";
import {
  ResponsiveDialog,
  ResponsiveDialogBody,
  ResponsiveDialogClose,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogTrigger,
} from "~/components/ui/dialog.responsive";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import Icon, { IconNamesArray } from "~/components/ui/icon";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Separator } from "~/components/ui/separator";
import { Textarea } from "~/components/ui/textarea";

import { useResponsive } from "~/context/responsiveContext";
import { cn, formatFooterContent } from "~/lib/utils";

import { type Schema_App_Configuration } from "~/types/schema";

import { FormColumn, type FormProps, FormSection } from "./ConfiguratorPage";

export default function SiteForm({ form, onResetField }: FormProps) {
  return (
    <FormSection
      title='Site Configuration'
      description='Configure how your site looks and behaves'
    >
      <FormField
        control={form.control}
        name='site.privateIndex'
        render={({ field, fieldState }) => (
          <FormItem>
            <FormLabel
              resetDisabled={!fieldState.isDirty}
              onFieldReset={() => {
                onResetField?.("site.privateIndex");
              }}
            >
              Private Index
            </FormLabel>
            <FormControl>
              <Select
                value={field.value ? "true" : "false"}
                onValueChange={(value) => {
                  field.onChange(value === "true");
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Select option' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='true'>Enable</SelectItem>
                  <SelectItem value='false'>Disable</SelectItem>
                </SelectContent>
              </Select>
            </FormControl>
            <FormDescription>
              Enable to require a password to access the site.{" "}
              <b>Make sure to set a password in the environment section.</b>
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name='site.guideButton'
        render={({ field, fieldState }) => (
          <FormItem>
            <FormLabel
              resetDisabled={!fieldState.isDirty}
              onFieldReset={() => {
                onResetField?.("site.guideButton");
              }}
            >
              Internal Menu
            </FormLabel>
            <FormControl>
              <Select
                value={field.value ? "true" : "false"}
                onValueChange={(value) => {
                  field.onChange(value === "true");
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Select option' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='true'>Show</SelectItem>
                  <SelectItem value='false'>Hide (Recommended)</SelectItem>
                </SelectContent>
              </Select>
            </FormControl>
            <FormDescription>Show internal menu on the navbar.</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormColumn>
        <FormField
          control={form.control}
          name='site.siteName'
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel
                resetDisabled={!fieldState.isDirty}
                onFieldReset={() => {
                  onResetField?.("site.siteName");
                }}
              >
                Site Name
              </FormLabel>
              <FormControl>
                <Input
                  placeholder='My Awesome Index'
                  {...field}
                />
              </FormControl>
              <FormDescription>Site name for meta and navbar.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='site.siteNameTemplate'
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel
                resetDisabled={!fieldState.isDirty}
                onFieldReset={() => {
                  onResetField?.("site.siteNameTemplate");
                }}
              >
                Site Name Template
              </FormLabel>
              <FormControl>
                <Input
                  placeholder='%s - %t'
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Template for the site name. <code className='font-semibold'>%t</code> for site name and{" "}
                <code className='font-semibold'>%s</code> for page title.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className='col-span-full rounded-lg border p-4 shadow'>
          <span className='w-full text-center text-base font-semibold'>
            {(form.watch("site.siteNameTemplate") ?? "No template")
              .replace("%t", form.watch("site.siteName") ?? "next-gdrive-index")
              .replace("%s", "Page Title Goes Here")}
          </span>
        </div>
      </FormColumn>
      <FormField
        control={form.control}
        name='site.siteDescription'
        render={({ field, fieldState }) => (
          <FormItem>
            <FormLabel
              resetDisabled={!fieldState.isDirty}
              onFieldReset={() => {
                onResetField?.("site.siteDescription");
              }}
            >
              Site Description
            </FormLabel>
            <FormControl>
              <Textarea
                placeholder='A simple file browser for Google Drive with awesome features'
                {...field}
              />
            </FormControl>
            <FormDescription>Site description to be displayed on the metadata.</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormColumn>
        <FormField
          control={form.control}
          name='site.siteAuthor'
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel
                resetDisabled={!fieldState.isDirty}
                onFieldReset={() => {
                  onResetField?.("site.siteAuthor");
                }}
              >
                Site Author
              </FormLabel>
              <FormControl>
                <Input
                  placeholder='mbaharip'
                  {...field}
                />
              </FormControl>
              <FormDescription>Site author to be displayed on the metadata, and used for the footer.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='site.twitterHandle'
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel
                resetDisabled={!fieldState.isDirty}
                onFieldReset={() => {
                  onResetField?.("site.twitterHandle");
                }}
              >
                X (Twitter) Handle
              </FormLabel>
              <FormControl>
                <Input
                  placeholder='mbaharip'
                  {...field}
                />
              </FormControl>
              <FormDescription>X (Twitter) handle to be used on the metadata, and for the footer.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </FormColumn>
      <FormField
        control={form.control}
        name='site.robots'
        render={({ field, fieldState }) => (
          <FormItem>
            <FormLabel
              resetDisabled={!fieldState.isDirty}
              onFieldReset={() => {
                onResetField?.("site.robots");
              }}
            >
              Robots Meta
            </FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormDescription>
              Robots meta tag for search engine.{" "}
              <Link
                href={"https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag#directives"}
                target='_blank'
                rel='noopener noreferrer'
                className='text-blue-600 dark:text-blue-400'
              >
                Learn more
              </Link>
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name='site.breadcrumbMax'
        render={({ field, fieldState }) => (
          <FormItem>
            <FormLabel
              resetDisabled={!fieldState.isDirty}
              onFieldReset={() => {
                onResetField?.("site.breadcrumbMax");
              }}
            >
              Max Breadcrumbs Item
            </FormLabel>
            <FormControl>
              <Input
                type='number'
                {...field}
              />
            </FormControl>
            <FormDescription>Maximum number of breadcrumbs item before it&apos;s truncated.</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormColumn>
        <FormField
          control={form.control}
          name='site.toaster.duration'
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel
                resetDisabled={!fieldState.isDirty}
                onFieldReset={() => {
                  onResetField?.("site.toaster.duration");
                }}
              >
                Toaster Duration
              </FormLabel>
              <FormControl>
                <Input
                  type='number'
                  {...field}
                />
              </FormControl>
              <FormDescription>Duration in milliseconds for the toaster to be displayed.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='site.toaster.position'
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel
                className='grow tablet:grow-0'
                resetDisabled={!fieldState.isDirty}
                onFieldReset={() => {
                  onResetField?.("site.toaster.position");
                }}
              >
                Toaster Position
              </FormLabel>
              <FormControl>
                <Select
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select option' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='top-right'>Top Right</SelectItem>
                    <SelectItem value='top-left'>Top Left</SelectItem>
                    <SelectItem value='bottom-right'>Bottom Right</SelectItem>
                    <SelectItem value='bottom-left'>Bottom Left</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormDescription>Position of the toaster.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type='button'
          className='col-span-full w-full'
          variant={"secondary"}
          onClick={() => {
            toast.info("This is a test toaster", {
              position: form.watch("site.toaster.position"),
              duration: form.watch("site.toaster.duration"),
            });
          }}
        >
          <Icon name='Megaphone' />
          Test Toaster
        </Button>
      </FormColumn>
      <NavbarItemsField
        form={form}
        onResetField={onResetField}
      />
      <SupportsField
        form={form}
        onResetField={onResetField}
      />
      <FooterField
        form={form}
        onResetField={onResetField}
      />
    </FormSection>
  );
}

function NavbarItemsField({ form, onResetField }: FormProps) {
  const { isDesktop } = useResponsive();
  const { append, fields, remove } = useFieldArray<z.infer<typeof Schema_App_Configuration>>({
    control: form.control,
    name: "site.navbarItems",
  });
  const iconItems = useMemo<{ label: React.ReactNode; value: string }[]>(
    () =>
      IconNamesArray.map((icon) => ({
        label: (
          <div className='inline-flex grow items-center justify-between gap-2'>
            <span className='line-clamp-1 break-all'>{icon}</span>
            <Icon
              name={icon}
              hideWrapper
              className='shrink-0'
            />
          </div>
        ),
        value: icon,
      })),
    [],
  );

  return (
    <>
      <div className='space-y-2 rounded-lg border px-4 py-2 shadow'>
        <div className='space-y-2'>
          <div className='flex w-full items-center justify-between gap-2 tablet:w-fit tablet:justify-start'>
            <Label>Navbar Items</Label>
            <Button
              type='button'
              variant={"ghost"}
              disabled={!form.getFieldState("site.navbarItems").isDirty}
              onClick={() => {
                onResetField?.(`site.navbarItems`);
              }}
              size={"icon"}
            >
              <Icon
                name='RefreshCcw'
                className='stroke-inherit'
              />
            </Button>
          </div>
          {fields.length === 0 ? (
            <div className='w-full py-8 text-center text-sm font-semibold text-muted-foreground'>
              No extra navbar items, add one to show extra links on the navbar!
            </div>
          ) : (
            <>
              {fields.map((field, index) => (
                <div
                  className='flex flex-col gap-4'
                  key={field.id}
                >
                  <div className='flex w-full flex-col gap-4 tablet:flex-row tablet:items-end'>
                    <FormField
                      control={form.control}
                      name={`site.navbarItems.${index}.icon`}
                      render={({ field }) => (
                        <FormItem disableBorder>
                          <FormLabel>Icon</FormLabel>
                          <FormControl>
                            <VirtualizedCombobox
                              minWidth={isDesktop ? "300px" : "100%"}
                              maxWidth={isDesktop ? "300px" : "100%"}
                              options={iconItems}
                              searchPlaceholder='Search icon...'
                              selectedOption={field.value}
                              onSelectOption={(value) => {
                                field.onChange(value);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`site.navbarItems.${index}.name`}
                      render={({ field }) => (
                        <FormItem
                          disableBorder
                          className='grow'
                        >
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder='Navigation name'
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className='inline-flex w-full flex-col gap-4 tablet:flex-row tablet:items-end'>
                    <FormField
                      control={form.control}
                      name={`site.navbarItems.${index}.href`}
                      render={({ field }) => (
                        <FormItem
                          disableBorder
                          className='grow'
                        >
                          <FormLabel>URL</FormLabel>
                          <FormControl>
                            <Input
                              placeholder='/path/to/page'
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`site.navbarItems.${index}.external`}
                      render={({ field }) => (
                        <FormItem disableBorder>
                          <FormControl>
                            <Button
                              type='button'
                              variant={field.value ? "default" : "secondary"}
                              name={field.name}
                              disabled={field.disabled}
                              onClick={() => {
                                field.onChange(!field.value);
                              }}
                              onBlur={field.onBlur}
                              className={cn(
                                "w-full transition tablet:w-fit",
                                field.value ? "opacity-100" : "opacity-30",
                              )}
                            >
                              External Link
                            </Button>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button
                    className='w-full'
                    type='button'
                    variant='outline-destructive'
                    onClick={() => remove(index)}
                  >
                    <Icon name='X' />
                    Delete Item
                  </Button>
                  <Separator />
                </div>
              ))}
            </>
          )}

          <Button
            type='button'
            className='w-full'
            onClick={() => append({ icon: "Link", name: "New Item", href: "/new-item", external: false })}
          >
            <Icon name='Plus' />
            Add Item
          </Button>
        </div>
      </div>
    </>
  );
}
function SupportsField({ form, onResetField }: FormProps) {
  const { append, fields, remove } = useFieldArray<z.infer<typeof Schema_App_Configuration>>({
    control: form.control,
    name: "site.supports",
  });

  return (
    <>
      <div className='space-y-2 rounded-lg border px-4 py-2 shadow'>
        <div className='w-full space-y-2'>
          <div className='flex w-full items-center justify-between gap-2 tablet:w-fit tablet:justify-start'>
            <Label>Supports / Donations</Label>
            <Button
              type='button'
              variant={"ghost"}
              disabled={!form.getFieldState("site.supports").isDirty}
              onClick={() => {
                onResetField?.(`site.supports`);
              }}
              size={"icon"}
            >
              <Icon
                name='RefreshCcw'
                className='stroke-inherit'
              />
            </Button>
          </div>
          {fields.length === 0 ? (
            <div className='w-full py-8 text-center text-sm font-semibold text-muted-foreground'>
              No support items, add one to show supports link on the navbar!
            </div>
          ) : (
            <>
              {fields.map((field, index) => (
                <div
                  className='flex flex-col gap-4'
                  key={field.id}
                >
                  <div className='flex w-full flex-col gap-4 tablet:flex-row tablet:items-end'>
                    <FormField
                      control={form.control}
                      name={`site.supports.${index}.currency`}
                      render={({ field }) => (
                        <FormItem disableBorder>
                          <FormLabel>Currency</FormLabel>
                          <FormControl>
                            <Input
                              placeholder='Currency'
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`site.supports.${index}.name`}
                      render={({ field }) => (
                        <FormItem
                          disableBorder
                          className='grow'
                        >
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder='Service name'
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className='inline-flex w-full flex-col gap-4 tablet:flex-row '>
                    <FormField
                      control={form.control}
                      name={`site.supports.${index}.href`}
                      render={({ field }) => (
                        <FormItem
                          disableBorder
                          className='grow'
                        >
                          <FormLabel>URL</FormLabel>
                          <FormControl>
                            <Input
                              placeholder='/path/to/page'
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button
                    className='w-full'
                    type='button'
                    variant='outline-destructive'
                    onClick={() => remove(index)}
                  >
                    <Icon name='X' />
                    Delete Item
                  </Button>
                  <Separator />
                </div>
              ))}
            </>
          )}

          <Button
            className='w-full'
            type='button'
            onClick={() => append({ currency: "USD", name: "Paypal", href: "https://paypal.me/acme" })}
          >
            <Icon name='Plus' />
            Add Item
          </Button>
        </div>
      </div>
    </>
  );
}
function FooterField({ form, onResetField }: FormProps) {
  const { append, fields, remove } = useFieldArray<z.infer<typeof Schema_App_Configuration>>({
    control: form.control,
    name: "site.footer",
  });
  const templates = useMemo(
    () => [
      {
        code: "version",
        description: "Show current version",
      },
      {
        code: "poweredBy",
        description: 'Show "Powered by next-gdrive-index", linked to the repository',
      },
      {
        code: "year",
        description: "Show current year",
      },
      {
        code: "repository",
        description: "Original repository (mbaharip/next-gdrive-index)",
      },
      {
        code: "creator",
        description: "mbaharip, the creator of next-gdrive-index",
      },
      {
        code: "author",
        description: "Site author from configuration",
      },
      {
        code: "siteName",
        description: "Site name from configuration",
      },
      {
        code: "handle",
        description: "Twitter handle from configuration",
      },
    ],
    [],
  );
  const [content, setContent] = useState<string>(() => {
    return formatFooterContent(form.watch("site.footer"), form.getValues("site"));
  });

  return (
    <>
      <div className='space-y-2 rounded-lg border px-4 py-2 shadow'>
        <div className='w-full space-y-4'>
          <div className='flex w-full items-center justify-between gap-2 tablet:w-fit tablet:justify-start'>
            <Label>Footer Items</Label>
            <Button
              type='button'
              variant={"ghost"}
              disabled={!form.getFieldState("site.footer").isDirty}
              onClick={() => {
                onResetField?.(`site.footer`);
              }}
              size={"icon"}
            >
              <Icon
                name='RefreshCcw'
                className='stroke-inherit'
              />
            </Button>
          </div>
          {fields.length === 0 ? (
            <div className='w-full py-8 text-center text-sm font-semibold text-muted-foreground'>
              No support items, add one to show supports link on the navbar!
            </div>
          ) : (
            <div className='flex flex-col gap-4'>
              {fields.map((field, index) => (
                <FormField
                  control={form.control}
                  key={field.id}
                  name={`site.footer.${index}.value`}
                  render={({ field }) => (
                    <FormItem disableBorder>
                      <div className='flex w-full items-center gap-4'>
                        <FormControl>
                          <Input
                            placeholder='See description for templates'
                            {...field}
                          />
                        </FormControl>
                        <Button
                          type='button'
                          variant={"outline-destructive"}
                          size='icon'
                          onClick={() => {
                            remove(index);
                          }}
                        >
                          <Icon name='X' />
                        </Button>
                      </div>
                      <FormDescription className={cn(index !== fields.length - 1 && "sr-only")}>
                        <span className='flex flex-col gap-2 tablet:flex-row tablet:items-center tablet:justify-between'>
                          <span>
                            Text to be displayed on the footer. <b>Markdown supported</b>
                          </span>
                          <ResponsiveDialog>
                            <ResponsiveDialogTrigger asChild>
                              <Button
                                type='button'
                                size='sm'
                                variant='ghost'
                                className='w-full tablet:ml-auto tablet:w-fit'
                              >
                                Click to see templates
                              </Button>
                            </ResponsiveDialogTrigger>
                            <ResponsiveDialogContent>
                              <ResponsiveDialogHeader>
                                <ResponsiveDialogTitle>Template Guide</ResponsiveDialogTitle>
                                <ResponsiveDialogDescription>
                                  Available templates for dynamic content
                                </ResponsiveDialogDescription>
                              </ResponsiveDialogHeader>
                              <ResponsiveDialogBody>
                                <ScrollArea
                                  className='h-fit w-full pr-4'
                                  type='always'
                                >
                                  <div className='flex max-h-[50dvh] flex-col gap-2'>
                                    {templates.map((template) => (
                                      <div
                                        key={template.code}
                                        className='flex flex-col rounded-lg border bg-background p-2 tablet:px-4'
                                      >
                                        <span className='font-semibold'>{`{{ ${template.code} }}`}</span>
                                        <span className='text-sm text-muted-foreground'>{template.description}</span>
                                      </div>
                                    ))}
                                  </div>
                                </ScrollArea>
                              </ResponsiveDialogBody>
                              <ResponsiveDialogFooter>
                                <ResponsiveDialogClose asChild>
                                  <Button>Close</Button>
                                </ResponsiveDialogClose>
                              </ResponsiveDialogFooter>
                            </ResponsiveDialogContent>
                          </ResponsiveDialog>
                        </span>
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>
          )}

          <Button
            type='button'
            size='sm'
            className='mt-2 w-full'
            onClick={() => {
              append({ value: "" });
            }}
          >
            <Icon name='Plus' />
            Add Item
          </Button>

          <Separator />
          <div className='space-y-4'>
            <div className='flex w-full flex-col items-center justify-center'>
              <ReactMarkdown
                className='flex w-full select-none flex-col items-center justify-center text-center'
                components={{
                  p: ({ children, ...props }) => (
                    <p
                      {...props}
                      className='muted text-balance text-sm'
                    >
                      {children}
                    </p>
                  ),
                  a: ({ children, ...props }) => {
                    const isExternal = props.href?.startsWith("http");

                    return (
                      <a
                        {...props}
                        className='text-balance text-sm text-blue-600 opacity-80 transition-all duration-300 hover:opacity-100 dark:text-blue-400'
                        target={isExternal ? "_blank" : undefined}
                        rel={isExternal ? "noopener noreferrer" : undefined}
                      >
                        {children}
                      </a>
                    );
                  },
                }}
                remarkPlugins={[remarkBreaks]}
              >
                {content}
              </ReactMarkdown>
            </div>
            <Button
              className='w-full'
              variant={"outline"}
              size={"sm"}
              onClick={() => {
                setContent(formatFooterContent(form.watch("site.footer"), form.getValues("site")));
              }}
            >
              Reload Preview
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
