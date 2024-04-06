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

export async function encryptData(data: string): Promise<string> {
  const cipher = crypto.createCipheriv("aes-128-cbc", key, iv);
  return Buffer.concat([cipher.update(data, "utf-8"), cipher.final()]).toString(
    "hex",
  );
}

export async function decryptData(hash: string): Promise<string> {
  try {
    const decipher = crypto.createDecipheriv("aes-128-cbc", key, iv);

    return Buffer.concat([
      decipher.update(hash, "hex"),
      decipher.final(),
    ]).toString("utf-8");
  } catch (error) {
    return "";
  }
}
