export interface ExtendedError extends Error {
  code?: number;
}

export interface DownloadToken {
  password: string;
  exp: Date | string | number;
}
