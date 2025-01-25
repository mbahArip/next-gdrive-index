"use server";

import { type ActionResponseSchema } from "~/types";

import { encryptionService, gdrive } from "~/lib/utils.server";

import config from "config";

/**
 * Get file paths from the root folder to the file.
 * @param {string} fileName - The file name.
 * @param {string} parentId - The parent ID of the file.
 * @returns {string} - The file path.
 */
export async function GetFilePaths(fileName: string, parentId?: string): Promise<ActionResponseSchema<string>> {
  const decryptedRootId = await encryptionService.decrypt(config.apiConfig.rootFolder);
  if (!decryptedRootId)
    return { success: false, message: "Failed to decrypt root folder ID", error: "Failed to decrypt root folder ID" };

  const paths: string[] = [fileName];
  let parentIdTemp = parentId;
  while (parentIdTemp) {
    if (parentIdTemp === decryptedRootId) break;

    const { data } = await gdrive.files.get({
      fileId: parentIdTemp,
      fields: "id,name,parents",
      supportsAllDrives: config.apiConfig.isTeamDrive,
    });
    if (!data.name) break;

    paths.unshift(data.name);
    parentIdTemp = data.parents?.[0];
  }

  return { success: true, message: "File paths retrieved", data: paths.join("/") };
}

type PathFetch = {
  index: number;
  path: string;
  data: {
    id: string;
    parents?: string;
    mimeType: string;
  }[];
};
/**
 * Validate paths and return the ID of each path.
 * @param paths - The paths to validate.
 * @returns {ActionResponseSchema<{ id: string; path: string; mimeType: string; }[]>} - The validated paths.
 */
export async function ValidatePaths(
  paths: string[],
): Promise<ActionResponseSchema<{ id: string; path: string; mimeType: string }[]>> {
  const isSharedDrive = !!(config.apiConfig.isTeamDrive && config.apiConfig.sharedDrive);
  const decryptedRootId = await encryptionService.decrypt(config.apiConfig.rootFolder);
  const decryptedSharedDrive = isSharedDrive
    ? await encryptionService.decrypt(config.apiConfig.sharedDrive!)
    : undefined;

  const promises: Promise<PathFetch | null>[] = [];
  for (const [index, path] of paths.entries()) {
    const list = gdrive.files
      .list({
        q: `name = '${decodeURIComponent(path)}' and trashed = false`,
        fields: "files(id, name, mimeType, parents)",
        ...(decryptedSharedDrive && {
          supportsAllDrives: true,
          includeItemsFromAllDrives: true,
          driveId: decryptedSharedDrive,
          corpora: "drive",
        }),
      })
      .then(({ data }) => {
        if (!data.files?.length) return null;

        const object: PathFetch = {
          index,
          path,
          data: data.files.map((file) => ({
            id: file.id!,
            parents: file.parents?.[0],
            mimeType: file.mimeType!,
          })),
        };
        return object;
      });
    promises.push(list);
  }

  const pathData = await Promise.all(promises);

  // Try to find index of invalid path (null value from promise)
  // If found, return error message
  const invalidPathIndex = pathData.findIndex((path) => !path);
  if (invalidPathIndex !== -1)
    return {
      success: false,
      message: "Invalid path",
      error: `Failed to find path: ${paths[invalidPathIndex]}`,
    };
  const filteredPathData = pathData.filter((path) => path) as PathFetch[];

  // Validate each path
  let isValid = true;
  let invalidPath: string | undefined;
  const validatedPaths: PathFetch[] = [];

  for (const path of filteredPathData) {
    if (!isValid) break;
    if (!path.data.length) {
      isValid = false;
      invalidPath = path.path;
      break;
    }

    /**
     * Check for current path index
     * If it's 0 / the first path, make sure the parent is the root folder
     * If it's not, make sure the parent is the previous path's ID
     */
    for (const item of path.data) {
      if (path.index === 0) {
        if (item.parents !== decryptedRootId && item.parents !== decryptedSharedDrive) break;
        validatedPaths.push(path);
      } else {
        const previousPath = validatedPaths[path.index - 1];
        if (!previousPath) break;
        if (item.parents !== previousPath.data?.[0]?.id) break;
        validatedPaths.push(path);
      }
    }
  }
  if (validatedPaths.length !== filteredPathData.length) {
    isValid = false;
    invalidPath = filteredPathData[validatedPaths.length]?.path;
  }
  if (!isValid)
    return {
      success: false,
      message: "Invalid path",
      error: invalidPath ? `Failed to validate path: ${invalidPath}` : "Failed when validating paths",
    };

  const response: { path: string; id: string; mimeType: string }[] = [];
  for (const item of validatedPaths) {
    response.push({
      id: await encryptionService.encrypt(item.data[0]?.id ?? ""),
      path: decodeURIComponent(item.path),
      mimeType: item.data[0]?.mimeType ?? "",
    });
  }

  return {
    success: true,
    message: "Paths validated",
    data: response,
  };
}
