export interface IGDriveFiles {
  mimeType: string;
  encryptedId: string;
  name: string;
  trashed: boolean;
  modifiedTime: Date | string;
  fileExtension?: string;
  encryptedWebContentLink?: string;
  size?: number;
  thumbnailLink?: string;
  imageMediaMetadata?: {
    width: number;
    height: number;
    rotation: number;
  } | null;
  videoMediaMetadata?: {
    width: number;
    height: number;
    durationMillis: number;
  } | null;
}

export interface PreviewProps {
  file: IGDriveFiles;
}
