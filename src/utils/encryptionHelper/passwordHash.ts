import { createHash } from "crypto";

function encode(text: string): string {
  return createHash("sha256").update(text).digest("hex");
}

function verify(text: string, hash: string): boolean {
  return encode(text) === hash;
}

function compare(hash1: string, hash2: string): boolean {
  return hash1 === hash2;
}

const passwordHash = {
  encode,
  verify,
  compare,
};

export default passwordHash;
