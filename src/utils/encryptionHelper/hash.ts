"use server";

import crypto from "crypto";

const generateKey = () => {
  const env = process.env.ENCRYPTION_KEY;
  let data = !env
    ? "next-drive-index"
    : env.length < 16
    ? env.padEnd(16, "0")
    : env.length > 16
    ? env.slice(0, 16)
    : env;
  return data;
};
const key = generateKey();
const iv = Buffer.from(key);

export async function encryptData(
  data: string,
  encryptKey: string = key,
  ivKey: Buffer = iv,
): Promise<string> {
  try {
    const cipher = crypto.createCipheriv("aes-128-cbc", encryptKey, ivKey);
    return Buffer.concat([
      cipher.update(data, "utf-8"),
      cipher.final(),
    ]).toString("hex");
  } catch (error) {
    const e = error as Error;
    console.error(e.message);
    throw new Error(e.message);
  }
}

export async function decryptData(
  hash: string,
  encryptKey: string = key,
  ivKey: Buffer = iv,
): Promise<string> {
  try {
    const decipher = crypto.createDecipheriv("aes-128-cbc", encryptKey, ivKey);

    return Buffer.concat([
      decipher.update(hash, "hex"),
      decipher.final(),
    ]).toString("utf-8");
  } catch (error) {
    const e = error as Error;
    console.error(e.message);
    throw new Error(
      "Failed to decrypt data, either invalid hash or encryption key.",
    );
  }
}
