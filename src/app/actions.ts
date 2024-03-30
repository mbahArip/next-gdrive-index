"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { z } from "zod";
import config from "~/config/gIndex.config";
import { Schema_File } from "~/schema";
import { Constant } from "~/types/constant";
import { decryptData, encryptData } from "~/utils/encryptionHelper/hash";
import gdrive from "~/utils/gdriveInstance";

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
    const filterName: string = config.apiConfig.hiddenFiles
      .map((item) => `name != '${item}'`)
      .join(" and ");
    const query: string = [
      ...config.apiConfig.defaultQuery,
      // `'1owGkP0NsJ4am8vVYebpjnoxzY5VOc7Vh' in parents`,
      decryptedId
        ? `'${decryptedId}' in parents`
        : `'${config.apiConfig.rootFolder}' in parents`,
      `${filterName}`,
    ].join(" and ");

    const data = await gdrive.files.list({
      q: query,
      fields: `files(${config.apiConfig.defaultField}), nextPageToken`,
      orderBy: config.apiConfig.defaultOrder,
      pageSize: config.apiConfig.itemsPerPage,
      pageToken: pageToken,
      supportsAllDrives: config.apiConfig.isTeamDrive,
      includeItemsFromAllDrives: config.apiConfig.isTeamDrive,
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
              rotation: Number(file.imageMediaMetadata.rotation),
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
export async function GetReadme(
  encryptedId: string | undefined,
): Promise<string | null> {
  try {
    let decryptedId: string | undefined;
    if (encryptedId) decryptedId = await decryptData(encryptedId);
    else decryptedId = config.apiConfig.rootFolder;

    const query: string[] = [
      ...config.apiConfig.defaultQuery,
      `name = '${config.apiConfig.specialFile.readme}'`,
      `'${decryptedId}' in parents`,
    ];
    const { data } = await gdrive.files.list({
      q: query.join(" and "),
      fields: `files(${config.apiConfig.defaultField}), nextPageToken`,
      orderBy: config.apiConfig.defaultOrder,
      pageSize: config.apiConfig.itemsPerPage,
      pageToken: undefined,
    });
    if (!data.files?.length) return null;

    const { data: content } = await gdrive.files.get(
      {
        fileId: data.files[0].id as string,
        alt: "media",
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

export async function CreateDownloadToken(
  duration: number = config.apiConfig.temporaryTokenDuration,
): Promise<string> {
  try {
    const data = {
      expiredAt: Date.now() + duration * 60 * 60 * 1000,
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
