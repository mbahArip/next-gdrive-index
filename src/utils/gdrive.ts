import gIndexConfig from "config";
import { GaxiosResponse } from "gaxios";
import type { drive_v3 } from "googleapis";

import gdrive from "utils/gdriveInstance";

interface ListFiles extends drive_v3.Params$Resource$Files$List {}

export async function gdriveFilesList({
  q,
  fields,
  orderBy,
  pageSize,
  pageToken,
}: ListFiles): Promise<GaxiosResponse<drive_v3.Schema$FileList>> {
  const result = await gdrive.files.list({
    q,
    fields,
    orderBy,
    pageSize,
    pageToken,
    ...(gIndexConfig.apiConfig.isTeamDrive && {
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
      driveId: gIndexConfig.apiConfig.rootFolder,
      corpora: "drive",
    }),
  });
  return result;
}
