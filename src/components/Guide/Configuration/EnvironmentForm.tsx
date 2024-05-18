import { FormEvent, useState } from "react";
import toast from "react-hot-toast";
import { z } from "zod";

import { type ConfigInputs, ConfigurationHeader, ConfigurationInput } from "~/components/Guide/Configuration";
import { Separator } from "~/components/ui/separator";

import { fileLoadHelper } from "~/utils/fileLoadHelper";

import {
  ButtonState,
  ConfigurationCategory,
  ConfigurationKeys,
  ConfigurationValue,
  Schema_App_Configuration,
  Schema_ServiceAccount,
} from "~/types/schema";

import { GenerateAESKey, VerifyAESKey } from "actions";

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
    set: <T extends ConfigurationKeys<"environment">>(key: T, value: string) => void;
  };
  onReset: (category: ConfigurationCategory | "all") => void;
};

export default function ConfigEnvironment({ state: { get, set }, error, onReset }: Props) {
  const [encryptionState, setEncryptionState] = useState<ButtonState>("idle");
  const [serviceAuthState, setServiceAuthState] = useState<ButtonState>("idle");
  const [isRevealPassword, setIsRevealPassword] = useState<boolean>(false);

  const inputs: ConfigInputs<"environment", ConfigurationKeys<"environment">>[] = [
    {
      inputKey: "ENCRYPTION_KEY",
      title: "Encryption Key",
      description:
        "The key used to encrypt and decrypt sensitive data. Must be a alphanumeric string of 16 characters.",
      type: "text",
      required: true,
      action: {
        label: "Generate",
        state: encryptionState,
        icon: "RefreshCw",
        async onClick(e) {
          e.preventDefault();
          setEncryptionState("loading");
          error.set("ENCRYPTION_KEY", "");

          try {
            const key = await GenerateAESKey();
            const isValid = await VerifyAESKey("This is a test", key);
            if (!isValid) throw new Error("Invalid key generated, please try again.");

            set("environment", "ENCRYPTION_KEY", key);
          } catch (err) {
            const e = err as Error;
            console.error(e.message);
            toast.error(e.message);
            error.set("ENCRYPTION_KEY", e.message);
          } finally {
            setEncryptionState("idle");
          }
        },
      },
      value: get.environment.ENCRYPTION_KEY,
      onValueChange: (key, value) => set("environment", key, value),
      error: error.get.ENCRYPTION_KEY,
      onError: (err) => error.set("ENCRYPTION_KEY", err),
      validation: async (value) => {
        if (!value) return { success: false, message: "Encryption key is required" };
        if (value.length !== 16) return { success: false, message: "Encryption key must be 16 characters long" };

        const valid = await VerifyAESKey("This is a test", value);
        if (!valid) return { success: false, message: "Invalid encryption key" };
        return { success: true, message: "" };
      },
      placeholder: "16 alphanumeric characters secret key",
    },
    {
      inputKey: "GD_SERVICE_B64",
      title: "Google Drive Service Account",
      description: `The base64 encoded Google Drive Service Account JSON file.
To avoid error when input, please use the "Load JSON" button to load the file.`,
      type: "text",
      required: true,
      readOnly: true,
      action: {
        label: "Load JSON",
        state: serviceAuthState,
        icon: "Upload",
        async onClick(e) {
          e.preventDefault();
          setServiceAuthState("loading");

          try {
            fileLoadHelper({
              accept: ".json",
              onLoad(result) {
                const objectFile = JSON.parse(result);
                const parse = Schema_ServiceAccount.safeParse(objectFile);
                if (!parse.success)
                  return toast.error("Invalid Service Account JSON file. Please make sure the file is correct.");

                set("environment", "GD_SERVICE_B64", btoa(result));
                error.set("GD_SERVICE_B64", "");

                toast.success("Service Account JSON file has been loaded successfully.");
              },
            });
          } catch (err) {
            const e = err as Error;
            console.error(e.message);
            error.set("GD_SERVICE_B64", e.message);
            toast.error(e.message);
          } finally {
            setServiceAuthState("idle");
          }
        },
      },
      value: get.environment.GD_SERVICE_B64,
      onValueChange: (key, value) => set("environment", key, value),
      error: error.get.GD_SERVICE_B64,
      onError: (err) => error.set("GD_SERVICE_B64", err),
      placeholder: "Base64 encoded JSON file",
    },
    {
      inputKey: "NEXT_PUBLIC_DOMAIN",
      title: "Site Domain",
      description: `The domain for the site, without the protocol`,
      type: "text",
      value: get.environment.NEXT_PUBLIC_DOMAIN,
      onValueChange: (key, value) => set("environment", key, value),
      error: error.get.NEXT_PUBLIC_DOMAIN,
      onError: (err) => error.set("NEXT_PUBLIC_DOMAIN", err),
      placeholder: "e.g. drive-demo.mbaharip.com or mbaharip.com",
    },
    {
      inputKey: "SITE_PASSWORD",
      title: "Site Password",
      description: `The password to access the site
Only required if the site is set to private`,
      type: isRevealPassword ? "text" : "password",
      action: {
        label: isRevealPassword ? "Hide" : "Reveal",
        icon: isRevealPassword ? "EyeOff" : "Eye",
        onClick(e) {
          e.preventDefault();
          setIsRevealPassword((prev) => !prev);
        },
        state: "idle",
      },
      value: get.environment.SITE_PASSWORD,
      onValueChange: (key, value) => set("environment", key, value),
      error: error.get.SITE_PASSWORD,
      onError: (err) => error.set("SITE_PASSWORD", err),
      validation: async (value) => {
        if (get.site.privateIndex && !value) return { success: false, message: "Site password is required" };
        return { success: true, message: "" };
      },
      placeholder: "Not required if the site is public",
    },
  ];

  function onFileLoad() {
    fileLoadHelper({
      accept: ".env, .env.local, .env.development, .env.production",
      onLoad(result) {
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
        set("environment", "ENCRYPTION_KEY", env.ENCRYPTION_KEY);
        set("environment", "GD_SERVICE_B64", env.GD_SERVICE_B64);
        set("environment", "NEXT_PUBLIC_DOMAIN", env.NEXT_PUBLIC_DOMAIN);
        set("environment", "SITE_PASSWORD", env.SITE_PASSWORD);
        toast.success("Environment section has been loaded successfully.");
      },
    });
  }
  function onFormReset(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    onReset("environment");
    toast.success("Environment section has been reset to default values.");
  }

  return (
    <form
      className='flex w-full flex-col gap-3 py-3'
      onReset={onFormReset}
    >
      <ConfigurationHeader
        title='Environment Configuration'
        onLoad={onFileLoad}
      />
      <Separator />

      <div
        slot='inputs'
        className='flex flex-col gap-3'
      >
        {inputs.map((props, index) => (
          <ConfigurationInput<"environment", ConfigurationKeys<"environment">>
            key={props.inputKey}
            {...props}
          />
        ))}
      </div>
    </form>
  );
}
