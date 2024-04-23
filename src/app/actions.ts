"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { z } from "zod";
import { Schema_File } from "~/schema";

import { decryptData, encryptData } from "~/utils/encryptionHelper/hash";
import gdrive from "~/utils/gdriveInstance";

import { Constant } from "~/types/constant";

import config from "~/config/gIndex.config";

export async function CheckSitePassword(): Promise<{
  success: boolean;
  message?: string;
}> {
  try {
    // Skip if the index is public
    if (!config.siteConfig.privateIndex)
      return {
        success: true,
      };
    if (!process.env.SITE_PASSWORD)
      throw new Error(
        "Index password not set, please set the SITE_PASSWORD environment variable or disable privateIndex in the config file",
      );

    const store = cookies();
    if (!store.has(Constant.cookies_SitePassword))
      return {
        success: false,
      };
    const password = store.get(Constant.cookies_SitePassword)?.value || "";
    const decryptedPassword = await decryptData(password);
    if (decryptedPassword !== process.env.SITE_PASSWORD)
      throw new Error(
        "Saved password is incorrect, please re-enter the password",
      );

    return {
      success: true,
    };
  } catch (error) {
    const e = error as Error;
    console.error(e.message);
    return {
      success: false,
      message: e.message,
    };
  }
}
export async function SetSitePassword(password: string): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const store = cookies();
    const encryptedPassword = await encryptData(password);
    store.set(Constant.cookies_SitePassword, encryptedPassword, {
      path: "/",
      secure: true,
      sameSite: "strict",
      httpOnly: true,
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
      maxAge: 1000 * 60 * 60 * 24 * 365,
    });
    revalidatePath("/", "layout");

    return {
      success: true,
      message: "Password set",
    };
  } catch (error) {
    const e = error as Error;
    console.error(e.message);
    return {
      success: false,
      message: e.message,
    };
  }
}

export async function ClearPassword(): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const store = cookies();
    if (store.has(Constant.cookies_FolderPassword)) {
      store.delete(Constant.cookies_FolderPassword);
    }
    if (store.has(Constant.cookies_SitePassword)) {
      store.delete(Constant.cookies_SitePassword);
    }
    return {
      success: true,
      message: "Password cleared",
    };
  } catch (error) {
    const e = error as Error;
    console.error(e.message);
    return {
      success: false,
      message: e.message,
    };
  }
}

export async function CheckPaths(paths: string[]): Promise<
  | {
      success: false;
      message?: string;
    }
  | {
      success: true;
      data: { path: string; id: string }[];
      message?: string;
    }
> {
  try {
    const promises = [];
    for (const path of paths) {
      promises.push(
        gdrive.files
          .list({
            q: `name = '${decodeURIComponent(path)}' and trashed = false`,
            fields: "files(id, name, mimeType, parents)",
            supportsAllDrives: config.apiConfig.isTeamDrive,
            includeItemsFromAllDrives: config.apiConfig.isTeamDrive,
          })
          .then(({ data }) => {
            if (!data.files?.length) return null;
            return {
              path,
              data: data.files.map((file) => ({
                id: file.id,
                parents: file.parents?.[0],
                mimeType: file.mimeType,
              })),
            };
          }),
      );
    }

    const data = await Promise.all(promises);
    const notFoundIndex = data.findIndex((item) => !item);
    if (notFoundIndex !== -1)
      throw new Error(`Path not found: ${paths[notFoundIndex]}`);

    // Check if each path is valid
    let valid = true;
    let invalidPath: string | undefined;
    const decryptedRootId = await decryptData(config.apiConfig.rootFolder);
    for (const [index, path] of data.entries()) {
      if (!valid) break;
      // if first path, check if it's in root
      if (index === 0) {
        if (path?.data[0].parents === decryptedRootId) break;
      } else {
        if (path?.data[0].parents === data[index - 1]?.data[0].id) break;
      }
      valid = false;
      invalidPath = data[index]?.path;
    }
    if (!valid) throw new Error(`Invalid path: ${invalidPath}`);

    const ids: { path: string; id: string }[] = [];
    for (const item of data) {
      if (item) {
        const encryptedId = await encryptData(item.data[0].id as string);
        ids.push({
          path: decodeURIComponent(item.path),
          id: encryptedId,
        });
      }
    }
    return {
      success: true,
      data: ids,
    };
  } catch (error) {
    const e = error as Error;
    console.error(e.message);
    return {
      success: false,
      message: e.message,
    };
  }
}
export async function CheckPassword(
  paths: { path: string; id: string }[],
): Promise<
  | {
      success: false;
      message?: string;
      path?: string;
    }
  | {
      success: true;
      message?: string;
    }
> {
  try {
    const ids: string[] = [];
    for (const path of paths) {
      ids.push(await decryptData(path.id));
    }
    let decryptedSharedDrive;
    if (config.apiConfig.isTeamDrive && config.apiConfig.sharedDrive) {
      decryptedSharedDrive = await decryptData(config.apiConfig.sharedDrive);
    }
    const query: string[] = [
      `name = '${config.apiConfig.specialFile.password}'`,
      `trashed = false`,
      `(${ids.map((id) => `'${id}' in parents`).join(" or ")})`, // Filter by paths id
    ];
    const { data: password } = await gdrive.files.list({
      q: query.join(" and "),
      fields: "files(id, name, mimeType, parents)",
      pageSize: 1000,
      ...(decryptedSharedDrive && {
        supportsAllDrives: true,
        includeItemsFromAllDrives: true,
        driveId: decryptedSharedDrive,
        corpora: "drive",
      }),
    });

    // To save processing time, skip if password file not found
    if (!password.files?.length) return { success: true };

    const protectedFolder = password.files
      .filter((file) => ids.includes(file.parents?.[0] as string))
      ?.shift(); // Shift to get only the nearest folder

    // To save processing time, skip if all of the paths are not protected
    if (!protectedFolder) return { success: true };

    const store = cookies();
    const folderIndex = ids.findIndex(
      (item) => item === protectedFolder.parents?.[0],
    );

    const cookiesValue = JSON.parse(
      store.get(Constant.cookies_FolderPassword)?.value || "{}",
    );
    const currentFolder = paths[folderIndex];
    if (!cookiesValue[currentFolder.id])
      throw {
        message: `Password for '${currentFolder.path}' is not set, please enter the password`,
        path: currentFolder.id,
      };

    const savedPassword = await decryptData(cookiesValue[currentFolder.id]);
    const { data: passwordFile } = await gdrive.files.get(
      {
        fileId: protectedFolder.id as string,
        alt: "media",
        supportsAllDrives: config.apiConfig.isTeamDrive,
      },
      {
        responseType: "text",
      },
    );
    if (savedPassword !== passwordFile)
      throw {
        message: `Password for '${currentFolder.path}' is incorrect, please re-enter the password`,
        path: currentFolder.id,
      };

    return {
      success: true,
    };
  } catch (error) {
    if (error instanceof Error) {
      const e = error as Error;
      console.error(e.message);
      return {
        success: false,
        message: e.message,
      };
    } else {
      const e = error as { message: string; path: string };
      console.error(e.message);
      return {
        success: false,
        message: e.message,
        path: e.path,
      };
    }
  }
}
export async function SetPassword(
  path: string,
  password: string,
): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const store = cookies();
    const cookiesValue = JSON.parse(
      store.get(Constant.cookies_FolderPassword)?.value || "{}",
    );
    const updatedValue = {
      ...cookiesValue,
      [path]: await encryptData(password),
    };
    store.set(Constant.cookies_FolderPassword, JSON.stringify(updatedValue), {
      path: "/",
      secure: true,
      sameSite: "strict",
      httpOnly: true,
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
      maxAge: 1000 * 60 * 60 * 24 * 365,
    });
    revalidatePath("/", "layout");

    return {
      success: true,
      message: "Password set",
    };
  } catch (error) {
    const e = error as Error;
    console.error(e.message);
    return {
      success: false,
      message: e.message,
    };
  }
}

export async function GetFiles({
  id,
  pageToken,
}: {
  id?: string;
  pageToken?: string;
}): Promise<{
  files: z.infer<typeof Schema_File>[];
  nextPageToken?: string;
}> {
  try {
    let decryptedId: string | undefined;
    if (id) decryptedId = await decryptData(id);
    else decryptedId = await decryptData(config.apiConfig.rootFolder);

    let decryptedSharedDrive;
    if (config.apiConfig.isTeamDrive && config.apiConfig.sharedDrive) {
      decryptedSharedDrive = await decryptData(config.apiConfig.sharedDrive);
    }

    const filterName = config.apiConfig.hiddenFiles
      .map((item) => `not name = '${item}'`)
      .join(" and ");
    const query: string = [
      ...config.apiConfig.defaultQuery,
      `'${decryptedId}' in parents`,
      `${filterName}`,
    ].join(" and ");

    const data = await gdrive.files.list({
      q: query,
      fields: `files(${config.apiConfig.defaultField}), nextPageToken`,
      orderBy: config.apiConfig.defaultOrder,
      pageSize: config.apiConfig.itemsPerPage,
      pageToken: pageToken,
      ...(decryptedSharedDrive && {
        supportsAllDrives: true,
        includeItemsFromAllDrives: true,
        driveId: decryptedSharedDrive,
        corpora: "drive",
      }),
    });

    const encryptedData: z.infer<typeof Schema_File>[] = [];
    if (!data.data.files?.length)
      return { files: [], nextPageToken: undefined };
    for (const file of data.data.files) {
      encryptedData.push({
        mimeType: file.mimeType as string,
        encryptedId: await encryptData(file.id as string),
        name: file.name as string,
        trashed: (file.trashed as boolean) ?? false,
        modifiedTime: new Date(
          file.modifiedTime as string,
        ).toLocaleDateString(),
        fileExtension: file.fileExtension || undefined,
        encryptedWebContentLink: file.webContentLink
          ? await encryptData(file.webContentLink)
          : undefined,
        size: file.size ? Number(file.size) : undefined,
        thumbnailLink: file.thumbnailLink || undefined,
        imageMediaMetadata: file.imageMediaMetadata
          ? {
              width: Number(file.imageMediaMetadata.width),
              height: Number(file.imageMediaMetadata.height),
              rotation: Number(file.imageMediaMetadata.rotation || 0),
            }
          : undefined,
        videoMediaMetadata: file.videoMediaMetadata
          ? {
              width: Number(file.videoMediaMetadata.width),
              height: Number(file.videoMediaMetadata.height),
              durationMillis: Number(file.videoMediaMetadata.durationMillis),
            }
          : undefined,
      });
    }
    const parsedContent = Schema_File.array().parse(encryptedData);

    return {
      files: parsedContent,
      nextPageToken: data.data.nextPageToken ?? undefined,
    };
  } catch (error) {
    const e = error as Error;
    console.error(e.message);
    throw new Error(e.message);
  }
}
export async function GetFile(
  encryptedId: string,
): Promise<z.infer<typeof Schema_File>> {
  try {
    const decryptedId = await decryptData(encryptedId);
    const { data: file } = await gdrive.files.get({
      fileId: decryptedId,
      fields: config.apiConfig.defaultField,
      supportsAllDrives: config.apiConfig.isTeamDrive,
    });

    const payload: z.infer<typeof Schema_File> = {
      encryptedId,
      mimeType: file.mimeType as string,
      name: file.name as string,
      trashed: (file.trashed as boolean) ?? false,
      modifiedTime: new Date(file.modifiedTime as string).toLocaleDateString(),
      fileExtension: file.fileExtension || undefined,
      encryptedWebContentLink: file.webContentLink
        ? await encryptData(file.webContentLink)
        : undefined,
      size: file.size ? Number(file.size) : undefined,
      thumbnailLink: file.thumbnailLink || undefined,
      imageMediaMetadata: file.imageMediaMetadata
        ? {
            width: Number(file.imageMediaMetadata.width),
            height: Number(file.imageMediaMetadata.height),
            rotation: Number(file.imageMediaMetadata.rotation || 0),
          }
        : undefined,
      videoMediaMetadata: file.videoMediaMetadata
        ? {
            width: Number(file.videoMediaMetadata.width),
            height: Number(file.videoMediaMetadata.height),
            durationMillis: Number(file.videoMediaMetadata.durationMillis),
          }
        : undefined,
    };
    const parsedContent = Schema_File.parse(payload);

    return parsedContent;
  } catch (error) {
    const e = error as Error;
    console.error(e.message);
    throw new Error(e.message);
  }
}
export async function SearchFile(
  keyword: string,
  nextPageToken?: string,
): Promise<{
  files: z.infer<typeof Schema_File>[];
  nextPageToken?: string;
}> {
  try {
    let decryptedSharedDrive;
    if (config.apiConfig.isTeamDrive && config.apiConfig.sharedDrive) {
      decryptedSharedDrive = await decryptData(config.apiConfig.sharedDrive);
    }

    const query: string[] = [
      ...config.apiConfig.defaultQuery,
      `name contains '${keyword}'`,
      config.apiConfig.hiddenFiles
        .map((item) => `not name = '${item}'`)
        .join(" and "),
    ];
    const data = await gdrive.files.list({
      q: query.join(" and "),
      fields: `files(${config.apiConfig.defaultField}), nextPageToken`,
      orderBy: "name_natural desc",
      pageSize: config.apiConfig.searchResult,
      pageToken: nextPageToken,
      ...(decryptedSharedDrive && {
        supportsAllDrives: true,
        includeItemsFromAllDrives: true,
        driveId: decryptedSharedDrive,
        corpora: "drive",
      }),
    });
    const encryptedData: z.infer<typeof Schema_File>[] = [];
    if (!data.data.files?.length)
      return { files: [], nextPageToken: undefined };
    for (const file of data.data.files) {
      encryptedData.push({
        mimeType: file.mimeType as string,
        encryptedId: await encryptData(file.id as string),
        name: file.name as string,
        trashed: (file.trashed as boolean) ?? false,
        modifiedTime: new Date(
          file.modifiedTime as string,
        ).toLocaleDateString(),
        fileExtension: file.fileExtension || undefined,
        encryptedWebContentLink: file.webContentLink
          ? await encryptData(file.webContentLink)
          : undefined,
        size: file.size ? Number(file.size) : undefined,
        thumbnailLink: file.thumbnailLink || undefined,
        imageMediaMetadata: file.imageMediaMetadata
          ? {
              width: Number(file.imageMediaMetadata.width),
              height: Number(file.imageMediaMetadata.height),
              rotation: Number(file.imageMediaMetadata.rotation || 0),
            }
          : undefined,
        videoMediaMetadata: file.videoMediaMetadata
          ? {
              width: Number(file.videoMediaMetadata.width),
              height: Number(file.videoMediaMetadata.height),
              durationMillis: Number(file.videoMediaMetadata.durationMillis),
            }
          : undefined,
      });
    }
    const parsedContent = Schema_File.array().parse(encryptedData);

    return {
      files: parsedContent,
      nextPageToken: data.data.nextPageToken ?? undefined,
    };
  } catch (error) {
    const e = error as Error;
    console.error(e.message);
    throw new Error(e.message);
  }
}
export async function RedirectSearchFile(encryptedId: string): Promise<string> {
  try {
    const { data } = await gdrive.files.get({
      fileId: await decryptData(encryptedId),
      fields: "id, name, parents",
      supportsAllDrives: config.apiConfig.isTeamDrive,
    });

    const paths: string[] = [data.name as string];
    let parentId = data.parents?.[0];
    const decryptedRootId = await decryptData(config.apiConfig.rootFolder);
    while (parentId) {
      if (parentId === decryptedRootId) break;
      const { data: parent } = await gdrive.files.get({
        fileId: parentId,
        fields: "id, name, parents",
        supportsAllDrives: config.apiConfig.isTeamDrive,
      });
      paths.unshift(parent.name as string);
      parentId = parent.parents?.[0];
    }

    return paths.join("/");
  } catch (error) {
    const e = error as Error;
    console.error(e.message);
    throw new Error(e.message);
  }
}

export async function GetContent(encryptedId: string): Promise<string> {
  try {
    const decryptedId = await decryptData(encryptedId);
    const { data: file } = await gdrive.files.get(
      {
        fileId: decryptedId,
        alt: "media",
        supportsAllDrives: config.apiConfig.isTeamDrive,
      },
      {
        responseType: "text",
      },
    );

    if (typeof file !== "string")
      throw new Error("It seems the file is not a text file");

    return file as string;
  } catch (error) {
    const e = error as Error;
    console.error(e.message);
    throw new Error(e.message);
  }
}
export async function GetReadme(
  encryptedId: string | undefined,
): Promise<string | null> {
  try {
    let decryptedId;
    if (encryptedId) decryptedId = await decryptData(encryptedId);
    else decryptedId = await decryptData(config.apiConfig.rootFolder);

    let decryptedSharedDrive;
    if (config.apiConfig.isTeamDrive && config.apiConfig.sharedDrive) {
      decryptedSharedDrive = await decryptData(config.apiConfig.sharedDrive);
    }

    const query: string[] = [
      ...config.apiConfig.defaultQuery,
      `name = '${config.apiConfig.specialFile.readme}'`,
      `'${decryptedId}' in parents`,
    ];
    const { data } = await gdrive.files.list({
      q: query.join(" and "),
      fields: `files(${config.apiConfig.defaultField}, parents), nextPageToken`,
      orderBy: config.apiConfig.defaultOrder,
      pageSize: config.apiConfig.itemsPerPage,
      pageToken: undefined,
      ...(decryptedSharedDrive && {
        supportsAllDrives: true,
        includeItemsFromAllDrives: true,
        driveId: decryptedSharedDrive,
        corpora: "drive",
      }),
    });
    if (!data.files?.length) return null;

    const { data: content } = await gdrive.files.get(
      {
        fileId: data.files[0].id as string,
        alt: "media",
        supportsAllDrives: config.apiConfig.isTeamDrive,
      },
      {
        responseType: "text",
      },
    );

    return content as string;
  } catch (error) {
    const e = error as Error;
    console.error(e.message);
    throw new Error(e.message);
  }
}
export async function GetBanner(
  encryptedId: string | undefined,
): Promise<string | null> {
  try {
    let decryptedId;
    if (encryptedId) decryptedId = await decryptData(encryptedId);
    else decryptedId = await decryptData(config.apiConfig.rootFolder);

    let decryptedSharedDrive;
    if (config.apiConfig.isTeamDrive && config.apiConfig.sharedDrive) {
      decryptedSharedDrive = await decryptData(config.apiConfig.sharedDrive);
    }

    const query: string[] = [
      ...config.apiConfig.defaultQuery,
      `name contains '${config.apiConfig.specialFile.banner}'`,
      `'${decryptedId}' in parents`,
    ];
    const { data } = await gdrive.files.list({
      q: query.join(" and "),
      fields: `files(${config.apiConfig.defaultField}, parents), nextPageToken`,
      orderBy: config.apiConfig.defaultOrder,
      pageSize: config.apiConfig.itemsPerPage,
      pageToken: undefined,
      ...(decryptedSharedDrive && {
        supportsAllDrives: true,
        includeItemsFromAllDrives: true,
        driveId: decryptedSharedDrive,
        corpora: "drive",
      }),
    });
    if (!data.files?.length) return null;

    return await encryptData(data.files[0].id as string);
  } catch (error) {
    const e = error as Error;
    console.error(e.message);
    throw new Error(e.message);
  }
}

export async function GetWebContent(encrypted: string): Promise<string> {
  try {
    return await decryptData(encrypted);
  } catch (error) {
    const e = error as Error;
    console.error(e.message);
    throw new Error(e.message);
  }
}
export async function CreateDownloadToken(
  duration: number = config.apiConfig.temporaryTokenDuration,
): Promise<string> {
  try {
    const data = {
      expiredAt:
        Date.now() +
        duration * 60 * 60 * 1000 * config.apiConfig.temporaryTokenDuration,
    };
    const token = await encryptData(JSON.stringify(data));
    return token;
  } catch (error) {
    const e = error as Error;
    console.error(e.message);
    throw new Error(e.message);
  }
}
export async function CheckDownloadToken(token: string): Promise<{
  success: boolean;
  message?: string;
}> {
  try {
    const decryptToken = JSON.parse(await decryptData(token));
    if (decryptToken.expiredAt < Date.now()) {
      return {
        success: false,
        message:
          "Download token expired, please click the download button again to get a new token",
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    const e = error as Error;
    console.error(e.message);
    return {
      success: false,
      message: e.message,
    };
  }
}
