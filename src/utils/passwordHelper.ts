import { Constant } from "types/constant";

import {
  decryptData,
  encryptData,
} from "./encryptionHelper/hash";

/**
 * Check if the password is correct for the given path
 * @param cookies - cookies value
 * @param path - The path to check
 * @param password - The password to check
 * @returns true if the password is correct, false otherwise
 */
export function checkPathPassword(
  path: string,
  cookies: string,
  password: string,
): boolean {
  try {
    const validCookieToken = decryptData(cookies);
    const cookieTokenJSON = JSON.parse(validCookieToken);
    if (!cookieTokenJSON[path]) return false;
    return cookieTokenJSON[path] === password;
  } catch (error: any) {
    console.error(error.message);
    return false;
  }
}

/**
 * Create a new password for the given path
 * @param cookies - cookies value
 * @param path - The path to add
 * @param password - The password to add
 * @returns The new cookies token
 */
export function addNewPassword(
  path: string,
  password: string,
  cookies?: string,
  server: boolean = false,
): string | void {
  try {
    let cookieTokenJSON: any = {};
    if (cookies) {
      const validCookieToken = decryptData(cookies);
      cookieTokenJSON = JSON.parse(validCookieToken);
    }
    cookieTokenJSON[path] = password;
    const encryptedCookieToken = encryptData(
      JSON.stringify(cookieTokenJSON),
    );

    // Set cookie for 5 years
    const expires = new Date(
      Date.now() + 5 * 365 * 24 * 60 * 60 * 1000,
    ).toUTCString();
    if (!server) {
      document.cookie = `${Constant.cookies_SitePassword}=${encryptedCookieToken}; expires=${expires}; path=/; SameSite=Strict;`;
    } else {
      return `${Constant.cookies_SitePassword}=${encryptedCookieToken}; expires=${expires}; path=/; SameSite=Strict;`;
    }
  } catch (error: any) {
    removeAllPassword();
    throw new Error(
      "Failed to add new password, it's likely because the encryption key are changed. Please refresh the page and try again.",
    );
  }
}

/**
 * Remove all password
 */
export function removeAllPassword() {
  document.cookie = `${Constant.cookies_SitePassword}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}
