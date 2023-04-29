import { NextApiRequest, NextApiResponse } from "next";
import drive from "@utils/driveClient";
import apiConfig from "@/config/api.config";
import { FileResponse, FilesResponse } from "@/types/googleapis";
import { ExtendedError } from "@/types/default";

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse,
) {
  const _start = Date.now();
  try {
    const pathArray = request.query.path as string[];
    const [folderName, partialId] = pathArray[pathArray.length - 1].split(".");

    const searchFile = await drive.files.list({
      q: `name = '${folderName}' and 'me' in owners and trashed = false`,
      fields: "files(id, name, mimeType), nextPageToken",
    });

    const findPath = searchFile.data.files?.filter((file) => {
      return file.name === folderName && file.id?.slice(0, 8) === partialId;
    })[0];

    if (!findPath) {
      const error = new Error("File not found") as ExtendedError;
      error.cause = "notFound";
      error.code = 404;
      throw error;
    }

    let isReadmeFile = false;
    let payload: FileResponse | FilesResponse;
    let description = "";
    if (findPath.mimeType === "application/vnd.google-apps.folder") {
      const fetchFolder = await drive.files.list({
        q: `'${findPath.id}' in parents and trashed = false and 'me' in owners`,
        fields:
          "files(id, name, mimeType, parents, description), nextPageToken",
      });
      isReadmeFile = !!fetchFolder.data.files?.some(
        (file) => file.name === ".readme.md",
      );

      payload = {
        success: true,
        timestamp: new Date().toISOString(),
        durationMs: 0,
        readmeExists: isReadmeFile,
        nextPageToken: fetchFolder.data.nextPageToken || undefined,
        files:
          fetchFolder.data.files?.filter(
            (file) => file.mimeType !== "application/vnd.google-apps.folder",
          ) || [],
        folders:
          fetchFolder.data.files?.filter(
            (file) => file.mimeType === "application/vnd.google-apps.folder",
          ) || [],
      } as FilesResponse;
    } else {
      const fetchFile = await drive.files.get({
        fileId: findPath.id as string,
        fields:
          "id, name, mimeType, parents, thumbnailLink, fileExtension, createdTime, modifiedTime, size, imageMediaMetadata, videoMediaMetadata, exportLinks",
      });
      payload = {
        success: true,
        timestamp: new Date().toISOString(),
        durationMs: 0,
        file: fetchFile.data,
      } as FileResponse;
    }

    // loop through pathArray and check if any of the paths are in protectedFOlders
    // if so, set isProtected to true
    let isProtected = false;
    let isValidated = false;
    let protectedId = "";
    for (let i = 0; i < pathArray.length; i++) {
      const partialId = pathArray[i].split(".")[1];
      for (let j = 0; j < apiConfig.protectedFolders.length; j++) {
        if (apiConfig.protectedFolders[j].slice(0, 8) === partialId) {
          isProtected = true;
          protectedId = apiConfig.protectedFolders[j];
          break;
        }
      }
    }

    if (protectedId) {
      const findPassword = await drive.files.get({
        fileId: protectedId,
        fields: "description",
      });
      if (findPassword.data.description) {
        description = findPassword.data.description;
        const { password: passwordQuery } = request.query;
        if (findPassword.data.description === passwordQuery) {
          isValidated = true;
        }
      }
    }

    // if (isProtected) {
    //   const findPassword = await drive.files.list({
    //     q: `name = '.password' and '${protectedId}' in parents and trashed = false and 'me' in owners`,
    //     fields: "files(id)",
    //   });
    //   if (findPassword.data.files?.length) {
    //     const passwordFile = await drive.files.get({
    //       fileId: findPassword.data.files[0].id as string,
    //       alt: "media",
    //     });
    //     const password = passwordFile.data as unknown as string;
    //     const { password: passwordQuery } = request.query;
    //     if (password === passwordQuery) {
    //       isValidated = true;
    //     }
    //   }
    // }
    // if (isProtected && !isValidated) {
    //   const error = new Error("Protected folder") as ExtendedError;
    //   error.cause = "protected";
    //   error.code = 403;
    //   throw error;
    // }

    payload.passwordRequired = isProtected;
    payload.passwordValidated = isValidated;
    payload.protectedId = protectedId;

    const _end = Date.now();
    payload.durationMs = _end - _start;

    return response.status(200).json({ payload, description });
  } catch (error: any) {
    console.error(error);
    const _end = Date.now();
    return response.status(500).json({
      success: false,
      timestamp: new Date().toISOString(),
      durationMs: _end - _start,
      error: error.message,
    });
  }
}
