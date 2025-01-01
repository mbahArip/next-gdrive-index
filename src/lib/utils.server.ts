import { decodeBase64url, encodeBase64url } from "@oslojs/encoding";
import { GoogleAuth } from "google-auth-library";
import { JSONClient } from "google-auth-library/build/src/auth/googleauth";
import { drive_v3, google } from "googleapis";
import "server-only";

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
      const keyhash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(forceKey ? forceKey : this.key));

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
      const keyhash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(forceKey ? forceKey : this.key));

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

const base64Encode = (text: string) => {
  const data = new TextEncoder().encode(text);
  return encodeBase64url(data);
};
const base64Decode = <T = unknown>(encoded: string): T => {
  const decoded = decodeBase64url(encoded);
  return new TextDecoder().decode(decoded) as T;
};

type ServiceAccount = {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
  universe_domain: string;
};
class GoogleDriveService {
  private auth: GoogleAuth<JSONClient>;
  public gdrive: drive_v3.Drive;
  public gdriveNoCache: drive_v3.Drive;

  constructor() {
    const decodedBase64 = JSON.parse(base64Decode<string>(process.env.GD_SERVICE_B64!)) as ServiceAccount;
    this.auth = new google.auth.GoogleAuth({
      credentials: {
        type: "service_account",
        private_key: decodedBase64.private_key,
        client_email: decodedBase64.client_email,
        client_id: decodedBase64.client_id,
      },
      projectId: decodedBase64.project_id,
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
        fetch(url, {
          ...init,
          cache: "no-store",
        }),
    });
  }
}

export const { gdrive, gdriveNoCache } = new GoogleDriveService();
export const encryptionService = new EncryptionService();
