import { NextApiRequest, NextApiResponse } from "next";
import drive from "@utils/driveClient";
import config from "@/config/site.config";
import { google } from "googleapis";

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse,
) {
  const _start: number = Date.now();
  try {
    const ids = [
      "1JARq3gOODQeOLd2DwT5qZjZAOtO-8Jvl",
      "1CSKTtgXunrSHYRRp8FyMXYpNP6xK1iju",
      "1NK-J1QIf0vuGnDIEHXBG2-9jXP6sKCuN",
    ];

    function getFile(id: string) {
      return new Promise((resolve, reject) => {
        drive.files.get(
          {
            fileId: id,
            fields: "id, name, mimeType, parents",
          },
          (error, response) => {
            if (error) reject(error);
            resolve(response);
          },
        );
      });
    }

    const batch = google.batch("v1");
    for (const id of ids) {
      // @ts-ignore
      batch.add(getFile(id));
    }

    // @ts-ignore
    const res = await batch.execute();

    const _end: number = Date.now();
    return response.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      duration: _end - _start,
      res,
    });
  } catch (error: any) {
    return response.status(500).json({
      success: false,
      timestamp: new Date().toISOString(),
      error: error,
    });
  }
}
