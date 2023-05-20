import crypto from "crypto";

function createEncryptionKey(
  password: string,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16); // generate a random salt
    const iterations = 100000; // number of PBKDF2 iterations
    const keyLength = 32; // desired key length in bytes

    crypto.pbkdf2(
      password,
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

export default createEncryptionKey;
