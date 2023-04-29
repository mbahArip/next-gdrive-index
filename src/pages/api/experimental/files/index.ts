import { NextApiRequest, NextApiResponse } from "next";
import drive, { redis } from "@utils/driveClient";
import config from "@/config/site.config";
import { ErrorResponse, FilesResponse } from "@/types/googleapis";
import { urlEncrypt } from "@/utils/encryptionHelper";
import { ExtendedError } from "@/types/default";

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse,
) {
  const _start = Date.now();

  try {
    const cacheKey = request.url as string;
    const { isRefresh } = request.query;

    if (!isRefresh) {
      const cachedResponse = await redis.get(cacheKey);
      if (cachedResponse) {
        const _end = Date.now();
        return response
          .status(200)
          .setHeader("Cache-Control", "max-age=60")
          .json({ ...cachedResponse, durationMs: _end - _start });
      }
    }

    const { pageToken } = request.query;
    const authorization =
      process.env.NODE_ENV === "development"
        ? request.query.hash
        : request.headers.authorization?.split(" ")[1] || null;

    const query = [
      `'${config.files.rootFolder}' in parents`,
      "trashed = false",
      "'me' in owners",
    ];
    const promiseFolderContents = await drive.files.list({
      q: `${query.join(" and ")}`,
      fields:
        "files(id, name, mimeType, thumbnailLink, fileExtension, createdTime, modifiedTime, size, videoMediaMetadata), nextPageToken",
      orderBy: "folder, name asc",
      pageSize: config.files.itemsPerPage,
      pageToken: (pageToken as string) || undefined,
    });

    const passwordFile = promiseFolderContents.data.files?.find(
      (file) => file.name === ".password",
    );
    const readmeFile = promiseFolderContents.data.files?.find(
      (file) => file.name === ".readme.md",
    );
    const folderList =
      promiseFolderContents.data.files?.filter(
        (item) => item.mimeType === "application/vnd.google-apps.folder",
      ) || [];
    const fileList =
      promiseFolderContents.data.files?.filter(
        (item) => item.mimeType !== "application/vnd.google-apps.folder",
      ) || [];

    // if (passwordFile && !authorization) {
    //   const error: ExtendedError = new Error("Unauthorized");
    //   error.code = 401;
    //   error.cause = "unauthorized";
    //   throw error;
    // }

    if (readmeFile && authorization) {
      const validatePassword = await drive.files.get(
        {
          fileId: promiseFolderContents.data.files?.find(
            (file) => file.name === ".password",
          )?.id as string,
          alt: "media",
        },
        { responseType: "text" },
      );
      if (validatePassword.data !== authorization) {
        const error: ExtendedError = new Error("Unauthorized");
        error.code = 401;
        error.cause = "unauthorized";
        throw error;
      }
    }

    const _end = Date.now();
    const payload: FilesResponse = {
      success: true,
      timestamp: new Date().toISOString(),
      durationMs: _end - _start,
      passwordRequired: passwordFile ? true : false,
      passwordValidated: true,
      protectedId: "",
      parents: [],
      files: fileList.map((file) => ({
        ...file,
        id: urlEncrypt(file.id as string),
      })),
      folders: folderList,
      readmeExists: readmeFile ? true : false,
      nextPageToken: promiseFolderContents.data.nextPageToken || undefined,
    };

    await redis.set(cacheKey as string, JSON.stringify(payload), {
      ex: 60,
    });
    return response
      .status(200)
      .setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate")
      .json(payload);
  } catch (error: any) {
    const _end = Date.now();
    console.log(error);
    const payload: ErrorResponse = {
      success: false,
      timestamp: new Date().toISOString(),
      durationMs: _end - _start,
      code: error.code || 500,
      errors: {
        message: error.errors?.[0].message || error.message || "Unknown error",
        reason: error.errors?.[0].reason || error.cause || "internalError",
      },
    };

    return response.status(payload.code || 500).json(payload);
  }
}
