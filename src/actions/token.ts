"use server";

import { type z } from "zod";
import { type ActionResponseSchema } from "~/types";

import { encryptionService } from "~/lib/utils.server";

import { type Schema_File, Schema_FileToken } from "~/types/schema";

import config from "config";

/**
 * Create a token to download a file
 * @param file - File data
 * @param expiredIn - Token expiration time in milliseconds (default to configuration)
 */
export async function CreateFileToken(
  file: z.infer<typeof Schema_File>,
  expiredIn: number = 3600 * 1000 * config.apiConfig.temporaryTokenDuration,
): Promise<ActionResponseSchema<string>> {
  const tokenObject = {
    id: file.encryptedId,
    exp: Date.now() + expiredIn,
    iat: Date.now(),
  };
  const parsedTokenObject = Schema_FileToken.safeParse(tokenObject);
  if (!parsedTokenObject.success)
    return {
      success: false,
      message: "Failed to create token",
      error: parsedTokenObject.error.message,
    };

  const token = await encryptionService.encrypt(JSON.stringify(parsedTokenObject.data));

  return {
    success: true,
    message: "Token created",
    data: token,
  };
}

/**
 * Validate a file token and return the token data
 * @param token - The token to validate
 */
export async function ValidateFileToken(
  token: string,
): Promise<ActionResponseSchema<z.infer<typeof Schema_FileToken>>> {
  const decryptedToken = await encryptionService.decrypt(token);
  const parsedToken = Schema_FileToken.safeParse(JSON.parse(decryptedToken));
  if (!parsedToken.success)
    return {
      success: false,
      message: "Failed to validate token",
      error: parsedToken.error.message,
    };
  const currentTime = Date.now();
  if (parsedToken.data.exp < currentTime)
    return {
      success: false,
      message: "Token expired",
      error: "Download URL expired",
    };

  return {
    success: true,
    message: "Token validated",
    data: parsedToken.data,
  };
}
