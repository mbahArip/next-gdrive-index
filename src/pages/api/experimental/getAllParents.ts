import { NextApiRequest, NextApiResponse } from "next";
import drive from "@utils/driveClient";
import config from "@/config/site.config";

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse,
) {
  const _start: number = Date.now();
  try {
    const id = "1JARq3gOODQeOLd2DwT5qZjZAOtO-8Jvl";
    const parents: string[] = [];
    const getFile = await drive.files.get({
      fileId: id as string,
      fields: "id, name, mimeType, parents",
    });

    let parent = getFile.data.parents?.[0];

    while (parent) {
      console.log("Searching parent for: ", parent);
      const getParent = await drive.files.get({
        fileId: parent as string,
        fields: "id, name, mimeType, parents",
      });
      parents.push(getParent.data.id as string);
      if (getParent.data.id === config.files.rootFolder) break;
      parent = getParent.data.parents?.[0];
      console.log("Parent found: ", parent);
    }

    const searchPassword = await drive.files.list({
      q: "name = '.password' and 'me' in owners and trashed = false",
      fields: "files(id, name, mimeType, parents)",
    });
    let passwordFile = null;
    if (searchPassword.data.files?.length) {
      passwordFile = searchPassword.data.files.filter((file) =>
        parents.includes(file.parents?.[0] as string),
      );
    }

    const _end: number = Date.now();
    return response.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      duration: _end - _start,
      parents: parents,
      passwordFile: passwordFile,
    });
  } catch (error: any) {
    return response.status(500).json({
      success: false,
      timestamp: new Date().toISOString(),
      error: error,
    });
  }
}
