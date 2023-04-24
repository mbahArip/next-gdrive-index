import crypto from "crypto";

export function generateRandomEncryptionKey(): Promise<string> {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(32, (err, buffer) => {
      if (err) {
        reject(err);
      }
      resolve(buffer.toString("hex"));
    });
  });
}

export function createEncryptionKey(passphrase: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16); // generate a random salt
    const iterations = 100000; // number of PBKDF2 iterations
    const keyLength = 32; // desired key length in bytes

    crypto.pbkdf2(
      passphrase,
      salt,
      iterations,
      keyLength,
      "sha256",
      (err, derivedKey) => {
        if (err) throw reject(err);
        const encryptionKey = derivedKey.toString("hex");
        resolve(encryptionKey);
      },
    );
  });
}

export function encrypt(data: string, encryptionKey: string) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(encryptionKey, "hex"),
    iv,
  );
  let encrypted = cipher.update(data);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString("hex") + ":" + encrypted.toString("hex");
}

export function decrypt(encryptedData: string, encryptionKey: string) {
  const [ivString, encryptedString] = encryptedData.split(":");
  const iv = Buffer.from(ivString, "hex");
  const encrypted = Buffer.from(encryptedString, "hex");
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(encryptionKey, "hex"),
    iv,
  );
  let decrypted = decipher.update(encrypted);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}
