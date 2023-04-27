import { createHash } from "crypto";

export function hashToken(text: string): string {
  return createHash("sha256").update(text).digest("hex");
}

export function verifyHash(text: string, hash: string): boolean {
  return hashToken(text) === hash;
}

// It's not a good idea to use this.
// Change this to jwt or something else.
export function reverseString(str: string): string {
  return str.split("").reverse().join("");
}
