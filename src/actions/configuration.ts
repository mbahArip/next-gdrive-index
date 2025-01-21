"use server";

import { type ActionResponseSchema } from "~/types";

import { base64Decode, base64Encode } from "~/lib/utils.server";

export async function GenerateServiceAccountB64(serviceAccount: string): Promise<ActionResponseSchema<string>> {
  const b64 = base64Encode(serviceAccount, "standard");

  // Test
  const decoded = base64Decode(b64, "standard");
  if (decoded !== serviceAccount) {
    return {
      success: false,
      message: "Encode failed to match the original string",
      error: "Something went wrong while testing the encoding, please try again",
    };
  }

  return {
    success: true,
    message: "Service account generated",
    data: b64,
  };
}
