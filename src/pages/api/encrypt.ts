import { NextApiRequest, NextApiResponse } from "next";
import { ErrorResponse } from "types/googleapis";
import { ExtendedError } from "utils/driveHelper";
import {
  decrypt,
  encrypt,
  urlDecrypt,
  urlEncrypt,
} from "utils/encryptionHelper";

export default function handler(
  request: NextApiRequest,
  response: NextApiResponse,
) {
  const _start = Date.now();
  try {
    const { text, isUrl, isDecrypt } = request.query;
    if (!text) throw new ExtendedError("Missing text", 400, "missingText");

    let encrypted;
    let decrypted;
    if (!isDecrypt) {
      if (isUrl) {
        const encodedText = encodeURIComponent(text as string);
        encrypted = urlEncrypt(encodedText);
      } else {
        const encodedText = encodeURIComponent(text as string);
        encrypted = encrypt(encodedText);
      }
    } else {
      if (isUrl) {
        decrypted = decodeURIComponent(urlDecrypt(text as string));
      } else {
        decrypted = decodeURIComponent(decrypt(text as string));
      }
    }

    const payload = {
      success: true,
      timestamp: new Date().toISOString(),
      responseTime: Date.now() - _start,
      data: {
        isDecrypt: !!isDecrypt,
        isUrl: !!isUrl,
        encrypted,
        decrypted,
      },
    };

    return response.status(200).json(payload);
  } catch (error: any) {
    const payload: ErrorResponse = {
      success: false,
      timestamp: new Date().toISOString(),
      responseTime: Date.now() - _start,
      code: error.code || 500,
      errors: {
        message: error.errors?.[0].message || error.message || "Unknown error",
        reason: error.errors?.[0].reason || error.cause || "internalError",
      },
    };

    return response.status(payload.code || 500).json(payload);
  }
}
