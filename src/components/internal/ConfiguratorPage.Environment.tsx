"use client";

import { useState } from "react";
import { toast } from "sonner";

import { LoadingButton } from "~/components/ui/button";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";

import { type PickFileResponse, pickFile } from "~/lib/configurationHelper";

import { GenerateServiceAccountB64 } from "~/actions/configuration";

import { type FormProps, FormSection } from "./ConfiguratorPage";

export default function EnvironmentForm({ onResetField, form }: FormProps) {
  const [isLoadServiceLoading, setLoadServiceLoading] = useState<boolean>(false);

  async function onLoadServiceAccount(response: PickFileResponse) {
    const id = `service-account-${Date.now()}`;
    toast.loading("Waiting for file...", {
      id,
      duration: 0,
    });
    if (!response.success) {
      toast.error("Failed to load service account file", {
        id,
        description: response.details.length ? (
          <pre className='w-full overflow-auto whitespace-pre-wrap font-mono text-xs'>
            {response.details.join("\n")}
          </pre>
        ) : undefined,
      });
      setLoadServiceLoading(false);
      return;
    }

    toast.loading("Processing service account file", {
      id,
    });
    const data = await GenerateServiceAccountB64(response.data);
    if (!data.success) {
      toast.error("Failed to encode service account", {
        id,
        description: <pre className='w-full overflow-auto whitespace-pre-wrap font-mono text-xs'>{data.error}</pre>,
      });
      setLoadServiceLoading(false);
      return;
    }

    form.setValue("environment.GD_SERVICE_B64", data.data);
    toast.success("Service account encoded", {
      id,
    });
    setLoadServiceLoading(false);
  }

  return (
    <FormSection
      title='Environment'
      description='Configure your environment variables'
    >
      <FormField
        control={form.control}
        name='environment.GD_SERVICE_B64'
        render={({ field, fieldState }) => (
          <FormItem>
            <FormLabel
              resetDisabled={!fieldState.isDirty}
              onFieldReset={() => {
                onResetField?.("environment.GD_SERVICE_B64");
              }}
            >
              Service Account
            </FormLabel>
            <div className='flex flex-col gap-2 tablet:flex-row tablet:items-center tablet:justify-between'>
              <FormControl>
                <Input
                  placeholder='Encoded base64 will be here'
                  readOnly
                  {...field}
                />
              </FormControl>
              <LoadingButton
                loading={isLoadServiceLoading}
                size={"sm"}
                onClick={() => {
                  setLoadServiceLoading(true);

                  pickFile({
                    accept: ".json",
                    async onLoad(response) {
                      await onLoadServiceAccount(response);
                    },
                  });
                }}
                type='button'
              >
                Load JSON
              </LoadingButton>
            </div>
            <FormDescription>Load your service account JSON file to get the base64 encoded string.</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name='environment.ENCRYPTION_KEY'
        render={({ field, fieldState }) => (
          <FormItem>
            <FormLabel
              resetDisabled={!fieldState.isDirty}
              onFieldReset={() => {
                onResetField?.("environment.ENCRYPTION_KEY");
              }}
            >
              Encryption Key
            </FormLabel>
            <FormControl>
              <Input
                type='password'
                placeholder='jugemu-jugemu-gokō-no-surikire-kaijarisuigyo-no-suigyōmatsu-unraimatsu-fūraimatsu-kūneru-tokoro-ni-sumu-tokoro-yaburakōji-no-burakōji-paipopaipo-paiponoshūringan-shūringanno-gūrindai-gūrindaino-ponpokopīno-ponpokonāno-chōkyūmei-no-chōsuke'
                {...field}
              />
            </FormControl>
            <FormDescription>Secret encryption key to protect sensitive data.</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name='environment.SITE_PASSWORD'
        render={({ field, fieldState }) => (
          <FormItem>
            <FormLabel
              resetDisabled={!fieldState.isDirty}
              onFieldReset={() => {
                onResetField?.("environment.SITE_PASSWORD");
              }}
            >
              Private Index Password
            </FormLabel>
            <FormControl>
              <Input
                type='password'
                placeholder="I swear it's not admin123"
                {...field}
              />
            </FormControl>
            <FormDescription>Will be used if you set the index to private.</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name='environment.NEXT_PUBLIC_DOMAIN'
        render={({ field, fieldState }) => (
          <FormItem>
            <FormLabel
              resetDisabled={!fieldState.isDirty}
              onFieldReset={() => {
                onResetField?.("environment.NEXT_PUBLIC_DOMAIN");
              }}
            >
              Site Domain
            </FormLabel>
            <FormControl>
              <Input
                placeholder='acme.com / hey.acme.com'
                {...field}
              />
            </FormControl>
            <FormDescription>
              The domain for the site, without the protocol.
              <br />
              <b>Needed if you deploy outside of Vercel.</b>
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </FormSection>
  );
}
