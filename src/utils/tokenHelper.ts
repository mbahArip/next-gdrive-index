import gIndexConfig from "config";

import { decryptData, encryptData } from "./encryptionHelper/hash";

export function createDownloadToken(durationH: number = gIndexConfig.apiConfig.temporaryTokenDuration) {
  const duration = durationH * 60 * 60 * 1000;
  const expiredAt = Date.now() + duration;
  return encryptData(expiredAt.toString());
}

export function isDownloadTokenValid(token: string): boolean {
  try {
    const expiredAt = Number(decryptData(token));
    return expiredAt > Date.now();
  } catch (e) {
    return false;
  }
}
