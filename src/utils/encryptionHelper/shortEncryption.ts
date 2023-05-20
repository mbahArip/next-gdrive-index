import crypto from "crypto";

const key =
  (process.env.NEXT_PUBLIC_ENCRYPTION_KEY as string).slice(
    0,
    16,
  ) || "";
const iv = Buffer.from(key);

function encrypt(data: string): string {
  const cipher = crypto.createCipheriv(
    "aes-128-cbc",
    key,
    iv,
  );
  const encrypted = Buffer.concat([
    cipher.update(data, "utf-8"),
    cipher.final(),
  ]);
  return encrypted.toString("hex");
}

function decrypt(encryptedData: string): string {
  if (!encryptedData) return "";

  const decipher = crypto.createDecipheriv(
    "aes-128-cbc",
    key,
    iv,
  );
  const decrypted = Buffer.concat([
    decipher.update(encryptedData, "hex"),
    decipher.final(),
  ]);

  return decrypted.toString();
}

const shortEncryption = {
  encrypt,
  decrypt,
};

export default shortEncryption;
