"use server";

import { type AsyncZippable, strToU8, zipSync } from "fflate";
import { type z } from "zod";
import { type ActionResponseSchema } from "~/types";

import {
  configurationTemplate,
  environmentTemplate,
  parseEnvironment,
  parseVersion1Config,
  parseVersion2Config,
} from "~/lib/configurationHelper";
import { base64Decode, base64Encode, encryptionService } from "~/lib/utils.server";

import { type Schema_App_Configuration, type Schema_App_Configuration_Env } from "~/types/schema";

export async function GenerateServiceAccountB64(serviceAccount: string): Promise<ActionResponseSchema<string>> {
  const b64 = base64Encode(serviceAccount, "standard");

  // Test
  const decoded = base64Decode(b64, "standard");
  if (decoded === null) {
    return {
      success: false,
      message: "Failed to decode the service account",
      error: "Something went wrong while encoding the service account, please try again",
    };
  }
  if (decoded !== serviceAccount) {
    return {
      success: false,
      message: "Encode failed to match the original string",
      error: "Something went wrong while testing the encoding, please try again",
    };
  }

  return {
    success: true,
    message: "Service account generated",
    data: b64,
  };
}

export async function ProcessEnvironmentConfig(
  configuration: string,
): Promise<ActionResponseSchema<z.infer<typeof Schema_App_Configuration_Env>>> {
  const data = parseEnvironment(configuration);
  if ("message" in data && "details" in data) {
    return {
      success: false,
      message: data.message,
      error: data.details.join("\n"),
    };
  }
  // Verify service account
  const serviceAccount = data.GD_SERVICE_B64;
  const decoded = base64Decode(serviceAccount, "standard");
  if (decoded === null) {
    data.GD_SERVICE_B64 = "";
    return {
      success: true,
      data,
      message: "Environment loaded, but service account is invalid",
    };
  }

  return {
    success: true,
    message: "Environment loaded",
    data,
  };
}

export async function ProcessConfiguration(
  configuration: string,
  version: "v1" | "v2" | "latest",
): Promise<ActionResponseSchema<Omit<z.infer<typeof Schema_App_Configuration>, "environment">>> {
  const data = version === "v1" ? parseVersion1Config(configuration) : parseVersion2Config(configuration);
  if ("message" in data && "details" in data) {
    return {
      success: false,
      message: data.message,
      error: data.details.join("\n"),
    };
  }

  return {
    success: true,
    message: "Configuration loaded, but folder ID are not processed",
    data,
  };
}

export async function GenerateConfiguration(
  values: z.infer<typeof Schema_App_Configuration>,
): Promise<ActionResponseSchema<{ configuration: string; env: string; zip: Blob }>> {
  const configurationMap: { key: string; value: string }[] = [
    {
      key: "version",
      value: values.version,
    },
    {
      key: "showGuideButton",
      value: values.site.guideButton.toString(),
    },
    {
      key: "cacheControl",
      value: `${values.api.cache.public ? "public, " : ""}max-age=${values.api.cache.maxAge}, s-maxage=${
        values.api.cache.sMaxAge
      }${values.api.cache.staleWhileRevalidate ? ", stale-while-revalidate" : ""}`,
    },
    {
      key: "api.rootFolder",
      value: await encryptionService.encrypt(values.api.rootFolder, values.environment.ENCRYPTION_KEY),
    },
    {
      key: "api.isTeamDrive",
      value: values.api.isTeamDrive.toString(),
    },
    {
      key: "api.sharedDrive",
      value: values.api.sharedDrive
        ? await encryptionService.encrypt(values.api.sharedDrive, values.environment.ENCRYPTION_KEY)
        : "",
    },
    {
      key: "api.itemsPerPage",
      value: values.api.itemsPerPage.toString(),
    },
    {
      key: "api.searchResult",
      value: values.api.searchResult.toString(),
    },
    {
      key: "api.specialFile.password",
      value: values.api.specialFile.password,
    },
    {
      key: "api.specialFile.readme",
      value: values.api.specialFile.readme,
    },
    {
      key: "api.specialFile.banner",
      value: values.api.specialFile.banner,
    },
    {
      key: "api.hiddenFiles",
      value: `[${values.api.hiddenFiles.map((file) => `"${file}"`).join(", ")}]`,
    },
    {
      key: "api.proxyThumbnail",
      value: values.api.proxyThumbnail.toString(),
    },
    {
      key: "api.streamMaxSize",
      value: values.api.streamMaxSize.toString(),
    },
    {
      key: "api.maxFileSize",
      value: values.api.maxFileSize.toString(),
    },
    {
      key: "api.allowDownloadProtectedFile",
      value: values.api.allowDownloadProtectedFile.toString(),
    },
    {
      key: "api.temporaryTokenDuration",
      value: values.api.temporaryTokenDuration.toString(),
    },
    {
      key: "site.siteName",
      value: values.site.siteName,
    },
    {
      key: "site.siteNameTemplate",
      value: values.site.siteNameTemplate,
    },
    {
      key: "site.siteDescription",
      value: values.site.siteDescription,
    },
    {
      key: "site.siteAuthor",
      value: values.site.siteAuthor,
    },
    {
      key: "site.robots",
      value: values.site.robots,
    },
    {
      key: "site.twitterHandle",
      value: values.site.twitterHandle,
    },
    {
      key: "site.showFileExtension",
      value: values.site.showFileExtension.toString(),
    },
    {
      key: "site.privateIndex",
      value: values.site.privateIndex.toString(),
    },
    {
      key: "site.breadcrumbMax",
      value: values.site.breadcrumbMax.toString(),
    },
    {
      key: "site.toaster.position",
      value: values.site.toaster.position,
    },
    {
      key: "site.toaster.duration",
      value: values.site.toaster.duration.toString(),
    },
    {
      key: "site.navbarItems",
      value: JSON.stringify(values.site.navbarItems, null, 2),
    },
    {
      key: "site.supports",
      value: JSON.stringify(values.site.supports, null, 2),
    },
    {
      key: "site.footer",
      value: JSON.stringify(values.site.footer, null, 2),
    },
  ];
  let configuration = configurationTemplate;
  for (const { key, value } of configurationMap) {
    configuration = configuration.replace(`{{ ${key} }}`, value);
  }

  const envMap: { key: string; value: string }[] = [
    {
      key: "serviceAccount",
      value: values.environment.GD_SERVICE_B64,
    },
    {
      key: "key",
      value: values.environment.ENCRYPTION_KEY,
    },
    {
      key: "password",
      value: values.environment.SITE_PASSWORD ?? "",
    },
    {
      key: "domain",
      value: values.environment.NEXT_PUBLIC_DOMAIN ?? "",
    },
  ];
  let env = environmentTemplate;
  for (const { key, value } of envMap) {
    env = env.replace(`{{ ${key} }}`, value);
  }

  const struct: AsyncZippable = {
    ".env": [
      strToU8(env),
      {
        level: 9,
      },
    ],
    "gIndex.config.ts": [
      strToU8(configuration),
      {
        level: 9,
      },
    ],
  };
  const zip = zipSync(struct);

  return {
    success: true,
    message: "Configuration generated",
    data: {
      configuration,
      env,
      zip: new Blob([zip], { type: "application/zip" }),
    },
  };
}
