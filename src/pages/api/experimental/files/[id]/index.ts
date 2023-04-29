import { NextApiRequest, NextApiResponse } from "next";
import { ErrorResponse, FileResponse, FilesResponse } from "@/types/googleapis";
import driveClient from "@utils/driveClient";

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse<FileResponse | FilesResponse | ErrorResponse>,
) {
  try {
    const _start = Date.now();
    const { id, download } = request.query;
    const authorization = request.headers.authorization?.split(" ")[1] || null;

    const fileMetadata = await driveClient.files.get({
      fileId: id as string,
      fields: "id, name, mimeType, webContentLink, size",
    });

    //     Check if file is not folder, then return the metadata, else return the folder contents
    if (fileMetadata.data.mimeType !== "application/vnd.google-apps.folder") {
      const _end = Date.now();
      const payload: FileResponse = {
        success: true,
        timestamp: new Date().toISOString(),
        passwordRequired: false,
        passwordValidated: false,
        protectedId: "",
        parents: [],
        file: fileMetadata.data,
      };
      response.writeHead(302, {
        Authorization: `Bearer ya29.a0Ael9sCNmJZOtlE8yeNALh68peuGFpPdPFZ6Yeo000E0Ecbp1baTJOp2so2IJGBv6rw6IfhQzq3PbAIrQPmKD03_TgE_qiZ9gAQPonlGqo_ZLbGvdNotLxevPe2hirBjrBWxqqIX2kLDVeIz9gS9_8q1hCiwJcsQTaCgYKAXUSARASFQF4udJhhPOaDshorTlSfHCotd6TDg0167`,
      });
      return response.redirect(fileMetadata.data.webContentLink as string);
      return response.status(200).json(payload);
    }

    const folderContents = await driveClient.files.list({
      q: `'${id}' in parents and trashed = false`,
      fields: "files(id, name, mimeType, webContentLink, size), nextPageToken",
    });
    const _end = Date.now();
    const payload: FilesResponse = {
      success: true,
      timestamp: new Date().toISOString(),
      passwordRequired: false,
      passwordValidated: false,
      protectedId: "",
      parents: [],
      files:
        folderContents.data.files?.filter(
          (item) => item.mimeType !== "application/vnd.google-apps.folder",
        ) || [],
      folders:
        folderContents.data.files?.filter(
          (item) => item.mimeType === "application/vnd.google-apps.folder",
        ) || [],
      readmeExists: false,
      nextPageToken: folderContents.data.nextPageToken || "",
    };
    return response.status(200).json(payload);
  } catch (error: any) {
    let payload: ErrorResponse = {
      success: false,
      timestamp: new Date().toISOString(),
      code: error.code || 500,
      errors: {
        message: error.message || "Internal Server Error",
        reason: error.reason || "internalError",
      },
    };
    if (error satisfies ErrorResponse) {
      payload.errors.message =
        error.errors?.[0].message || error.message || "Unknown error";
      payload.errors.reason =
        error.errors?.[0].reason || error.cause || "internalError";

      return response.status(error.code || 500).json(payload);
    }
    return response.status(error.code || 500).json(payload);
  }
}
