import { NextResponse } from "next/server";

import { encryptionService } from "~/lib/utils.server";

import config from "~/config/gIndex.config";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    if (process.env.NODE_ENV !== "development") {
      throw new Error("This route is only available in development environment");
    }

    const rootId = await encryptionService.decrypt(config.apiConfig.rootFolder);
    const sharedDriveId = config.apiConfig.sharedDrive
      ? await encryptionService.decrypt(config.apiConfig.sharedDrive)
      : undefined;

    return NextResponse.json(
      {
        rootId,
        sharedDriveId,
      },
      { status: 200 },
    );
  } catch (error) {
    const e = error as Error;
    console.error(e);
    return new Response(e.message, { status: 500 });
  }
}
