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
