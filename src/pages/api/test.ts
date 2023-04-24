import { NextApiRequest, NextApiResponse } from "next";
import drive from "@utils/driveClient";
import { hashToken } from "@utils/hashHelper";

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse,
) {
  const files = await drive.files.list({
    q: "'1VMU0sQOkuI06icRRJFof-6V-NLyBWlp5' in parents",
    fields: "files(id, name, mimeType, size)",
  });
  const { password } = request.query;
  return response.status(200).json({
    hash: hashToken(password as string),
    file: files.data.files,
  });
}
