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
      rotation: z.coerce.number(),
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
