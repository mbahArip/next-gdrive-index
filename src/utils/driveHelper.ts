import { drive_v3 } from "googleapis";
import { urlDecrypt } from "utils/encryptionHelper";

export const hiddenFiles = [".password", ".readme.md", ".banner"];
export function createFileId(
  data: drive_v3.Schema$File,
  encrypted: boolean = false,
) {
  if (process.env.ENCRYPTION_KEY) {
  }
  if (encrypted) {
    return `${encodeURIComponent(data.name as string)}:${urlDecrypt(
      data.id as string,
    )?.slice(0, 8)}`;
  }
  return `${encodeURIComponent(data.name as string)}:${data.id?.slice(0, 8)}`;
}

export class ExtendedError extends Error {
  code?: number;

  constructor(message?: string, code?: number, reason?: string) {
    super(message);
    this.code = code;
    this.cause = reason;
  }
}
