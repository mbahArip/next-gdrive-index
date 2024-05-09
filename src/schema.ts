import { icons } from "lucide-react";
import { z } from "zod";

export const Schema_Breadcrumb = z.object({
  label: z.string(),
  href: z.string().optional(),
});

export const Schema_File = z.object({
  mimeType: z.string(),
  encryptedId: z.string(),
  name: z.string(),
  trashed: z.boolean(),
  modifiedTime: z.string(),
  fileExtension: z.string().optional(),
  encryptedWebContentLink: z.string().optional().nullable(),
  size: z.coerce.number().optional(),
  thumbnailLink: z.string().url().optional().nullable(),
  imageMediaMetadata: z
    .object({
      width: z.coerce.number(),
      height: z.coerce.number(),
      rotation: z.coerce.number().optional(),
    })
    .optional()
    .nullable(),
  videoMediaMetadata: z
    .object({
      width: z.coerce.number(),
      height: z.coerce.number(),
      durationMillis: z.coerce.number(),
    })
    .optional()
    .nullable(),
});

export const Schema_Old_Config = z.object({
  version: z.literal("1.0.0"),
  basePath: z.string(),
  masterKey: z.string(),
  cacheControl: z.string(),

  apiConfig: z.object({
    rootFolder: z.string(),
    isTeamDrive: z.boolean(),
    sharedDrive: z.string().optional(),
    defaultQuery: z.array(z.string()),
    defaultField: z.string(),
    defaultOrder: z.string(),
    itemsPerPage: z.number().positive(),
    searchRsult: z.number().positive(),

    specialFile: z.object({
      password: z.string(),
      readme: z.string(),
      banner: z.string(),
    }),
    hiddenFiles: z.array(z.string()),

    allowDownloadProtectedFile: z.boolean(),
    temporaryTokenDuration: z.number().positive(),
    maxFileSize: z.number().positive(),
  }),

  siteConfig: z.object({
    siteName: z.string(),
    siteDescription: z.string(),
    siteIcon: z.string(),
    favIcon: z.string(),
    twitterHandle: z.string().optional().default("@__mbaharip__"),

    defaultAccentColor: z.string(),

    privateIndex: z.boolean().optional().default(false),

    navbarItems: z.array(
      z.object({
        icon: z.string(),
        name: z.string(),
        href: z.string(),
        external: z.boolean().optional().default(false),
      }),
    ),
  }),
});

export const Schema_Config_API = z
  .object({
    rootFolder: z.string(),
    isTeamDrive: z.boolean(),
    sharedDrive: z.string().optional(),
    defaultQuery: z.array(z.string()),
    defaultField: z.string(),
    defaultOrder: z.string(),
    itemsPerPage: z.number().positive(),
    searchResult: z.number().positive(),
    proxyThumbnail: z.boolean(),
    streamMaxSize: z.number(),

    specialFile: z.object({
      password: z.string(),
      readme: z.string(),
      banner: z.string(),
    }),
    hiddenFiles: z.array(z.string()),

    allowDownloadProtectedFile: z.boolean(),
    temporaryTokenDuration: z.number().positive(),
    maxFileSize: z.number().positive(),
  })
  .refine(
    (data) => {
      if (data.isTeamDrive && !data.sharedDrive) return false;
    },
    { message: "sharedDrive is required when isTeamDrive is true" },
  );
export const Schema_Config_Site = z.object({
  siteName: z.string(),
  siteNameTemplate: z.string().optional().default("%s"),
  siteDescription: z.string(),
  siteIcon: z.string(),
  siteAuthor: z.string().optional().default("mbaharip"),
  favIcon: z.string(),
  robots: z.string().optional().default("noindex, nofollow"),
  twitterHandle: z.string().optional().default("@__mbaharip__"),

  showFileExtension: z.boolean().optional().default(false),

  footer: z.string().array().optional(),

  privateIndex: z.boolean().optional().default(false),
  breadcrumbMax: z.number(),

  toaster: z
    .object({
      position: z.enum([
        "top-left",
        "top-right",
        "bottom-left",
        "bottom-right",
      ]),
      duration: z.number().positive(),
    })
    .optional()
    .default({
      position: "top-right",
      duration: 5000,
    }),

  navbarItems: z.array(
    z.object({
      icon: z.enum(Object.keys(icons) as [keyof typeof icons]),
      name: z.string(),
      href: z.string(),
      external: z.boolean().optional().default(false),
    }),
  ),
  supports: z.array(
    z.object({
      name: z.string(),
      currency: z.string(),
      href: z.string(),
    }),
  ),
});
export const Schema_App_Configuration_Env = z.object({
  GD_SERVICE_B64: z.string(),
  ENCRYPTION_KEY: z.string(),
  SITE_PASSWORD: z.string().optional(),
  NEXT_PUBLIC_DOMAIN: z.string().optional(),
});

export const Schema_Config = z.object({
  version: z.string(),
  basePath: z.string(),
  cacheControl: z.string(),
  showDeployGuide: z.boolean(),

  apiConfig: Schema_Config_API,

  siteConfig: Schema_Config_Site,
});

export const Schema_ServiceAccount = z.object({
  type: z.literal("service_account"),
  project_id: z.string(),
  private_key_id: z.string(),
  private_key: z.string(),
  client_email: z.string().email("Invalid client_email field"),
  client_id: z.string(),
  auth_uri: z.string().url(),
  token_uri: z.string().url(),
  auth_provider_x509_cert_url: z.string().url(),
  client_x509_cert_url: z.string().url(),
  universe_domain: z.string().optional(),
});

export const Schema_App_Configuration = z.object({
  environment: Schema_App_Configuration_Env,
  api: Schema_Config_API,
  site: Schema_Config_Site,
});

export type ConfigurationCategory = keyof z.infer<
  typeof Schema_App_Configuration
>;
export type ConfigurationKeys<
  T extends keyof z.infer<typeof Schema_App_Configuration>,
> = keyof z.infer<typeof Schema_App_Configuration>[T];
export type ConfigurationValue<
  T extends keyof z.infer<typeof Schema_App_Configuration>,
  K extends keyof z.infer<typeof Schema_App_Configuration>[T],
> = z.infer<typeof Schema_App_Configuration>[T][K];

export type ConfigState = "idle" | "loading";

export const Schema_Theme = z.object({
  "background": z.string(),
  "foreground": z.string(),
  "card": z.string(),
  "card-foreground": z.string(),
  "popover": z.string(),
  "popover-foreground": z.string(),
  "primary": z.string(),
  "primary-foreground": z.string(),
  "secondary": z.string(),
  "secondary-foreground": z.string(),
  "muted": z.string(),
  "muted-foreground": z.string(),
  "accent": z.string(),
  "accent-foreground": z.string(),
  "destructive": z.string(),
  "destructive-foreground": z.string(),
  "border": z.string(),
  "input": z.string(),
  "ring": z.string(),
  "radius": z.string(),
});
export type ThemeKeys = keyof z.infer<typeof Schema_Theme>;
