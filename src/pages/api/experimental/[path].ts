import { NextApiRequest, NextApiResponse } from "next";
import drive from "@utils/driveClient";

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse,
) {
  try {
    const _start = Date.now();
    const { path } = request.query;
    const id = path as string;

    const promiseFolderContents = drive.files.list({
      q: `'${id}' in parents and trashed = false and 'me' in owners`,
      fields: "files(id, name, mimeType, parents), nextPageToken",
    });
    const promiseFolderPassword = drive.files.list({
      q: `'${id}' in parents and trashed = false and name = '.password' and 'me' in owners`,
      fields: "files(id, name, mimeType, parents)",
    });
    const promisedFolderReadme = drive.files.list({
      q: `'${id}' in parents and trashed = false and name = 'README.md' and 'me' in owners`,
      fields: "files(id, name, mimeType, parents)",
    });

    const [folderContents, folderPassword, folderReadme] = await Promise.all([
      promiseFolderContents,
      promiseFolderPassword,
      promisedFolderReadme,
    ]);

    const isPasswordProtected = !!folderPassword.data.files?.length;
    const isReadmeAvailable = !!folderReadme.data.files?.length;
    const folderList =
      folderContents.data.files?.filter(
        (item) => item.mimeType === "application/vnd.google-apps.folder",
      ) || [];
    const fileList =
      folderContents.data.files?.filter(
        (item) => item.mimeType !== "application/vnd.google-apps.folder",
      ) || [];

    const _end = Date.now();
    const payload = {
      success: true,
      timestamp: new Date().toISOString(),
      duration: _end - _start,
      passwordRequired: isPasswordProtected,
      passwordValidated: true,
      protectedId: false,
      parents: [],
      files: fileList,
      folders: folderList,
      readmeExists: isReadmeAvailable,
      nextPageToken: folderContents.data.nextPageToken || undefined,
    };

    return response.status(200).json(payload);
  } catch (error: any) {
    console.error(error);
    return response.status(500).json({
      success: false,
      timestamp: new Date().toISOString(),
      error: error.message,
    });
  }
}
