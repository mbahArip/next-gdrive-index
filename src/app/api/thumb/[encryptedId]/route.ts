import { NextRequest, NextResponse } from "next/server";
import config from "~/config/gIndex.config";
import { decryptData } from "~/utils/encryptionHelper/hash";
import gdrive from "~/utils/gdriveInstance";

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
      fields: "id, name, mimeType, thumbnailLink",
      supportsAllDrives: config.apiConfig.isTeamDrive,
    });
    if (!data.thumbnailLink) throw new Error("No thumbnail for this file");
    return NextResponse.redirect(data.thumbnailLink);
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
