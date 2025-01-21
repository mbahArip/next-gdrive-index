import { ChangeEvent, useRef, useState } from "react";
import { toast } from "sonner";

import { LoadingButton } from "~/components/ui/button";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";

import { GenerateServiceAccountB64 } from "~/actions/configuration";

import { FormProps, FormSection } from "./ConfiguratorPage";

export default function EnvironmentForm({ onResetField, form }: FormProps) {
  const serviceInputRef = useRef<HTMLInputElement>(null);
  const [serviceInputLoading, setServiceInputLoading] = useState<boolean>(false);

  function onLoadServiceAccount(e: ChangeEvent<HTMLInputElement>) {
    setServiceInputLoading(true);
    toast.loading("Processing service account file", {
      id: "service-account",
    });

    try {
      const file = e.target.files?.[0];
      if (!file) throw new Error("No file selected");

      const fr = new FileReader();
      fr.onload = async () => {
        if (!fr.result) throw new Error("Failed to read file content");
        const stringResult = typeof fr.result === "object" ? JSON.stringify(fr.result) : String(fr.result);
        const b64 = await GenerateServiceAccountB64(stringResult);
        if (!b64.success) throw new Error(b64.error);

        form.setValue("environment.GD_SERVICE_B64", b64.data);
        toast.success("Service account encoded", {
          id: "service-account",
        });
      };
      fr.readAsText(file);
    } catch (error) {
      const e = error as Error;
      console.error(e.message);
      toast.error("Failed to load service account file", {
        description: e.message,
        id: "service-account",
      });
    } finally {
      e.target.value = ""; // Reset file input wether success or not
      setServiceInputLoading(false);
    }
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
              <input
                ref={serviceInputRef}
                type='file'
                hidden
                accept='.json'
                onChange={onLoadServiceAccount}
              />
              <LoadingButton
                loading={serviceInputLoading}
                size={"sm"}
                onClick={() => serviceInputRef.current?.click()}
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
