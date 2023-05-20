import crypto from "crypto";

function encrypt(
  data: string,
  key: string = process.env
    .NEXT_PUBLIC_ENCRYPTION_KEY as string,
): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(key, "hex"),
    iv,
  );
  const encrypted = Buffer.concat([
    cipher.update(data),
    cipher.final(),
  ]);

  return (
    iv.toString("hex") + ":" + encrypted.toString("hex")
  );
}

function decrypt(
  encryptedData: string,
  key: string = process.env
    .NEXT_PUBLIC_ENCRYPTION_KEY as string,
): string {
  if (!encryptedData) return "";

  const [ivString, encryptedString] =
    encryptedData.split(":");
  const iv = Buffer.from(ivString, "hex");
  const encrypted = Buffer.from(encryptedString, "hex");
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(key, "hex"),
    iv,
  );
  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);

  return decrypted.toString();
}

const longEncryption = {
  encrypt,
  decrypt,
};
export default longEncryption;
