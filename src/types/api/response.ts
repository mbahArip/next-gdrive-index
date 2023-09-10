import { IGDriveFiles } from "./files";

interface APIResponse {
  timestamp: number;
  responseTime: number;
}

export interface ErrorResponse extends APIResponse {
  error: {
    code: number;
    message: string;
    reason?: string;
  };
}

export interface APIValidateResponse extends APIResponse {
  path: string;
  valid: boolean;
}

export interface APIFilesResponse extends APIResponse {
  folders: IGDriveFiles[];
  files: IGDriveFiles[];
  nextPageToken?: string;
  readmeExists: boolean;
  bannerExists: boolean;
  passwordExists: boolean;
}

export interface APIFileResponse extends APIResponse {
  file: IGDriveFiles;
}

export interface APIGetPasswordResponse extends APIResponse {
  data: {
    relativePath: string;
    password: string;
  }[];
}
export interface APIGetFileResponse extends APIResponse {
  data: {
    file: IGDriveFiles | null;
    files: IGDriveFiles[];
    folders: IGDriveFiles[];
    pageToken: string | null;
  };
}
export interface APIGetReadmeResponse extends APIResponse {
  data: string | null;
}
export interface APISearchResponse extends APIResponse {
  files: (IGDriveFiles & { redirect: string })[];
}
