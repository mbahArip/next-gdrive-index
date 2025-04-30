import { decodeBase64, decodeBase64url, encodeBase64, encodeBase64url } from "@oslojs/encoding";
import { type GoogleAuth } from "google-auth-library";
import { type JSONClient } from "google-auth-library/build/src/auth/googleauth";
import { type drive_v3, google } from "googleapis";
import "server-only";

import { Schema_ServiceAccount } from "~/types/schema";

class EncryptionService {
  private key: string;
  private delimiter = ";";
  constructor() {
    if (!process.env.ENCRYPTION_KEY) {
      throw new Error("ENCRYPTION_KEY is required in the environment variables.");
    }
    this.key = process.env.ENCRYPTION_KEY;
  }

  async encrypt(data: string, forceKey?: string): Promise<string> {
    try {
      if (!crypto) throw new Error("Crypto Web API is not available in this environment.");

      const iv = crypto.getRandomValues(new Uint8Array(12));
      const alg = { name: "AES-GCM", iv };
      const keyhash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(forceKey ?? this.key));

      const encodedData = new TextEncoder().encode(data);
      const secretKey = await crypto.subtle.importKey("raw", keyhash, alg, false, ["encrypt"]);

      const encryptedData = await crypto.subtle.encrypt(alg, secretKey, encodedData);

      return [Buffer.from(encryptedData).toString("hex"), Buffer.from(iv).toString("hex")].join(this.delimiter);
    } catch (error) {
      const e = error as Error;
      console.error(`[EncryptionService.encrypt] ${e.message}`);
      throw new Error(`[EncryptionService.encrypt] ${e.message}`);
    }
  }

  async decrypt(hash: string, forceKey?: string): Promise<string> {
    try {
      if (!crypto) throw new Error("Crypto Web API is not available in this environment.");

      const [cipherText, iv] = hash.split(this.delimiter);
      if (!cipherText || !iv) throw new Error("Invalid hash format.");

      const alg = { name: "AES-GCM", iv: new Uint8Array(Buffer.from(iv, "hex")) };
      const keyhash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(forceKey ?? this.key));

      const secretKey = await crypto.subtle.importKey("raw", keyhash, alg, false, ["decrypt"]);

      const decryptedData = await crypto.subtle.decrypt(alg, secretKey, new Uint8Array(Buffer.from(cipherText, "hex")));

      return new TextDecoder().decode(decryptedData);
    } catch (error) {
      const e = error as Error;
      console.error(`[EncryptionService.decrypt] ${e.message}`);
      throw new Error(`[EncryptionService.decrypt] ${e.message}`);
    }
  }
}

type B64Type = "url" | "standard";
export const base64Encode = (text: string, type: B64Type = "url") => {
  const data = new TextEncoder().encode(text);
  if (type === "standard") return encodeBase64(data);
  return encodeBase64url(data);
};
export const base64Decode = <T = unknown>(encoded: string, type: B64Type = "url"): T | null => {
  try {
    let decoded: Uint8Array<ArrayBufferLike>;
    if (type === "standard") decoded = decodeBase64(encoded);
    else decoded = decodeBase64url(encoded);
    return new TextDecoder().decode(decoded) as T;
  } catch (error) {
    const e = error as Error;
    console.error(`[base64Decode] ${e.message}`);
    return null;
  }
};

class GoogleDriveService {
  private auth: GoogleAuth<JSONClient>;
  public gdrive: drive_v3.Drive;
  public gdriveNoCache: drive_v3.Drive;

  constructor() {
    const decodedB64 = base64Decode<string>(process.env.GD_SERVICE_B64!);
    if (!decodedB64) throw new Error("Failed to decode GD_SERVICE_B64");
    const parsedAuth = Schema_ServiceAccount.safeParse(JSON.parse(decodedB64));
    if (!parsedAuth.success) throw new Error("Failed to parse service account");

    this.auth = new google.auth.GoogleAuth({
      credentials: {
        type: "service_account",
        private_key: parsedAuth.data.private_key,
        client_email: parsedAuth.data.client_email,
        client_id: parsedAuth.data.client_id,
      },
      projectId: parsedAuth.data.project_id,
      scopes: ["https://www.googleapis.com/auth/drive"],
    });
    if (!this.auth) throw new Error("Failed to initialize Google Auth");
    this.gdrive = google.drive({
      version: "v3",
      auth: this.auth,
    });
    this.gdriveNoCache = google.drive({
      version: "v3",
      auth: this.auth,
      fetchImplementation: (url, init) =>
        fetch(url as string | URL, {
          ...init,
          cache: "no-store",
        }),
    });
  }
}

export const { gdrive, gdriveNoCache } = new GoogleDriveService();
export const encryptionService = new EncryptionService();
