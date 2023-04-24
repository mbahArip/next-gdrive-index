import { createHash } from "crypto";

export function hashToken(text: string): string {
  return createHash("sha256").update(text).digest("hex");
}

export function verifyHash(text: string, hash: string): boolean {
  return hashToken(text) === hash;
}
