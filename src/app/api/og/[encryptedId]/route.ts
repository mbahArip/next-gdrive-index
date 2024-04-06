import { NextRequest, NextResponse } from "next/server";

import { decryptData } from "~/utils/encryptionHelper/hash";
import gdrive from "~/utils/gdriveInstance";

import config from "~/config/gIndex.config";

type Props = {
  params: {
    encryptedId: string;
  };
};

export async function GET(
  request: NextRequest,
  { params: { encryptedId } }: Props,
) {
  try {
    const decryptedId = await decryptData(encryptedId);
    const { data } = await gdrive.files.get({
      fileId: decryptedId,
      fields: "id, name, mimeType, webContentLink",
      supportsAllDrives: config.apiConfig.isTeamDrive,
    });
    if (!data.webContentLink) throw new Error("No thumbnail for this file");
    const downloadThumb = await fetch(data.webContentLink, {
      cache: "force-cache",
    });
    const buffer = await downloadThumb.arrayBuffer();
    const bufferData = Buffer.from(buffer);

    return new NextResponse(bufferData, {
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Type": data.mimeType || "application/octet-stream",
        "Content-Length": bufferData.length.toString(),
        "Content-Disposition": `inline; filename="${data.name}"`,
      },
    });
  } catch (error) {
    const e = error as Error;
    console.error(e.message);
    return NextResponse.json(
      {
        error: e.message,
      },
      {
        status: 500,
      },
    );
  }
}
