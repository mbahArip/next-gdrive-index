import { IGDriveFiles } from "types/api/files";

import { encryptData } from "./encryptionHelper/hash";

/**
 * Generate download link for the file, so I don't have to repeat the code.
 * Since it's contains encrypted object, I hope this function will make it easier to read and maintain.
 *
 * @param {IGDriveFiles} file - File object from GDrive API response.
 * @param {boolean} [isProtected = false] - Is the file inside password protected folder or not.
 * @param {boolean} [includeHost = false] - Include host name or not.
 * @param {string} [token] - Download token for protected file.
 * @param {string} [disableLimit] - Disable file size limit.
 * @returns {string} URL to download the file.
 */
export function generatedDownloadLink(
  file: IGDriveFiles,
  isProtected: boolean = false,
  includeHost: boolean = false,
  token?: string | null,
  disableLimit?: boolean,
): string {
  const data: Record<"id" | "isProtected", string | boolean> = {
    id: file.encryptedId,
    isProtected,
  };
  const encryptedData = encryptData(JSON.stringify(data, null, 0));
  // let url = `/api/download/${encryptedData}/${file.name}`;

  const url = new URL(`/api/download/${encryptedData}/${file.name}`, window.location.origin);
  if (token) url.searchParams.append("token", token);
  if (disableLimit) url.searchParams.append("disableLimit", "true");

  // if (includeHost) url = `${window.location.origin}${url}`;
  // if (token) url = `${url}?token=${token}`;
  // if (disableLimit) url = `${url}&disableLimit=true`;

  return url.toString();
}
