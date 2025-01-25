"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { COOKIES_NAME, COOKIES_OPTIONS } from "~/constant";
import { type ActionResponseSchema } from "~/types";

import { toUrlPath } from "~/lib/utils";
import { encryptionService, gdriveNoCache } from "~/lib/utils.server";

import config from "config";

/**
 * Remove all saved passwords.
 */
export async function ClearSavedPasswords(): Promise<ActionResponseSchema> {
  const store = await cookies();
  if (store.has(COOKIES_NAME.indexPassword)) {
    store.delete(COOKIES_NAME.indexPassword);
  }
  if (store.has(COOKIES_NAME.folderPassword)) {
    store.delete(COOKIES_NAME.folderPassword);
  }
  revalidatePath("/", "layout");

  return {
    success: true,
    message: "All saved passwords cleared",
    data: undefined,
  };
}

/**
 * Check if the password of the index is correct.
 * Only used if the index is password-protected.
 */
export async function CheckIndexPassword(): Promise<ActionResponseSchema> {
  let response: ActionResponseSchema = {
    success: true,
    message: "Index is public",
    data: undefined,
  };

  // Skip if public
  if (!config.siteConfig.privateIndex) return response;

  // Check if password is set
  if (!process.env.SITE_PASSWORD) {
    response = {
      success: false,
      message: "Password is not set",
      error:
        "Index password is not set, please set the `SITE_PASSWORD` environment variable, or disable `privateIndex` in the config file!",
    };
    return response;
  }
  const store = await cookies();

  const password = store.get(COOKIES_NAME.indexPassword)?.value;
  if (!password) {
    response = {
      success: false,
      message: "Index is locked",
      error: "",
    };
    return response;
  }
  const decryptedPassword = await encryptionService.decrypt(password);

  if (decryptedPassword !== process.env.SITE_PASSWORD) {
    response = {
      success: false,
      message: "Incorrect password",
      error: "Incorrect password, please try again!",
    };
    return response;
  }

  response = {
    success: true,
    message: "Index is unlocked",
    data: undefined,
  };
  return response;
}

/**
 * Set the index / full site password.
 * @param {string} password - The password to set.
 * @returns {ActionResponseSchema}
 */
export async function SetIndexPassword(password: string): Promise<ActionResponseSchema> {
  try {
    const store = await cookies();
    const encryptedPassword = await encryptionService.encrypt(password);
    store.set(COOKIES_NAME.indexPassword, encryptedPassword, COOKIES_OPTIONS);
    revalidatePath("/", "layout");

    return {
      success: true,
      message: "Password set",
      data: undefined,
    };
  } catch (error) {
    const e = error as Error;
    console.error(`[Actions/Password/SetIndexPassword] ${e.message}`);
    return {
      success: false,
      message: "Failed to set password",
      error: e.message,
    };
  }
}

/**
 * Check if the password of the current folder is correct.
 */
export async function CheckPagePassword(
  paths: {
    path: string;
    id: string;
  }[],
): Promise<ActionResponseSchema> {
  const isSharedDrive = !!(config.apiConfig.isTeamDrive && config.apiConfig.sharedDrive);
  const decryptedRootId = await encryptionService.decrypt(config.apiConfig.rootFolder);
  const decryptedSharedDrive = isSharedDrive
    ? await encryptionService.decrypt(config.apiConfig.sharedDrive!)
    : undefined;

  const pathsArray = paths;

  const folderIds: string[] = [];
  for (const path of pathsArray) {
    const decryptedId = await encryptionService.decrypt(path.id);
    if (decryptedId === decryptedRootId) continue;
    folderIds.push(decryptedId);
  }

  const filterQuery: string = [
    `name = '${config.apiConfig.specialFile.password}'`,
    `trashed = false`,
    `(${folderIds.map((id) => `'${id}' in parents`).join(" or ")})`,
  ].join(" and ");

  const findPasswordResponse = await gdriveNoCache.files.list({
    q: filterQuery,
    fields: "files(id,name,mimeType,parents)",
    pageSize: 1000,
    ...(decryptedSharedDrive && {
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
      driveId: decryptedSharedDrive,
      corpora: "drive",
    }),
  });
  if (!findPasswordResponse.data.files?.length)
    return {
      success: true,
      message: `No password file found on current path (${toUrlPath(paths)})`,
      data: undefined,
    };

  const protectedFolderPassword = findPasswordResponse.data.files
    .filter((item) => folderIds.includes(item.parents?.[0] ?? ""))
    ?.shift();
  if (!protectedFolderPassword)
    return {
      success: true,
      message: `All folders on current path are public (${toUrlPath(paths)})`,
      data: undefined,
    };

  const store = await cookies();
  const storedPassword = JSON.parse(store.get(COOKIES_NAME.folderPassword)?.value ?? "{}") as Record<string, string>;

  const currentFolderIndex = folderIds.findIndex((item) => item === protectedFolderPassword.parents?.[0]);
  const currentFolder = paths[currentFolderIndex]!;
  const currentFolderPath = toUrlPath(paths.slice(0, currentFolderIndex + 1));
  const currentFolderPassword = storedPassword[currentFolderPath];

  if (!currentFolderPassword)
    return {
      success: false,
      message: "Folder is locked",
      error: `Please enter password for '${currentFolderPath}'`,
    };

  const savedPasswordValue = await encryptionService.decrypt(currentFolderPassword);
  const { data: passwordFile } = await gdriveNoCache.files.get(
    {
      fileId: protectedFolderPassword.id!,
      alt: "media",
      supportsAllDrives: config.apiConfig.isTeamDrive,
    },
    {
      responseType: "text",
    },
  );
  if (!passwordFile)
    return {
      success: false,
      message: "Password file not found",
      error: `Failed to get password file for '${currentFolder.path}', please try again!`,
    };

  if (savedPasswordValue !== passwordFile)
    return {
      success: false,
      message: "Incorrect password",
      error: `The password for '${currentFolder.path}' is incorrect`,
    };

  return {
    success: true,
    message: "Folder is unlocked",
    data: undefined,
  };
}

/**
 * Set the password for the current folder.
 * @param path - The path of the folder.
 * @param password - The password to set.
 */
export async function SetPagePassword(path: string, password: string): Promise<ActionResponseSchema> {
  try {
    const store = await cookies();
    const storedPassword = JSON.parse(store.get(COOKIES_NAME.folderPassword)?.value ?? "{}") as Record<string, string>;
    const encryptedPassword = await encryptionService.encrypt(password);

    storedPassword[path] = encryptedPassword;
    store.set(COOKIES_NAME.folderPassword, JSON.stringify(storedPassword), COOKIES_OPTIONS);
    revalidatePath(path, "page");

    return {
      success: true,
      message: "Password set",
      data: undefined,
    };
  } catch (error) {
    const e = error as Error;
    console.error(`[Actions/Password/SetPagePassword] ${e.message}`);
    return {
      success: false,
      message: "Failed to set password",
      error: e.message,
    };
  }
}
