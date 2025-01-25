"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import Icon from "~/components/ui/icon";
import { Input } from "~/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Switch } from "~/components/ui/switch";

import { cn } from "~/lib/utils";

import { FormColumn, type FormProps, FormSection } from "./ConfiguratorPage";

export default function ApiForm({ form, onResetField }: FormProps) {
  const [inputHiddenFile, setInputHiddenFile] = useState<string>("");
  function onHiddenFileSubmit() {
    if (!inputHiddenFile) {
      toast.error("File name cannot be empty");
      setInputHiddenFile("");
      return;
    }
    const prevValue = form.watch("api.hiddenFiles");
    const value = inputHiddenFile.trim();
    if (prevValue.some((v) => v.trim() === value)) {
      toast.error("File name already exists in the hidden files list");
      setInputHiddenFile("");
      return;
    }
    form.setValue("api.hiddenFiles", [...form.watch("api.hiddenFiles"), inputHiddenFile], {
      shouldDirty: true,
    });
    setInputHiddenFile("");
  }

  return (
    <FormSection
      title='API Configuration'
      description='Configure how your index backend works'
    >
      <FormColumn>
        <FormField
          control={form.control}
          name='api.cache.public'
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel
                resetDisabled={!fieldState.isDirty}
                onFieldReset={() => {
                  onResetField?.("api.cache.public");
                }}
              >
                Public Cache
              </FormLabel>
              <FormControl>
                <Select
                  value={field.value ? "true" : "false"}
                  onValueChange={(value) => field.onChange(value === "true")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select option' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='true'>Enable (Recommended)</SelectItem>
                    <SelectItem value='false'>Disable</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormDescription>Enable public cache for the index.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='api.cache.staleWhileRevalidate'
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel
                resetDisabled={!fieldState.isDirty}
                onFieldReset={() => {
                  onResetField?.("api.cache.staleWhileRevalidate");
                }}
              >
                Stale While Revalidate
              </FormLabel>
              <FormControl>
                <Select
                  value={field.value ? "true" : "false"}
                  onValueChange={(value) => field.onChange(value === "true")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select option' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='true'>Enable (Recommended)</SelectItem>
                    <SelectItem value='false'>Disable</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormDescription>Return stale data before requesting fresh data.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='api.cache.maxAge'
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel
                resetDisabled={!fieldState.isDirty}
                onFieldReset={() => {
                  onResetField?.("api.cache.maxAge");
                }}
              >
                Max Age
              </FormLabel>
              <FormControl>
                <Input
                  type='number'
                  {...field}
                />
              </FormControl>
              <FormDescription>How long should the cache in browser last.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='api.cache.sMaxAge'
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel
                resetDisabled={!fieldState.isDirty}
                onFieldReset={() => {
                  onResetField?.("api.cache.sMaxAge");
                }}
              >
                Shared Max Age
              </FormLabel>
              <FormControl>
                <Input
                  type='number'
                  {...field}
                />
              </FormControl>
              <FormDescription>How long should the cache in server last.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </FormColumn>

      <FormField
        control={form.control}
        name='api.rootFolder'
        render={({ field, fieldState }) => (
          <FormItem>
            <FormLabel
              resetDisabled={!fieldState.isDirty}
              onFieldReset={() => {
                onResetField?.("api.rootFolder");
              }}
            >
              Root Folder ID
            </FormLabel>
            <FormControl>
              <Input
                placeholder='Unencrypted folder ID'
                {...field}
              />
            </FormControl>
            <FormDescription>Google Drive folder ID to be used as the root folder.</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name='api.sharedDrive'
        render={({ field, fieldState }) => (
          <FormItem>
            <div className='inline-flex w-full items-center justify-between gap-4 tablet:justify-start'>
              <FormLabel
                resetDisabled={!fieldState.isDirty}
                onFieldReset={() => {
                  onResetField?.("api.sharedDrive");
                  form.setValue("api.isTeamDrive", false);
                }}
              >
                Shared Drive ID
              </FormLabel>
              <Switch
                checked={form.getValues("api.isTeamDrive")}
                onCheckedChange={(value) => {
                  form.setValue("api.isTeamDrive", value);
                }}
              />
            </div>
            <FormControl>
              <Input
                placeholder={
                  form.watch("api.isTeamDrive") ? "Unencrypted shared drive ID" : "Switch to use shared drive"
                }
                disabled={!form.watch("api.isTeamDrive")}
                {...field}
              />
            </FormControl>
            <FormDescription>Google Drive Shared Drive ID.</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormColumn>
        <FormField
          control={form.control}
          name='api.itemsPerPage'
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel
                resetDisabled={!fieldState.isDirty}
                onFieldReset={() => {
                  onResetField?.("api.itemsPerPage");
                }}
              >
                Items Per Page
              </FormLabel>
              <FormControl>
                <Input
                  type='number'
                  {...field}
                />
              </FormControl>
              <FormDescription>Number of items to show before pagination.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='api.searchResult'
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel
                resetDisabled={!fieldState.isDirty}
                onFieldReset={() => {
                  onResetField?.("api.searchResult");
                }}
              >
                Search Result Limit
              </FormLabel>
              <FormControl>
                <Input
                  type='number'
                  {...field}
                />
              </FormControl>
              <FormDescription>Number of search results to show.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </FormColumn>
      <FormColumn column={3}>
        <FormField
          control={form.control}
          name='api.specialFile.banner'
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel
                resetDisabled={!fieldState.isDirty}
                onFieldReset={() => {
                  onResetField?.("api.specialFile.banner");
                }}
              >
                Banner File
              </FormLabel>
              <FormControl>
                <Input
                  placeholder='.banner.jpg'
                  {...field}
                />
              </FormControl>
              <FormDescription>Will be used as the banner if found in the folder.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='api.specialFile.password'
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel
                resetDisabled={!fieldState.isDirty}
                onFieldReset={() => {
                  onResetField?.("api.specialFile.password");
                }}
              >
                Password File
              </FormLabel>
              <FormControl>
                <Input
                  placeholder='.password'
                  {...field}
                />
              </FormControl>
              <FormDescription>Will be used to protect the folder.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='api.specialFile.readme'
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel
                resetDisabled={!fieldState.isDirty}
                onFieldReset={() => {
                  onResetField?.("api.specialFile.readme");
                }}
              >
                Readme File
              </FormLabel>
              <FormControl>
                <Input
                  placeholder='.readme.md'
                  {...field}
                />
              </FormControl>
              <FormDescription>Will be used as the description if found in the folder.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </FormColumn>
      <FormField
        control={form.control}
        name='api.hiddenFiles'
        render={({ fieldState }) => {
          const watch = form.watch("api.hiddenFiles");

          return (
            <FormItem>
              <FormLabel
                resetDisabled={!fieldState.isDirty}
                onFieldReset={() => {
                  onResetField?.("api.hiddenFiles");
                }}
              >
                Hidden Files
              </FormLabel>
              <div className='flex flex-col gap-2'>
                <div className='flex flex-col gap-2'>
                  {watch.length ? (
                    <>
                      <div className='flex grow flex-wrap gap-1'>
                        {watch.map((name, index) => (
                          <Badge
                            key={`name-${index}`}
                            className='cursor-pointer'
                            variant={"secondary"}
                            onClick={() => {
                              form.setValue(
                                "api.hiddenFiles",
                                watch.filter((_, i) => i !== index),
                                {
                                  shouldDirty: true,
                                },
                              );
                            }}
                          >
                            {name}
                          </Badge>
                        ))}
                        <span className='text-[0.8rem] text-muted-foreground'>Click to remove hidden file</span>
                      </div>
                    </>
                  ) : (
                    <span className='text-[0.8rem] text-destructive'>
                      All files including special files are visible.
                    </span>
                  )}
                </div>

                <div className='flex flex-col items-center gap-2 tablet:flex-row'>
                  <Input
                    placeholder='Press enter to add to hidden files'
                    value={inputHiddenFile}
                    onChange={(e) => setInputHiddenFile(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        onHiddenFileSubmit();
                      }
                    }}
                  />
                  <Button
                    size='sm'
                    type='button'
                    className='w-full tablet:w-fit'
                    onClick={onHiddenFileSubmit}
                  >
                    <Icon name='Plus' />
                    Add
                  </Button>
                </div>
                <div className='flex flex-wrap items-center gap-2'>
                  <Badge
                    variant={watch.includes(form.watch("api.specialFile.banner")) ? "outline" : "destructive"}
                    className={cn(
                      "inline-flex gap-1",
                      watch.includes(form.watch("api.specialFile.banner")) ? "cursor-not-allowed" : "cursor-pointer",
                    )}
                    onClick={() => {
                      if (watch.includes(form.watch("api.specialFile.banner"))) {
                        return;
                      }
                      form.setValue("api.hiddenFiles", [...watch, form.watch("api.specialFile.banner")]);
                    }}
                  >
                    <Icon
                      name={watch.includes(form.watch("api.specialFile.banner")) ? "Check" : "X"}
                      className={
                        watch.includes(form.watch("api.specialFile.banner"))
                          ? "stroke-green-600 dark:stroke-green-400"
                          : "stroke-destructive-foreground"
                      }
                    />
                    {watch.includes(form.watch("api.specialFile.banner"))
                      ? "Banner file is hidden"
                      : "Add banner file to the list"}
                  </Badge>

                  <Badge
                    variant={watch.includes(form.watch("api.specialFile.password")) ? "outline" : "destructive"}
                    className={cn(
                      "inline-flex gap-1",
                      watch.includes(form.watch("api.specialFile.password")) ? "cursor-not-allowed" : "cursor-pointer",
                    )}
                    onClick={() => {
                      if (watch.includes(form.watch("api.specialFile.password"))) {
                        return;
                      }
                      form.setValue("api.hiddenFiles", [...watch, form.watch("api.specialFile.password")]);
                    }}
                  >
                    <Icon
                      name={watch.includes(form.watch("api.specialFile.password")) ? "Check" : "X"}
                      className={
                        watch.includes(form.watch("api.specialFile.password"))
                          ? "stroke-green-600 dark:stroke-green-400"
                          : "stroke-destructive-foreground"
                      }
                    />
                    {watch.includes(form.watch("api.specialFile.password"))
                      ? "Password file is hidden"
                      : "Add password file to the list"}
                  </Badge>

                  <Badge
                    variant={watch.includes(form.watch("api.specialFile.readme")) ? "outline" : "destructive"}
                    className={cn(
                      "inline-flex gap-1",
                      watch.includes(form.watch("api.specialFile.readme")) ? "cursor-not-allowed" : "cursor-pointer",
                    )}
                    onClick={() => {
                      if (watch.includes(form.watch("api.specialFile.readme"))) {
                        return;
                      }
                      form.setValue("api.hiddenFiles", [...watch, form.watch("api.specialFile.readme")]);
                    }}
                  >
                    <Icon
                      name={watch.includes(form.watch("api.specialFile.readme")) ? "Check" : "X"}
                      className={
                        watch.includes(form.watch("api.specialFile.readme"))
                          ? "stroke-green-600 dark:stroke-green-400"
                          : "stroke-destructive-foreground"
                      }
                    />
                    {watch.includes(form.watch("api.specialFile.readme"))
                      ? "Readme file is hidden"
                      : "Add readme file to the list"}
                  </Badge>
                </div>
              </div>
              <FormDescription>Click the badge to add special files to the hidden files list.</FormDescription>
              <FormMessage />
            </FormItem>
          );
        }}
      />

      <FormField
        control={form.control}
        name='api.proxyThumbnail'
        render={({ field, fieldState }) => (
          <FormItem>
            <FormLabel
              resetDisabled={!fieldState.isDirty}
              onFieldReset={() => {
                onResetField?.("api.proxyThumbnail");
              }}
            >
              Proxy Thumbnail
            </FormLabel>
            <FormControl>
              <Select
                value={field.value ? "true" : "false"}
                onValueChange={(value) => field.onChange(value === "true")}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Select option' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='true'>Proxy Thumbnail (Recommended)</SelectItem>
                  <SelectItem value='false'>Use GDrive Thumbnail</SelectItem>
                </SelectContent>
              </Select>
            </FormControl>
            <FormDescription>Serve thumbnail through API route to avoid CORS issue.</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormColumn>
        <FormField
          control={form.control}
          name='api.streamMaxSize'
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel
                resetDisabled={!fieldState.isDirty}
                onFieldReset={() => {
                  onResetField?.("api.streamMaxSize");
                }}
              >
                Preview Max Size
              </FormLabel>
              <FormControl>
                <Input
                  type='number'
                  {...field}
                  min={0}
                  value={field.value / (1024 * 1024)}
                  onChange={(e) => {
                    const value = Number(e.target.value ?? "0");
                    form.setValue("api.streamMaxSize", value * 1024 * 1024, {
                      shouldDirty: true,
                    });
                  }}
                />
              </FormControl>
              <FormDescription>
                Maximum file size to be previewed in the browser in MB. Larger file won&apos;t be previewed.
                <br />
                <span className='text-destructive'>Will count towards the deployment bandwidth usage.</span>{" "}
                <b>Set to 0 to disable the limit</b>
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='api.maxFileSize'
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel
                resetDisabled={!fieldState.isDirty}
                onFieldReset={() => {
                  onResetField?.("api.maxFileSize");
                }}
              >
                Max File Size
              </FormLabel>
              <FormControl>
                <Input
                  type='number'
                  {...field}
                  min={0}
                  value={field.value / (1024 * 1024)}
                  onChange={(e) => {
                    const value = Number(e.target.value ?? "0");
                    form.setValue("api.maxFileSize", value * 1024 * 1024, {
                      shouldDirty: true,
                    });
                  }}
                />
              </FormControl>
              <FormDescription>
                Maximum file size that can be downloaded via API route. Larger file will be using GDrive link.
                <br />
                <span className='text-destructive'>Will count towards the deployment bandwidth usage.</span>{" "}
                <b>Set to 0 to disable the limit</b>
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='api.allowDownloadProtectedFile'
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel
                resetDisabled={!fieldState.isDirty}
                onFieldReset={() => {
                  onResetField?.("api.allowDownloadProtectedFile");
                }}
              >
                Download Protected File
              </FormLabel>
              <FormControl>
                <Select
                  value={field.value ? "true" : "false"}
                  onValueChange={(value) => field.onChange(value === "true")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select option' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='true'>Allow Download</SelectItem>
                    <SelectItem value='false'>Disallow Download (Recommended)</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormDescription>Allow download for file inside protected folder.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='api.temporaryTokenDuration'
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel
                resetDisabled={!fieldState.isDirty}
                onFieldReset={() => {
                  onResetField?.("api.temporaryTokenDuration");
                }}
              >
                Temporary Token Duration
              </FormLabel>
              <FormControl>
                <Input
                  type='number'
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Duration for temporary token in hours. Token will be used for protected folder download.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </FormColumn>
    </FormSection>
  );
}
