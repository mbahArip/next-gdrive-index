"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { z } from "zod";
import {
  ConfigState,
  ConfigurationCategory,
  ConfigurationKeys,
  ConfigurationValue,
  Schema_App_Configuration,
  Schema_ServiceAccount,
} from "~/schema";

import { GenerateAESKey, VerifyAESKey } from "~/app/actions";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Separator } from "~/components/ui/separator";

import ConfigInput from "./@form.input";

type Props = {
  state: {
    get: z.input<typeof Schema_App_Configuration>;
    set: <
      T extends ConfigurationCategory = ConfigurationCategory,
      K extends ConfigurationKeys<T> = ConfigurationKeys<T>,
    >(
      category: T,
      key: K,
      value: ConfigurationValue<T, K>,
    ) => void;
  };
  error: {
    get: Partial<Record<ConfigurationKeys<"environment">, string>>;
    set: <T extends ConfigurationKeys<"environment">>(
      key: T,
      value: string,
    ) => void;
  };
  onReset: (category: ConfigurationCategory) => void;
};
export default function EnvironmentConfig({
  state: { get, set },
  error,
  onReset,
}: Props) {
  const [encryptionState, setEncryptionState] = useState<ConfigState>("idle");
  const [gdServiceState, setGdServiceState] = useState<ConfigState>("idle");
  const [revealPassword, setRevealPassword] = useState<boolean>(false);

  return (
    <form
      className='flex w-full flex-col gap-3 py-3'
      onReset={(e) => {
        e.preventDefault();
        onReset("environment");
      }}
    >
      <div
        slot='header'
        className='flex flex-col gap-3 tablet:flex-row tablet:items-center tablet:justify-between'
      >
        <h4>Environment</h4>
        <div className='flex w-full items-center gap-3 tablet:w-fit'>
          <Button
            variant={"outline"}
            size={"sm"}
            onClick={(e) => {
              e.preventDefault();

              try {
                const fileInput = document.createElement("input");
                fileInput.type = "file";
                fileInput.accept =
                  ".env, .env.local, .env.development, .env.production";
                fileInput.onchange = async (fileEvent) => {
                  const file = (fileEvent.target as HTMLInputElement)
                    .files?.[0];
                  if (!file) return toast.error("No file selected");

                  const reader = new FileReader();
                  reader.onload = async (read) => {
                    const result = read.target?.result as string;
                    if (!result) return toast.error("Failed to read file");
                    const lines = result.split("\n");
                    const env: Record<string, string> = {};
                    for (const line of lines) {
                      const [key, value] = line.split("=");
                      if (!key || !value) continue;
                      const formattedValue = value
                        ?.replace(/"/g, "")
                        .replace(/'/g, "")
                        .replace(/\\/g, "")
                        .replace(/\r/g, "")
                        .trim();
                      env[key] = formattedValue;
                    }
                    set(
                      "environment",
                      "GD_SERVICE_B64",
                      env.GD_SERVICE_B64 || "",
                    );
                    set(
                      "environment",
                      "ENCRYPTION_KEY",
                      env.ENCRYPTION_KEY || "",
                    );
                    set(
                      "environment",
                      "SITE_PASSWORD",
                      env.SITE_PASSWORD || "",
                    );
                    set(
                      "environment",
                      "NEXT_PUBLIC_DOMAIN",
                      env.NEXT_PUBLIC_DOMAIN || "",
                    );
                    fileInput.value = "";
                    toast.success("Environment loaded from file");
                  };
                  reader.readAsText(file);
                };
                fileInput.click();
              } catch (error) {
                const e = error as Error;
                console.error(e);
                toast.error(e.message);
              }
            }}
          >
            Load from file
          </Button>
          <Button
            type='reset'
            variant={"destructive"}
            size={"sm"}
          >
            Reset
          </Button>
        </div>
      </div>

      <Separator />

      <div
        slot='inputs'
        className='flex flex-col gap-3'
      >
        <ConfigInput<ConfigurationKeys<"environment">>
          key='ENCRYPTION_KEY'
          title='Encryption Key'
          description='The encryption key for the site, must be a alphanumeric string without spaces'
          error={error.get.ENCRYPTION_KEY}
          required
          action={{
            label: "Generate",
            async onClick(e) {
              e.preventDefault();
              setEncryptionState("loading");
              error.set("ENCRYPTION_KEY", "");

              try {
                const keyStr = await GenerateAESKey();
                const valid = await VerifyAESKey("This is a test", keyStr);
                if (!valid)
                  throw new Error("Invalid key generated, please try again");

                set("environment", "ENCRYPTION_KEY", keyStr);
              } catch (err) {
                const e = err as Error;
                console.error(e);
                error.set("ENCRYPTION_KEY", e.message);
                toast.error(e.message);
              } finally {
                setEncryptionState("idle");
              }
            },
            state: encryptionState,
          }}
        >
          <Input
            id='ENCRYPTION_KEY'
            name='ENCRYPTION_KEY'
            value={get.environment.ENCRYPTION_KEY}
            onChange={(e) => {
              if (error.get.ENCRYPTION_KEY) {
                error.set("ENCRYPTION_KEY", "");
              }
              set("environment", "ENCRYPTION_KEY", e.target.value);
            }}
            onBlur={async () => {
              try {
                const value = get.environment.ENCRYPTION_KEY;
                error.set("ENCRYPTION_KEY", "");

                if (!value) throw new Error("Encryption key is required");

                if (value.includes(" "))
                  throw new Error("Encryption key must not contain spaces");

                const valid = await VerifyAESKey("This is a test", value);
                if (!valid)
                  throw new Error(
                    "The encryption key is invalid, please generate a new one",
                  );
              } catch (err) {
                const e = err as Error;
                error.set("ENCRYPTION_KEY", e.message);
              }
            }}
          />
        </ConfigInput>

        <ConfigInput<ConfigurationKeys<"environment">>
          key='GD_SERVICE_B64'
          title='Google Drive Service Account'
          description={`The base64 encoded Google Drive Service Account JSON file       
To avoid error when inputting, please use the "Load JSON" button to load the file directly`}
          error={error.get.GD_SERVICE_B64}
          required
          action={{
            label: "Load JSON",
            async onClick(e) {
              e.preventDefault();
              setGdServiceState("loading");

              try {
                const fileInput = document.createElement("input");
                fileInput.type = "file";
                fileInput.accept = ".json";
                fileInput.onchange = async (fileEvent) => {
                  const file = (fileEvent.target as HTMLInputElement)
                    .files?.[0];
                  if (!file) return toast.error("No file selected");

                  const reader = new FileReader();
                  reader.onload = async (readerEvent) => {
                    const result = readerEvent.target?.result as string;
                    if (!result) return toast.error("Failed to read file");

                    const objectFile = JSON.parse(result);
                    const parse = Schema_ServiceAccount.safeParse(objectFile);
                    if (!parse.success)
                      return toast.error(
                        "Invalid Service Account JSON, please select a valid Google Drive Service Account JSON file",
                      );

                    set("environment", "GD_SERVICE_B64", btoa(result));
                    error.set("GD_SERVICE_B64", "");

                    toast.success(
                      "Google Drive Service Account JSON file loaded",
                    );
                    fileInput.value = "";
                  };
                  reader.readAsText(file);
                };
                fileInput.click();
              } catch (err) {
                const e = err as Error;
                console.error(e);
                error.set("GD_SERVICE_B64", e.message);
                toast.error(e.message);
              } finally {
                setGdServiceState("idle");
              }
            },
            state: gdServiceState,
          }}
        >
          <Input
            id='GD_SERVICE_B64'
            name='GD_SERVICE_B64'
            value={get.environment.GD_SERVICE_B64}
            readOnly
            onChange={(e) => {
              if (error.get.GD_SERVICE_B64) {
                error.set("GD_SERVICE_B64", "");
              }
              set("environment", "GD_SERVICE_B64", e.target.value);
            }}
          />
        </ConfigInput>

        <ConfigInput<ConfigurationKeys<"environment">>
          key='NEXT_PUBLIC_DOMAIN'
          title='Domain'
          description={`The domain for the site, without the protocol
(e.g. drive-demo.mbaharip.com or mbaharip.com)`}
          error={error.get.NEXT_PUBLIC_DOMAIN}
        >
          <Input
            id='NEXT_PUBLIC_DOMAIN'
            name='NEXT_PUBLIC_DOMAIN'
            value={get.environment.NEXT_PUBLIC_DOMAIN}
            onChange={(e) => {
              if (error.get.NEXT_PUBLIC_DOMAIN) {
                error.set("NEXT_PUBLIC_DOMAIN", "");
              }
              set("environment", "NEXT_PUBLIC_DOMAIN", e.target.value);
            }}
            onBlur={async () => {
              try {
                error.set("NEXT_PUBLIC_DOMAIN", "");
              } catch (err) {
                const e = err as Error;
                error.set("NEXT_PUBLIC_DOMAIN", e.message);
              }
            }}
          />
        </ConfigInput>

        <ConfigInput<ConfigurationKeys<"environment">>
          key='SITE_PASSWORD'
          title='Site Password'
          description='The password to access the site'
          error={error.get.SITE_PASSWORD}
          required={get.site.privateIndex}
          action={{
            label: revealPassword ? "Hide" : "Reveal",
            onClick(e) {
              e.preventDefault();
              setRevealPassword((prev) => !prev);
            },
            state: "idle",
          }}
        >
          <Input
            id='SITE_PASSWORD'
            name='SITE_PASSWORD'
            type={revealPassword ? "text" : "password"}
            value={get.environment.SITE_PASSWORD}
            onChange={(e) => {
              if (error.get.SITE_PASSWORD) {
                error.set("SITE_PASSWORD", "");
              }
              set("environment", "SITE_PASSWORD", e.target.value);
            }}
            onBlur={async () => {
              try {
                error.set("SITE_PASSWORD", "");
                if (get.site.privateIndex && !get.environment.SITE_PASSWORD) {
                  throw new Error(
                    "Site Password is required when Private Index is enabled",
                  );
                }
              } catch (err) {
                const e = err as Error;
                console.error(e);
                error.set("SITE_PASSWORD", e.message);
              }
            }}
          />
        </ConfigInput>
      </div>
    </form>
  );
}
