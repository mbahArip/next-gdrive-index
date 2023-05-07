import { drive_v3 } from "googleapis";

export interface APIResponse {
  success: boolean;
  timestamp: string;
  responseTime?: number;
}

export type TFileParent = {
  id: string;
  name: string;
};
export type TFolder = {
  id: string;
  name: string;
  mimeType: string;
  parents?: string[];
  createdTime: string;
  modifiedTime: string;
};
export type TFile = {
  id: string;
  name: string;
  mimeType: string;
  parents?: string[];
  thumbnailLink?: string;
  fileExtension?: string;
  createdTime: string;
  modifiedTime: string;
  size?: string;
  imageMediaMetadata?: {
    width: number;
    height: number;
    rotation: number;
    location: {
      latitude: number;
      longitude: number;
      altitude: number;
    };
    time: string;
    cameraMake: string;
    cameraModel: string;
    exposureTime: number;
    aperture: number;
    flashUsed: boolean;
    focalLength: number;
    isoSpeed: number;
    meteringMode: string;
    sensor: string;
    exposureMode: string;
    colorSpace: string;
    whiteBalance: string;
    exposureBias: number;
    maxApertureValue: number;
    subjectDistance: number;
    lens: string;
  };
  videoMediaMetadata?: {
    width: number;
    height: number;
    durationMillis: number;
  };
  exportLinks?: {
    "application/rtf": string;
    "application/vnd.oasis.opendocument.text": string;
    "text/html": string;
    "application/pdf": string;
    "application/epub+zip": string;
    "application/zip": string;
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": string;
    "text/plain": string;
  };
};

export interface FilesResponse extends APIResponse {
  passwordRequired?: boolean;
  passwordValidated?: boolean;
  protectedId?: string;
  parents?: TFileParent[];
  folders: drive_v3.Schema$File[];
  files: drive_v3.Schema$File[];
  isReadmeExists?: boolean;
  isBannerExists?: boolean;
  isPasswordExists?: boolean;
  nextPageToken?: string;
}

export interface FileResponse extends APIResponse {
  parents?: TFileParent[];
  passwordRequired?: boolean;
  passwordValidated?: boolean;
  protectedId?: string;
  file: drive_v3.Schema$File;
}

export interface SearchResponse extends APIResponse {
  files: drive_v3.Schema$File[];
}
export interface BreadCrumbsResponse extends APIResponse {
  breadcrumbs: TFileParent[];
  isLimitReached: boolean;
}

export interface BannerResponse extends APIResponse {
  banner?: drive_v3.Schema$File;
}

export interface ErrorResponse extends APIResponse {
  code: number;
  errors: {
    message: string;
    reason: string;
  };
}
