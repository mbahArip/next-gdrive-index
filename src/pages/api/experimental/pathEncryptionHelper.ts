import crypto from "node:crypto";

const iv = crypto.randomBytes(16);
const key = "thisisa16bytekey";
export function encryptString(plainText: string): string {
  const cipher = crypto.createCipheriv("aes-128-cbc", key, iv);
  let cipherText = cipher.update(plainText, "utf8", "hex");
  cipherText += cipher.final("hex");
  return cipherText;
}

export function decryptString(chiperText: string): string {
  const decipher = crypto.createDecipheriv("aes-128-cbc", key, iv);
  let plainText = decipher.update(chiperText, "hex", "utf8");
  plainText += decipher.final("utf8");
  return plainText;
}
