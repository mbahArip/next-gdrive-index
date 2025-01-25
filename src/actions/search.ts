"use server";

import { type z } from "zod";
import { type ActionResponseSchema } from "~/types";

import { encryptionService, gdrive } from "~/lib/utils.server";

import { Schema_File } from "~/types/schema";

import config from "config";

import { GetFilePaths } from "./paths";

export async function SearchFiles(query: string): Promise<ActionResponseSchema<z.infer<typeof Schema_File>[]>> {
  const isSharedDrive = !!(config.apiConfig.isTeamDrive && config.apiConfig.sharedDrive);
  const decryptedSharedDrive = isSharedDrive
    ? await encryptionService.decrypt(config.apiConfig.sharedDrive!)
    : undefined;

  const filterName = config.apiConfig.hiddenFiles.map((item) => `not name = '${item}'`).join(" and ");
  const filterQuery: string = [...config.apiConfig.defaultQuery, `name contains '${query}'`, filterName].join(" and ");

  const { data } = await gdrive.files.list({
    q: filterQuery,
    fields: `files(${config.apiConfig.defaultField})`,
    orderBy: "name_natural desc",
    pageSize: config.apiConfig.searchResult,
    ...(decryptedSharedDrive && {
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
      driveId: decryptedSharedDrive,
      corpora: "drive",
    }),
  });
  if (!data.files?.length)
    return {
      success: true,
      message: "No files found",
      data: [],
    };

  const files: z.infer<typeof Schema_File>[] = [];
  for (const file of data.files) {
    files.push({
      encryptedId: await encryptionService.encrypt(file.id!),
      encryptedWebContentLink: file.webContentLink ? await encryptionService.encrypt(file.webContentLink) : undefined,
      name: file.name!,
      mimeType: file.mimeType!,
      trashed: file.trashed ?? false,
      modifiedTime: new Date(file.modifiedTime!).toLocaleDateString(),
      fileExtension: file.fileExtension ?? undefined,
      size: file.size ? Number(file.size) : undefined,
      thumbnailLink: file.thumbnailLink ?? undefined,
      imageMediaMetadata: file.imageMediaMetadata
        ? {
            width: Number(file.imageMediaMetadata.width),
            height: Number(file.imageMediaMetadata.height),
            rotation: Number(file.imageMediaMetadata.rotation ?? 0),
          }
        : undefined,
      videoMediaMetadata: file.videoMediaMetadata
        ? {
            durationMillis: Number(file.videoMediaMetadata.durationMillis),
            height: Number(file.videoMediaMetadata.height),
            width: Number(file.videoMediaMetadata.width),
          }
        : undefined,
    });
  }

  const parsed = Schema_File.array().safeParse(files);
  if (!parsed.success)
    return {
      success: false,
      message: "Failed to parse search results",
      error: parsed.error.message,
    };

  return {
    success: true,
    message: "Search completed",
    data: parsed.data,
  };
}

export async function GetSearchResultPath(id: string): Promise<ActionResponseSchema<string>> {
  const isSharedDrive = !!(config.apiConfig.isTeamDrive && config.apiConfig.sharedDrive);
  const decryptedId = await encryptionService.decrypt(id ?? config.apiConfig.rootFolder);

  const { data } = await gdrive.files.get({
    fileId: decryptedId,
    fields: "id,name,parents",
    supportsAllDrives: isSharedDrive,
  });
  if (!data) {
    return {
      success: false,
      message: "Failed to get file information",
      error: "Failed to get file information, might be due to invalid file ID!",
    };
  }

  const filePath = await GetFilePaths(data.name!, data.parents?.[0]);
  if (!filePath.success)
    return {
      success: false,
      message: "Failed to get file path",
      error: filePath.error,
    };

  return {
    success: true,
    message: "File path found",
    data: filePath.data,
  };
}
