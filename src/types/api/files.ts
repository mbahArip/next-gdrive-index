import { drive_v3 } from "googleapis";

export type FilesResponse = {
  folders: drive_v3.Schema$File[];
  files: drive_v3.Schema$File[];
  isReadmeExists?: boolean;
  isBannerExists?: boolean;
  nextPageToken?: string;
};

export type FileResponse = drive_v3.Schema$File;
export type SearchResponse = drive_v3.Schema$File[];
